"""Orchestrate PGN feature, prediction, explanation, and coaching stages."""

import io
import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

import chess.pgn
import pandas as pd

from app.services.player_analysis import (
    analyze_player_positions,
    calculate_player_strength,
    extract_player_features,
    get_endgame_report,
    get_middlegame_report,
    get_opening_report,
    get_player_statistics,
    get_positional_statistics,
)
from app.services.style_engine import detect_player_style
from app.services.upload_service import extract_games
from app.services.weakness_engine import (
    detect_player_weaknesses,
    detect_strengths,
    detect_weaknesses,
    generate_recommendations,
    generate_training_plan,
)
from ml.coach import generate_coach_report
from ml.explain import explain_dataframe
from ml.pattern_mining import generate_pattern_report
from ml.predict import predict_dataframe

PipelineStage = str
ProgressCallback = Callable[["PipelineProgress"], None]
CancelCheck = Callable[[], bool]
logger = logging.getLogger(__name__)

PIPELINE_STAGES: tuple[str, ...] = (
    "queued",
    "parsing_pgn",
    "extracting_features",
    "stockfish_analysis",
    "ml_prediction",
    "shap_analysis",
    "pattern_mining",
    "coaching",
    "completed",
)


@dataclass(frozen=True)
class PipelineProgress:
    """One real progress event emitted by the end-to-end analysis pipeline."""

    stage: PipelineStage
    stage_progress: float
    completed_units: int
    total_units: int
    unit: str
    current_game: int
    completed_positions: int
    total_positions: int
    total_games: int


class PipelineStageError(RuntimeError):
    """Raised when one named pipeline stage fails with an actionable message."""

    def __init__(self, stage: str, message: str) -> None:
        self.stage = stage
        self.message = message
        super().__init__(f"{stage.replace('_', ' ').title()} failed: {message}")


class PipelineCancelledError(RuntimeError):
    """Raised when a background job receives a cooperative cancel request."""


def _count_games_and_positions(
    pgn_text: str,
    on_game: Callable[[int], None] | None = None,
) -> tuple[int, list[int]]:
    """Parse headers/mainlines without running Stockfish and count each game's plies."""
    moves_per_game: list[int] = []
    stream = io.StringIO(pgn_text)

    while True:
        game = chess.pgn.read_game(stream)
        if game is None:
            break
        if game.errors:
            first_error = str(game.errors[0])
            raise ValueError(f"Invalid PGN in game {len(moves_per_game) + 1}: {first_error}")

        moves_per_game.append(sum(1 for _ in game.mainline_moves()))
        if on_game is not None:
            on_game(len(moves_per_game))

    return len(moves_per_game), moves_per_game


def _phase_report(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Run legacy report aggregations once for backwards-compatible fields."""
    player_statistics = get_player_statistics(rows)
    positional_statistics = get_positional_statistics(rows)
    opening_report = get_opening_report(rows)
    middlegame_report = get_middlegame_report(rows)
    endgame_report = get_endgame_report(rows)
    style = detect_player_style(rows)
    weaknesses = detect_weaknesses(rows)
    strengths = detect_strengths(rows)
    training_plan = generate_training_plan(
        rows,
        opening_report,
        middlegame_report,
        endgame_report,
        strengths,
        weaknesses,
        style,
    )
    strength_scores = calculate_player_strength(rows)
    player_weaknesses = detect_player_weaknesses(rows)
    recommendations = generate_recommendations(rows)

    return {
        "player_statistics": player_statistics,
        "positional_statistics": positional_statistics,
        "strength_scores": strength_scores,
        "opening_report": opening_report,
        "middlegame_report": middlegame_report,
        "endgame_report": endgame_report,
        "style": style,
        "weaknesses": weaknesses,
        "player_weaknesses": player_weaknesses,
        "strengths": strengths,
        "recommendations": recommendations,
        "training_plan": training_plan,
    }


def analyze_games(
    pgn_text: str,
    *,
    depth: int = 12,
    filename: str | None = None,
    file_size_bytes: int | None = None,
    progress_callback: ProgressCallback | None = None,
    cancel_check: CancelCheck | None = None,
) -> dict[str, Any]:
    """Run the complete PGN → feature → ML → SHAP → pattern → coaching flow.

    The callback receives stage-specific progress. Cancellation is checked
    between stages and for every feature/Stockfish position callback.
    """
    total_games = 0
    total_positions = 0
    current_game = 0

    def emit(
        stage: str,
        progress: float,
        completed_units: int = 0,
        total_units: int = 1,
        unit: str = "stage",
        game_number: int = 0,
    ) -> None:
        nonlocal current_game
        if cancel_check is not None and cancel_check():
            raise PipelineCancelledError("Analysis cancelled by request.")
        if game_number:
            current_game = game_number
        if progress_callback is not None:
            if unit in {"feature_position", "position"}:
                completed_positions = completed_units
            elif stage == "stockfish_analysis" and unit == "game_summary":
                completed_positions = total_positions
            elif stage in {
                "ml_prediction",
                "shap_analysis",
                "pattern_mining",
                "coaching",
                "completed",
            }:
                completed_positions = total_positions
            else:
                completed_positions = 0
            progress_callback(
                PipelineProgress(
                    stage=stage,
                    stage_progress=max(0.0, min(progress, 1.0)),
                    completed_units=completed_units,
                    total_units=total_units,
                    unit=unit,
                    current_game=current_game,
                    completed_positions=completed_positions,
                    total_positions=total_positions,
                    total_games=total_games,
                )
            )

    def run_stage(stage: str, operation: Callable[[], Any]) -> Any:
        try:
            return operation()
        except (PipelineCancelledError, PipelineStageError):
            raise
        except Exception as exc:
            message = str(exc).strip() or type(exc).__name__
            raise PipelineStageError(stage, message) from exc

    logger.info("Starting PGN analysis pipeline")
    emit("queued", 0.0)
    emit("parsing_pgn", 0.0, unit="game", total_units=0)

    def parse_pgn() -> tuple[int, list[int]]:
        return _count_games_and_positions(
            pgn_text,
            on_game=lambda completed: emit(
                "parsing_pgn",
                0.0,
                completed_units=completed,
                total_units=0,
                unit="game",
                game_number=completed,
            ),
        )

    total_games, moves_per_game = run_stage("parsing_pgn", parse_pgn)
    if total_games == 0:
        raise PipelineStageError(
            "parsing_pgn", "No games found. Check that the upload contains valid PGN text."
        )
    total_positions = sum(moves_per_game)
    if total_positions == 0:
        raise PipelineStageError(
            "parsing_pgn", "The PGN contains games but no playable moves."
        )
    emit(
        "parsing_pgn",
        1.0,
        completed_units=total_games,
        total_units=total_games,
        unit="game",
        game_number=total_games,
    )
    logger.info(
        "Parsed PGN: %d games and %d positions", total_games, total_positions
    )

    emit("extracting_features", 0.0, total_units=total_positions, unit="feature_position")
    pending_positions = run_stage(
        "extracting_features",
        lambda: extract_player_features(
            pgn_text,
            on_progress=lambda game_number, completed: emit(
                "extracting_features",
                completed / total_positions,
                completed_units=completed,
                total_units=total_positions,
                unit="feature_position",
                game_number=game_number,
            ),
        ),
    )
    if len(pending_positions) != total_positions:
        raise PipelineStageError(
            "extracting_features",
            f"Expected {total_positions} feature rows but extracted {len(pending_positions)}.",
        )
    emit(
        "extracting_features",
        1.0,
        completed_units=total_positions,
        total_units=total_positions,
        unit="feature_position",
        game_number=total_games,
    )

    emit(
        "stockfish_analysis",
        0.0,
        total_units=total_positions,
        unit="position",
    )

    rows = run_stage(
        "stockfish_analysis",
        lambda: analyze_player_positions(
            pending_positions,
            depth=depth,
            on_progress=lambda game_number, completed: emit(
                "stockfish_analysis",
                0.95 * completed / total_positions,
                completed_units=completed,
                total_units=total_positions,
                unit="position",
                game_number=game_number,
            ),
        ),
    )
    if not rows:
        raise PipelineStageError(
            "stockfish_analysis", "No move positions were available for engine analysis."
        )

    game_summaries = run_stage(
        "stockfish_analysis",
        lambda: extract_games(
            pgn_text,
            on_progress=lambda completed_games: emit(
                "stockfish_analysis",
                0.95 + 0.05 * completed_games / total_games,
                completed_units=completed_games,
                total_units=total_games,
                unit="game_summary",
                game_number=completed_games,
            ),
        ),
    )
    emit(
        "stockfish_analysis",
        1.0,
        completed_units=total_positions,
        total_units=total_positions,
        unit="position",
        game_number=total_games,
    )

    dataframe = pd.DataFrame(rows)

    emit("ml_prediction", 0.0)
    predictions = run_stage(
        "ml_prediction", lambda: predict_dataframe(dataframe)
    )
    if len(predictions) != len(dataframe):
        raise PipelineStageError(
            "ml_prediction", "Prediction count does not match extracted positions."
        )
    emit("ml_prediction", 1.0)

    emit("shap_analysis", 0.0)
    explanations = run_stage(
        "shap_analysis",
        lambda: explain_dataframe(dataframe, predictions=predictions),
    )
    emit("shap_analysis", 1.0)

    emit("pattern_mining", 0.0)
    pattern_report = run_stage(
        "pattern_mining",
        lambda: generate_pattern_report(dataframe, predictions=predictions),
    )
    emit("pattern_mining", 1.0)

    emit("coaching", 0.0)
    coach_report = run_stage(
        "coaching", lambda: generate_coach_report(pattern_report)
    )
    legacy_report = run_stage("coaching", lambda: _phase_report(rows))
    result: dict[str, Any] = {
        "upload_summary": {
            "filename": filename,
            "games_detected": len(game_summaries),
            "file_size_bytes": file_size_bytes,
            "games": game_summaries,
        },
        "player_statistics": legacy_report["player_statistics"],
        "strength_scores": legacy_report["strength_scores"],
        "style": legacy_report["style"],
        "predictions": predictions,
        "explanations": explanations,
        "patterns": pattern_report,
        "coach_report": coach_report,
        # Preserve fields consumed by earlier report clients.
        "positional_statistics": legacy_report["positional_statistics"],
        "opening_report": legacy_report["opening_report"],
        "middlegame_report": legacy_report["middlegame_report"],
        "endgame_report": legacy_report["endgame_report"],
        "weaknesses": legacy_report["weaknesses"],
        "player_weaknesses": legacy_report["player_weaknesses"],
        "strengths": legacy_report["strengths"],
        "recommendations": legacy_report["recommendations"],
        "training_plan": legacy_report["training_plan"],
    }
    emit("completed", 1.0, completed_units=1, total_units=1)
    return result
