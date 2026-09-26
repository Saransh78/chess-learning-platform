"""Mine recurring, structured playing patterns from position-analysis rows.

Run from the backend directory to write the default report:

    python -m ml.pattern_mining ../all_38positionsss.csv

The report is descriptive machine-readable data; it does not generate coaching
text or call the model-training pipeline.
"""

import argparse
import json
import math
from dataclasses import asdict, dataclass
from pathlib import Path
from statistics import fmean
from typing import Any

import pandas as pd

from app.services.player_analysis import (
    _MATE_CPL_CUTOFF,
    _valid_cpl,
    get_player_statistics,
    get_positional_statistics,
)
from ml.predict import DEFAULT_MODEL_DIR, predict_dataframe
from ml.preprocess import BACKEND_DIR, load_feature_schema, validate_and_select_features

DEFAULT_REPORT_PATH: Path = BACKEND_DIR / "models" / "pattern_report.json"


@dataclass(frozen=True)
class PatternThresholds:
    """Configurable definitions and minimum support for mined patterns.

    ``mistake_cpl`` and ``blunder_cpl`` are centipawns. Mistake counts include
    blunders; blunders are the subset at or above ``blunder_cpl``.
    """

    mistake_cpl: float = 100.0
    blunder_cpl: float = 300.0
    minimum_sample_size: int = 20
    minimum_cpl_delta: float = 10.0
    cpl_severity_scale: float = 300.0
    pawn_island_fragmentation: int = 5

    def __post_init__(self) -> None:
        float_thresholds = (
            self.mistake_cpl,
            self.blunder_cpl,
            self.minimum_cpl_delta,
            self.cpl_severity_scale,
        )
        if not all(math.isfinite(value) for value in float_thresholds):
            raise ValueError("Numeric pattern thresholds must be finite.")
        if self.mistake_cpl < 0 or self.blunder_cpl < self.mistake_cpl:
            raise ValueError("CPL thresholds must satisfy 0 <= mistake_cpl <= blunder_cpl.")
        if self.minimum_sample_size < 1:
            raise ValueError("minimum_sample_size must be at least 1.")
        if self.minimum_cpl_delta < 0:
            raise ValueError("minimum_cpl_delta cannot be negative.")
        if self.cpl_severity_scale <= 0:
            raise ValueError("cpl_severity_scale must be positive.")
        if self.pawn_island_fragmentation < 1:
            raise ValueError("pawn_island_fragmentation must be at least 1.")


MOVE_RANGES: tuple[tuple[str, int, int | None], ...] = (
    ("1-10", 1, 10),
    ("11-20", 11, 20),
    ("21-30", 21, 30),
    ("31-40", 31, 40),
    ("41+", 41, None),
)
PHASE_NAMES: tuple[str, ...] = ("Opening", "Middlegame", "Endgame")


def _number(value: Any) -> float | None:
    """Return a finite Python float or ``None`` for missing/non-finite values."""
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _mean_or_none(values: list[float]) -> float | None:
    """Compute a finite mean for a non-empty sequence."""
    return fmean(values) if values else None


def _valid_position_rows(dataframe: pd.DataFrame) -> list[dict[str, Any]]:
    """Reuse the existing player-analysis CPL filter for scored positions."""
    return _valid_cpl(dataframe.to_dict(orient="records"))


def _evaluation_loss_pawns(rows: list[dict[str, Any]]) -> float | None:
    """Mean side-relative drop from the pre-move to played-move evaluation.

    FEN and engine evaluations use White's perspective. The active side is
    taken from the FEN turn field. Positive values therefore represent an
    evaluation loss for the player making the move, measured in pawn units.
    """
    losses: list[float] = []
    for row in rows:
        fen = row.get("FEN")
        current = _number(row.get("CurrentEvaluation"))
        played = _number(row.get("PlayedEvaluation"))
        if current is None or played is None or not isinstance(fen, str):
            continue
        if abs(current) >= 9000 or abs(played) >= 9000:
            continue

        fields = fen.split()
        if len(fields) < 2 or fields[1] not in {"w", "b"}:
            continue

        loss = current - played if fields[1] == "w" else played - current
        losses.append(max(0.0, loss))

    return _mean_or_none(losses)


def _aggregate_positions(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
) -> dict[str, Any]:
    """Summarize position quality while reusing established analysis metrics."""
    records = dataframe.to_dict(orient="records")
    valid_rows = _valid_position_rows(dataframe)
    scored_count = len(valid_rows)
    mistake_count = sum(
        float(row["CentipawnLoss"]) >= thresholds.mistake_cpl for row in valid_rows
    )
    blunder_count = sum(
        float(row["CentipawnLoss"]) >= thresholds.blunder_cpl for row in valid_rows
    )

    # Existing reports own the accepted CPL mate filter and mean-mobility logic.
    positional_stats = get_positional_statistics(records) if records else {}
    confidence_values = [
        number
        for number in (_number(row.get("_prediction_confidence")) for row in records)
        if number is not None
    ]
    cpl_values = [float(row["CentipawnLoss"]) for row in valid_rows]

    return {
        "positions": len(dataframe),
        "sample_size": scored_count,
        "average_centipawn_loss": _number(positional_stats.get("Average CPL")),
        "mistake_count": mistake_count,
        "mistake_rate": mistake_count / scored_count if scored_count else None,
        "blunder_count": blunder_count,
        "blunder_rate": blunder_count / scored_count if scored_count else None,
        "average_confidence": _mean_or_none(confidence_values),
        "average_mobility": _number(positional_stats.get("Average Mobility")),
        "average_evaluation_loss": _evaluation_loss_pawns(valid_rows),
        "average_cpl_unrounded": _mean_or_none(cpl_values),
    }


def _group_rows_by_labels(
    dataframe: pd.DataFrame,
    labels: pd.Series,
    all_labels: list[str],
) -> dict[str, pd.DataFrame]:
    """Return groups in a supplied stable order, including empty groups."""
    return {
        label: dataframe.loc[labels == label]
        for label in all_labels
    }


def _add_pattern(
    patterns: list[dict[str, Any]],
    pattern: str,
    metrics: dict[str, Any],
    thresholds: PatternThresholds,
    event_count_key: str = "mistake_count",
) -> None:
    """Append a severity-ranked pattern with explicit small-sample shrinkage."""
    sample_size = int(metrics["sample_size"])
    average_cpl = _number(metrics.get("average_centipawn_loss")) or 0.0
    event_count = int(metrics.get(event_count_key, 0))
    event_rate = event_count / sample_size if sample_size else 0.0

    confidence = sample_size / (sample_size + thresholds.minimum_sample_size)
    recurring_frequency = min(event_count / thresholds.minimum_sample_size, 1.0)
    frequency_component = recurring_frequency * event_rate
    cpl_component = min(average_cpl / thresholds.cpl_severity_scale, 1.0)
    severity_score = 100.0 * (
        0.55 * frequency_component + 0.45 * cpl_component
    ) * confidence

    patterns.append(
        {
            "pattern": pattern,
            "sample_size": sample_size,
            "severity_score": round(severity_score, 4),
            "confidence": round(confidence, 4),
            "metrics": metrics,
            "sample_status": (
                "adequate"
                if sample_size >= thresholds.minimum_sample_size
                else "small_sample"
            ),
        }
    )


def _phase_analysis(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Summarize opening, middlegame, and endgame groups."""
    groups = _group_rows_by_labels(
        dataframe,
        dataframe["GamePhase"].astype(str),
        list(PHASE_NAMES),
    )
    phase_metrics = {
        phase: _aggregate_positions(group, thresholds)
        for phase, group in groups.items()
    }
    candidates = [
        (phase, metrics)
        for phase, metrics in phase_metrics.items()
        if metrics["sample_size"] >= thresholds.minimum_sample_size
    ]
    if not candidates:
        candidates = [
            (phase, metrics)
            for phase, metrics in phase_metrics.items()
            if metrics["sample_size"] > 0
        ]
    weakest_phase = None
    if candidates:
        weakest_phase, weakest_metrics = max(
            candidates,
            key=lambda item: (
                item[1]["blunder_rate"] or 0.0,
                item[1]["average_centipawn_loss"] or 0.0,
                item[1]["sample_size"],
            ),
        )
        _add_pattern(
            patterns,
            f"weakest_game_phase:{weakest_phase}",
            weakest_metrics,
            thresholds,
            event_count_key="blunder_count",
        )

    return {
        "phases": phase_metrics,
        "weakest_phase": weakest_phase,
        "weakest_phase_reason": (
            "highest blunder rate, then highest average CPL"
            if weakest_phase is not None
            else None
        ),
    }


def _move_range_analysis(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Measure move-quality metrics over fixed fullmove-number ranges."""
    move_number = pd.to_numeric(dataframe["MoveNumber"], errors="coerce")
    labels = pd.Series(index=dataframe.index, dtype="object")
    for name, lower, upper in MOVE_RANGES:
        mask = move_number >= lower
        if upper is not None:
            mask &= move_number <= upper
        labels.loc[mask] = name

    groups = _group_rows_by_labels(dataframe, labels, [item[0] for item in MOVE_RANGES])
    ranges: dict[str, dict[str, Any]] = {}
    for name, group in groups.items():
        metrics = _aggregate_positions(group, thresholds)
        ranges[name] = {
            "positions": metrics["positions"],
            "sample_size": metrics["sample_size"],
            "mistake_count": metrics["mistake_count"],
            "blunder_count": metrics["blunder_count"],
            "average_cpl": metrics["average_centipawn_loss"],
            "average_evaluation_loss": metrics["average_evaluation_loss"],
            "mistake_rate": metrics["mistake_rate"],
            "blunder_rate": metrics["blunder_rate"],
        }

    candidates = [
        (name, metrics)
        for name, metrics in ranges.items()
        if metrics["sample_size"] >= thresholds.minimum_sample_size
    ]
    if not candidates:
        candidates = [
            (name, metrics)
            for name, metrics in ranges.items()
            if metrics["sample_size"] > 0
        ]
    highest_risk_range = None
    if candidates:
        highest_risk_range, risk_metrics = max(
            candidates,
            key=lambda item: (
                item[1]["blunder_rate"] or 0.0,
                item[1]["average_cpl"] or 0.0,
                item[1]["sample_size"],
            ),
        )
        _add_pattern(
            patterns,
            f"highest_risk_move_range:{highest_risk_range}",
            risk_metrics,
            thresholds,
            event_count_key="blunder_count",
        )

    return {
        "ranges": ranges,
        "highest_risk_range": highest_risk_range,
        "risk_basis": "highest blunder rate, then highest average CPL",
    }


def _castling_analysis(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Compare castled and uncastled positions independently by color."""
    result: dict[str, Any] = {}
    for color in ("White", "Black"):
        column = f"{color}Castled"
        castled_rows = dataframe.loc[dataframe[column] == 1]
        uncastled_rows = dataframe.loc[dataframe[column] == 0]
        castled_metrics = _aggregate_positions(castled_rows, thresholds)
        uncastled_metrics = _aggregate_positions(uncastled_rows, thresholds)
        result[color] = {
            "castled": {
                "sample_size": castled_metrics["sample_size"],
                "average_evaluation_loss": castled_metrics["average_evaluation_loss"],
                "average_mobility": castled_metrics["average_mobility"],
                "blunder_frequency": castled_metrics["blunder_rate"],
                "blunder_count": castled_metrics["blunder_count"],
            },
            "uncastled": {
                "sample_size": uncastled_metrics["sample_size"],
                "average_evaluation_loss": uncastled_metrics["average_evaluation_loss"],
                "average_mobility": uncastled_metrics["average_mobility"],
                "blunder_frequency": uncastled_metrics["blunder_rate"],
                "blunder_count": uncastled_metrics["blunder_count"],
            },
        }

        castled_cpl = castled_metrics["average_centipawn_loss"]
        uncastled_cpl = uncastled_metrics["average_centipawn_loss"]
        adequately_sampled = min(
            castled_metrics["sample_size"], uncastled_metrics["sample_size"]
        ) >= thresholds.minimum_sample_size
        if (
            adequately_sampled
            and castled_cpl is not None
            and uncastled_cpl is not None
            and uncastled_cpl - castled_cpl >= thresholds.minimum_cpl_delta
        ):
            _add_pattern(
                patterns,
                f"{color.lower()}_uncastled_positions_have_higher_cpl",
                uncastled_metrics,
                thresholds,
            )

    return result


def _piece_activity_analysis(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
    patterns: list[dict[str, Any]],
    overall_average_cpl: float | None,
) -> dict[str, Any]:
    """Compare error metrics by remaining board counts for each piece type."""
    piece_columns = {
        "bishops": ("WhiteBishopCount", "BlackBishopCount"),
        "knights": ("WhiteKnightCount", "BlackKnightCount"),
        "rooks": ("WhiteRookCount", "BlackRookCount"),
        "queens": ("WhiteQueenCount", "BlackQueenCount"),
    }
    result: dict[str, Any] = {}

    for piece_name, columns in piece_columns.items():
        total_count = dataframe[columns[0]] + dataframe[columns[1]]
        count_labels = pd.Series(index=dataframe.index, dtype="object")
        count_labels.loc[total_count == 0] = "none"
        count_labels.loc[total_count == 1] = "one"
        count_labels.loc[total_count >= 2] = "two_or_more"
        groups = _group_rows_by_labels(
            dataframe, count_labels, ["none", "one", "two_or_more"]
        )
        count_groups = {
            label: _aggregate_positions(group, thresholds)
            for label, group in groups.items()
        }
        eligible_groups = [
            (label, metrics)
            for label, metrics in count_groups.items()
            if metrics["sample_size"] >= thresholds.minimum_sample_size
            and metrics["average_centipawn_loss"] is not None
        ]
        underperforming_group = None
        if eligible_groups:
            underperforming_group, worst_metrics = max(
                eligible_groups,
                key=lambda item: item[1]["average_centipawn_loss"],
            )
            if (
                overall_average_cpl is None
                or worst_metrics["average_centipawn_loss"]
                - overall_average_cpl
                < thresholds.minimum_cpl_delta
            ):
                underperforming_group = None
            else:
                _add_pattern(
                    patterns,
                    f"{piece_name}_count_group:{underperforming_group}",
                    worst_metrics,
                    thresholds,
                )

        result[piece_name] = {
            "count_groups": count_groups,
            "underperforming_group": underperforming_group,
            "interpretation": "remaining piece count, not engine-derived piece mobility",
        }

    return result


def _mobility_analysis(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Compare CPL and mistake rates across tie-preserving mobility quartiles."""
    if dataframe.empty:
        quartile_ids = pd.Series(index=dataframe.index, dtype="int64")
    else:
        rank_fraction = dataframe["Mobility"].rank(method="average", pct=True)
        quartile_ids = (
            (rank_fraction * 4).apply(math.ceil).clip(1, 4).astype(int)
        )
    labels = quartile_ids.map(lambda quartile: f"Q{quartile}")
    quartile_names = ["Q1", "Q2", "Q3", "Q4"]
    groups = _group_rows_by_labels(dataframe, labels, quartile_names)
    quartiles = {
        label: _aggregate_positions(group, thresholds)
        for label, group in groups.items()
    }

    lowest = quartiles["Q1"]
    highest = quartiles["Q4"]
    enough_data = min(lowest["sample_size"], highest["sample_size"]) >= (
        thresholds.minimum_sample_size
    )
    reduced_mobility_precedes_mistakes = bool(
        enough_data
        and lowest["average_centipawn_loss"] is not None
        and highest["average_centipawn_loss"] is not None
        and lowest["mistake_rate"] is not None
        and highest["mistake_rate"] is not None
        and lowest["average_centipawn_loss"]
        > highest["average_centipawn_loss"]
        and lowest["mistake_rate"] > highest["mistake_rate"]
    )
    if reduced_mobility_precedes_mistakes:
        _add_pattern(
            patterns,
            "lowest_mobility_quartile_has_more_mistakes",
            lowest,
            thresholds,
        )

    return {
        "quartiles": quartiles,
        "reduced_mobility_precedes_mistakes": reduced_mobility_precedes_mistakes,
        "comparison_status": (
            "supported"
            if enough_data
            else "insufficient_sample_size_in_one_or_both_extreme_quartiles"
        ),
    }


def _pawn_structure_analysis(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Compare mistakes for doubled, isolated, passed-pawn, and island states."""
    structure_values = {
        "doubled_pawns": dataframe["WhiteDoubledPawns"]
        + dataframe["BlackDoubledPawns"],
        "isolated_pawns": dataframe["WhiteIsolatedPawns"]
        + dataframe["BlackIsolatedPawns"],
        "passed_pawns": dataframe["WhitePassedPawns"]
        + dataframe["BlackPassedPawns"],
        "pawn_islands": dataframe["WhitePawnIslands"]
        + dataframe["BlackPawnIslands"],
    }
    result: dict[str, Any] = {}

    for feature_name, values in structure_values.items():
        labels = pd.Series(index=dataframe.index, dtype="object")
        if feature_name == "pawn_islands":
            labels.loc[values < thresholds.pawn_island_fragmentation] = "lower_island_count"
            labels.loc[values >= thresholds.pawn_island_fragmentation] = "fragmented"
        else:
            labels.loc[values == 0] = "absent"
            labels.loc[values > 0] = "present"

        group_names = (
            ["lower_island_count", "fragmented"]
            if feature_name == "pawn_islands"
            else ["absent", "present"]
        )
        groups = _group_rows_by_labels(dataframe, labels, group_names)
        group_metrics = {
            label: _aggregate_positions(group, thresholds)
            for label, group in groups.items()
        }
        present_label = "fragmented" if feature_name == "pawn_islands" else "present"
        absent_label = (
            "lower_island_count" if feature_name == "pawn_islands" else "absent"
        )
        present = group_metrics[present_label]
        absent = group_metrics[absent_label]
        present_cpl = present["average_centipawn_loss"]
        absent_cpl = absent["average_centipawn_loss"]
        underperforming = bool(
            present["sample_size"] >= thresholds.minimum_sample_size
            and absent["sample_size"] >= thresholds.minimum_sample_size
            and present_cpl is not None
            and absent_cpl is not None
            and present_cpl - absent_cpl >= thresholds.minimum_cpl_delta
        )
        if underperforming:
            _add_pattern(
                patterns,
                f"{feature_name}:{present_label}_has_higher_cpl",
                present,
                thresholds,
            )

        result[feature_name] = {
            "groups": group_metrics,
            "higher_cpl_group": present_label if underperforming else None,
            "mean_count": _mean_or_none([float(value) for value in values]),
        }

    return result


def _material_imbalance_analysis(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds,
    patterns: list[dict[str, Any]],
) -> dict[str, Any]:
    """Summarize bishop-pair, queenless, rook-ending, and major imbalance groups."""
    rook_total = dataframe["WhiteRookCount"] + dataframe["BlackRookCount"]
    bishop_total = dataframe["WhiteBishopCount"] + dataframe["BlackBishopCount"]
    knight_total = dataframe["WhiteKnightCount"] + dataframe["BlackKnightCount"]
    white_major = dataframe["WhiteRookCount"] * 5 + dataframe["WhiteQueenCount"] * 9
    black_major = dataframe["BlackRookCount"] * 5 + dataframe["BlackQueenCount"] * 9

    definitions: dict[str, pd.Series] = {
        "bishop_pair": (
            (dataframe["WhiteBishopPair"] + dataframe["BlackBishopPair"]) > 0
        ),
        "queenless": dataframe["QueensPresent"] == 0,
        "rook_endings": (
            (dataframe["QueensPresent"] == 0)
            & (rook_total > 0)
            & (bishop_total == 0)
            & (knight_total == 0)
        ),
        "major_piece_imbalance": (white_major - black_major).abs() > 0,
    }
    result: dict[str, Any] = {}

    for category, condition in definitions.items():
        labels = pd.Series(
            condition.map({True: "present", False: "absent"}),
            index=dataframe.index,
            dtype="object",
        )
        groups = _group_rows_by_labels(dataframe, labels, ["absent", "present"])
        group_metrics = {
            label: _aggregate_positions(group, thresholds)
            for label, group in groups.items()
        }
        present = group_metrics["present"]
        absent = group_metrics["absent"]
        present_cpl = present["average_centipawn_loss"]
        absent_cpl = absent["average_centipawn_loss"]
        underperforming = bool(
            present["sample_size"] >= thresholds.minimum_sample_size
            and absent["sample_size"] >= thresholds.minimum_sample_size
            and present_cpl is not None
            and absent_cpl is not None
            and present_cpl - absent_cpl >= thresholds.minimum_cpl_delta
        )
        if underperforming:
            _add_pattern(
                patterns,
                f"{category}:present_positions_have_higher_cpl",
                present,
                thresholds,
            )
        result[category] = {
            "groups": group_metrics,
            "higher_cpl_group": "present" if underperforming else None,
        }

    return result


def _rank_patterns(patterns: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Sort patterns by severity, confidence, sample size, and stable name."""
    return sorted(
        patterns,
        key=lambda item: (
            -item["severity_score"],
            -item["confidence"],
            -item["sample_size"],
            item["pattern"],
        ),
    )


def generate_pattern_report(
    dataframe: pd.DataFrame,
    thresholds: PatternThresholds = PatternThresholds(),
) -> dict[str, Any]:
    """Return recurring pattern metrics and severity-ranked findings.

    Inference confidence is generated with the existing cached predictor. No
    preprocessing or fitting is repeated here. The input is not modified.
    """
    schema = load_feature_schema()
    validate_and_select_features(dataframe, schema)
    report_thresholds = thresholds

    analysis_frame = dataframe.copy().reset_index(drop=True)
    if dataframe.empty:
        analysis_frame["_prediction_confidence"] = pd.Series(
            index=analysis_frame.index, dtype="float64"
        )
        overall = {
            "games": 0,
            "positions": 0,
            "scored_positions": 0,
            "average_cpl": None,
            "average_mobility": None,
            "average_confidence": None,
            "mistake_count": 0,
            "blunder_count": 0,
            "mistake_rate": None,
            "blunder_rate": None,
        }
        overall_average_cpl = None
    else:
        predictions = predict_dataframe(dataframe)
        if len(predictions) != len(dataframe):
            raise RuntimeError("Prediction count does not match the dataset row count.")
        analysis_frame["_prediction_confidence"] = [
            prediction["confidence"] for prediction in predictions
        ]
        records = analysis_frame.to_dict(orient="records")
        overall_existing = get_player_statistics(records)
        overall_average_cpl = _number(
            overall_existing.get("AverageCentipawnLoss")
        )
        overall = {
            "games": int(analysis_frame["GameID"].nunique()),
            "positions": len(analysis_frame),
            "scored_positions": int(overall_existing["MovesAnalysed"]),
            "average_cpl": overall_average_cpl,
            "average_mobility": _number(overall_existing.get("AverageMobility")),
            "average_confidence": _mean_or_none(
                [prediction["confidence"] for prediction in predictions]
            ),
            "mistake_count": 0,
            "blunder_count": 0,
        }
    overall_valid = _valid_position_rows(analysis_frame)
    overall["mistake_count"] = sum(
        float(row["CentipawnLoss"]) >= report_thresholds.mistake_cpl
        for row in overall_valid
    )
    overall["blunder_count"] = sum(
        float(row["CentipawnLoss"]) >= report_thresholds.blunder_cpl
        for row in overall_valid
    )
    overall["mistake_rate"] = (
        overall["mistake_count"] / overall["scored_positions"]
        if overall["scored_positions"]
        else None
    )
    overall["blunder_rate"] = (
        overall["blunder_count"] / overall["scored_positions"]
        if overall["scored_positions"]
        else None
    )

    patterns: list[dict[str, Any]] = []
    phase = _phase_analysis(analysis_frame, report_thresholds, patterns)
    move_ranges = _move_range_analysis(analysis_frame, report_thresholds, patterns)
    castling = _castling_analysis(analysis_frame, report_thresholds, patterns)
    piece_activity = _piece_activity_analysis(
        analysis_frame, report_thresholds, patterns, overall_average_cpl
    )
    mobility = _mobility_analysis(analysis_frame, report_thresholds, patterns)
    pawn_structure = _pawn_structure_analysis(
        analysis_frame, report_thresholds, patterns
    )
    material_imbalance = _material_imbalance_analysis(
        analysis_frame, report_thresholds, patterns
    )

    return {
        "dataset": {
            "games": overall["games"],
            "positions": overall["positions"],
            "scored_positions": overall["scored_positions"],
        },
        "thresholds": asdict(report_thresholds),
        "metric_definitions": {
            "scored_position": f"CentipawnLoss < {_MATE_CPL_CUTOFF}",
            "mistake_count": "CPL at or above mistake_cpl; includes blunders",
            "blunder_count": "CPL at or above blunder_cpl",
            "rates": "event counts divided by scored positions, represented as 0-1 fractions",
            "average_evaluation_loss": (
                "mean positive, side-relative pre-move to played-move evaluation "
                "drop in pawn units; mate evaluations excluded"
            ),
            "severity_score": (
                "0-100 weighted mistake frequency and average CPL, multiplied "
                "by sample-support confidence"
            ),
            "confidence": (
                "scored_positions / (scored_positions + minimum_sample_size)"
            ),
        },
        "overall": overall,
        "game_phase_analysis": phase,
        "move_range_analysis": move_ranges,
        "castling_analysis": castling,
        "piece_activity_analysis": piece_activity,
        "mobility_analysis": mobility,
        "pawn_structure_analysis": pawn_structure,
        "material_imbalance_analysis": material_imbalance,
        "patterns": _rank_patterns(patterns),
    }


def save_pattern_report(
    report: dict[str, Any], output_path: Path = DEFAULT_REPORT_PATH
) -> Path:
    """Serialize a generated pattern report to deterministic, strict JSON."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(report, indent=2, sort_keys=True, allow_nan=False) + "\n",
        encoding="utf-8",
    )
    return output_path


def main() -> None:
    """Mine patterns from a feature CSV and save the JSON report."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dataset", type=Path, help="Feature dataset CSV")
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_REPORT_PATH,
        help="Output JSON path",
    )
    parser.add_argument(
        "--mistake-cpl",
        type=float,
        default=PatternThresholds.mistake_cpl,
        help="Minimum centipawn loss counted as a mistake",
    )
    parser.add_argument(
        "--blunder-cpl",
        type=float,
        default=PatternThresholds.blunder_cpl,
        help="Minimum centipawn loss counted as a blunder",
    )
    parser.add_argument(
        "--minimum-sample-size",
        type=int,
        default=PatternThresholds.minimum_sample_size,
        help="Minimum observations for a pattern to be fully supported",
    )
    args = parser.parse_args()

    thresholds = PatternThresholds(
        mistake_cpl=args.mistake_cpl,
        blunder_cpl=args.blunder_cpl,
        minimum_sample_size=args.minimum_sample_size,
    )
    try:
        dataframe = pd.read_csv(args.dataset)
        report = generate_pattern_report(dataframe, thresholds)
        saved_path = save_pattern_report(report, args.output)
    except (OSError, TypeError, ValueError, RuntimeError) as exc:
        parser.error(str(exc))

    print(
        json.dumps(
            {
                "games": report["dataset"]["games"],
                "positions": report["dataset"]["positions"],
                "patterns": len(report["patterns"]),
                "weakest_phase": report["game_phase_analysis"]["weakest_phase"],
                "highest_risk_move_range": report["move_range_analysis"][
                    "highest_risk_range"
                ],
                "report_path": str(saved_path),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
