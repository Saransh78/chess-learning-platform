"""Player-level aggregate statistics.

Migrated behavior-preserving from feature_extraction.ipynb. The notebook
operates on a pandas DataFrame; the backend has no pandas dependency, so
the same logic is re-expressed over ``list[dict]`` rows using only the
standard library (``statistics``). Thresholds, key names, rounding, and
the ``CentipawnLoss < 500`` mate-position filter are unchanged.

Source cells:

* 84 ``get_player_statistics``
* 86 ``get_positional_statistics``
* 90 ``calculate_player_strength`` (``np.mean`` -> ``statistics.mean``)
* 100 ``get_opening_report``
* 102 ``get_middlegame_report``
* 104 ``get_endgame_report``
* 40 per-move row composition (``build_player_rows``)

Row contract: each row combines ``extract_features`` keys,
``analyze_move`` keys, and metadata (``GameID``, ``Result``), exactly as
notebook cell 40 builds them.
"""

import io
from statistics import mean, median
from typing import Any

import chess
import chess.pgn

from app.services.features.extractor import extract_features
from app.services.features.stockfish_features import analyze_move

Row = dict[str, Any]

_MATE_CPL_CUTOFF = 500


def _mean(values: list) -> float:
    """Pandas-style skipna mean; ``nan`` on empty like ``Series.mean``."""
    vals = [v for v in values if v is not None]

    if not vals:
        return float("nan")

    return mean(vals)


def _median(values: list) -> float:
    """Pandas-style skipna median; ``nan`` on empty."""
    vals = [v for v in values if v is not None]

    if not vals:
        return float("nan")

    return median(vals)


def _max(values: list) -> float:
    vals = [v for v in values if v is not None]

    if not vals:
        return float("nan")

    return max(vals)


def _min(values: list) -> float:
    vals = [v for v in values if v is not None]

    if not vals:
        return float("nan")

    return min(vals)


def _valid_cpl(rows: list[Row]) -> list[Row]:
    """Rows surviving the notebook's ``CentipawnLoss < 500`` mask.

    ``None`` (mate/unscored) fails the comparison and is excluded, exactly
    as in pandas.
    """
    return [
        r
        for r in rows
        if r.get("CentipawnLoss") is not None and r["CentipawnLoss"] < _MATE_CPL_CUTOFF
    ]


def build_player_rows(pgn_text: str, depth: int = 12) -> list[Row]:
    """Build per-move feature rows for every game in ``pgn_text``.

    Mirrors notebook cell 40 ("Process All Games"): each row merges
    ``extract_features`` output, ``analyze_move`` output, and game metadata.
    """
    rows: list[Row] = []
    game_id = 1
    stream = io.StringIO(pgn_text)

    while True:
        game = chess.pgn.read_game(stream)

        if game is None:
            break

        headers = game.headers
        white_player = headers.get("White")
        black_player = headers.get("Black")
        white_elo = headers.get("WhiteElo")
        black_elo = headers.get("BlackElo")
        result = headers.get("Result")

        board = game.board()

        for move in game.mainline_moves():
            row = extract_features(board)
            analysis = analyze_move(board, move, depth)

            if analysis is not None:
                row["CurrentEvaluation"] = analysis["CurrentEvaluation"]
                row["PlayedMove"] = analysis["PlayedMove"]
                row["PlayedMoveUCI"] = analysis["PlayedMoveUCI"]
                row["BestMove"] = analysis["BestMove"]
                row["BestMoveUCI"] = analysis["BestMoveUCI"]
                row["BestEvaluation"] = analysis["BestEvaluation"]
                row["PlayedEvaluation"] = analysis["PlayedEvaluation"]
                row["CentipawnLoss"] = analysis["CentipawnLoss"]
                row["PlayedBestMove"] = analysis["PlayedBestMove"]
                row["Depth"] = analysis["Depth"]
            else:
                row["CurrentEvaluation"] = None
                row["PlayedMove"] = board.san(move)
                row["PlayedMoveUCI"] = move.uci()
                row["BestMove"] = None
                row["BestMoveUCI"] = None
                row["BestEvaluation"] = None
                row["PlayedEvaluation"] = None
                row["CentipawnLoss"] = None
                row["PlayedBestMove"] = None
                row["Depth"] = None

            row["GameID"] = game_id
            row["WhitePlayer"] = white_player
            row["BlackPlayer"] = black_player
            row["WhiteElo"] = white_elo
            row["BlackElo"] = black_elo
            row["Result"] = result

            rows.append(row)
            board.push(move)

        game_id += 1

    return rows


def get_player_statistics(rows: list[Row]) -> dict[str, float]:
    report: dict[str, float] = {}
    valid_cpl = [r["CentipawnLoss"] for r in _valid_cpl(rows)]

    report["Games"] = len({r["GameID"] for r in rows})
    report["Positions"] = len(rows)
    report["MovesAnalysed"] = len(valid_cpl)
    report["MatePositions"] = len(rows) - len(valid_cpl)
    report["AverageMoveNumber"] = round(_mean([r["MoveNumber"] for r in rows]), 2)
    report["AverageMobility"] = round(_mean([r["Mobility"] for r in rows]), 2)
    report["AverageMaterialDifference"] = round(
        _mean([r["MaterialDifference"] for r in rows]), 2
    )
    report["AverageCentipawnLoss"] = round(_mean(valid_cpl), 2)
    report["MedianCentipawnLoss"] = round(_median(valid_cpl), 2)
    report["MaximumCentipawnLoss"] = round(_max(valid_cpl), 2)
    report["MinimumCentipawnLoss"] = round(_min(valid_cpl), 2)
    report["BestMovePercentage"] = round(
        _mean([r["PlayedBestMove"] for r in rows]) * 100, 2
    )

    return report


def get_positional_statistics(rows: list[Row]) -> dict[str, float]:
    valid = _valid_cpl(rows)
    report: dict[str, float] = {}

    report["Average Mobility"] = round(_mean([r["Mobility"] for r in rows]), 2)
    report["Average Material Difference"] = round(
        _mean([r["MaterialDifference"] for r in rows]), 2
    )
    report["White Castled (%)"] = round(
        _mean([r["WhiteCastled"] for r in rows]) * 100, 2
    )
    report["Black Castled (%)"] = round(
        _mean([r["BlackCastled"] for r in rows]) * 100, 2
    )
    report["Average White Pawn Islands"] = round(
        _mean([r["WhitePawnIslands"] for r in rows]), 2
    )
    report["Average Black Pawn Islands"] = round(
        _mean([r["BlackPawnIslands"] for r in rows]), 2
    )
    report["Average White Passed Pawns"] = round(
        _mean([r["WhitePassedPawns"] for r in rows]), 2
    )
    report["Average Black Passed Pawns"] = round(
        _mean([r["BlackPassedPawns"] for r in rows]), 2
    )
    report["Best Move Percentage"] = round(
        _mean([r["PlayedBestMove"] for r in rows]) * 100, 2
    )
    report["Average CPL"] = round(_mean([r["CentipawnLoss"] for r in valid]), 2)

    return report


def calculate_player_strength(rows: list[Row]) -> dict[str, float]:
    report: dict[str, float] = {}
    valid = _valid_cpl(rows)

    avg_cpl = _mean([r["CentipawnLoss"] for r in valid])
    best_move = _mean([r["PlayedBestMove"] for r in rows]) * 100
    mobility = _mean([r["Mobility"] for r in rows])
    castling = (
        _mean([r["WhiteCastled"] for r in rows])
        + _mean([r["BlackCastled"] for r in rows])
    ) / 2 * 100
    pawn_islands = (
        _mean([r["WhitePawnIslands"] for r in rows])
        + _mean([r["BlackPawnIslands"] for r in rows])
    ) / 2
    material = abs(_mean([r["MaterialDifference"] for r in rows]))

    tactical = max(0, 100 - avg_cpl)
    positional = min(100, mobility * 3)
    king_safety = castling
    pawn_score = max(0, 100 - (pawn_islands - 1) * 30)

    engine_score = best_move * 2

    if engine_score > 100:
        engine_score = 100

    material_score = max(0, 100 - material * 25)

    overall = mean(
        [
            tactical,
            positional,
            king_safety,
            pawn_score,
            engine_score,
            material_score,
        ]
    )

    report["Tactical Strength"] = round(tactical, 1)
    report["Positional Strength"] = round(positional, 1)
    report["King Safety"] = round(king_safety, 1)
    report["Pawn Structure"] = round(pawn_score, 1)
    report["Engine Accuracy"] = round(engine_score, 1)
    report["Material Handling"] = round(material_score, 1)
    report["Overall Playing Strength"] = round(overall, 1)

    return report


def _game_results(rows: list[Row]) -> tuple[int, int]:
    """Return ``(total_games, white_wins)`` using each game's first row."""
    first_result: dict[Any, Any] = {}

    for r in rows:
        if r["GameID"] not in first_result:
            first_result[r["GameID"]] = r["Result"]

    total_games = len(first_result)
    wins = sum(1 for result in first_result.values() if result == "1-0")

    return total_games, wins


def _phase_score(report: dict[str, float]) -> float:
    score = (
        100
        - report["Average CPL"] * 0.7
        + report["Best Move Accuracy"] * 0.2
        + report["Average Mobility"] * 0.2
    )

    return round(max(0, min(score, 100)), 1)


def get_opening_report(rows: list[Row]) -> dict[str, float]:
    opening_positions = [r for r in rows if r["GamePhase"] == "Opening"]

    if len(opening_positions) == 0:
        return {}

    valid_cpl = [r["CentipawnLoss"] for r in _valid_cpl(opening_positions)]
    total_games, wins = _game_results(rows)

    report: dict[str, float] = {}
    report["Opening Positions"] = len(opening_positions)
    report["Average CPL"] = round(_mean(valid_cpl), 2)
    report["Median CPL"] = round(_median(valid_cpl), 2)
    report["Best Move Accuracy"] = round(
        _mean([r["PlayedBestMove"] for r in opening_positions]) * 100, 2
    )
    report["Average Mobility"] = round(
        _mean([r["Mobility"] for r in opening_positions]), 2
    )
    report["Average Material Difference"] = round(
        _mean([r["MaterialDifference"] for r in opening_positions]), 2
    )
    report["Average Evaluation"] = round(
        _mean([r["PlayedEvaluation"] for r in opening_positions]), 2
    )
    report["Win Rate"] = round(wins / total_games * 100, 2)
    report["Opening Score"] = _phase_score(report)

    return report


def get_middlegame_report(rows: list[Row]) -> dict[str, float]:
    middle = [r for r in rows if r["GamePhase"] == "Middlegame"]

    if len(middle) == 0:
        return {}

    valid_cpl = [r["CentipawnLoss"] for r in _valid_cpl(middle)]

    report: dict[str, float] = {}
    report["Middlegame Positions"] = len(middle)
    report["Average CPL"] = round(_mean(valid_cpl), 2)
    report["Median CPL"] = round(_median(valid_cpl), 2)
    report["Best Move Accuracy"] = round(
        _mean([r["PlayedBestMove"] for r in middle]) * 100, 2
    )
    report["Average Mobility"] = round(_mean([r["Mobility"] for r in middle]), 2)
    report["Average Material Difference"] = round(
        _mean([r["MaterialDifference"] for r in middle]), 2
    )
    report["Average Evaluation"] = round(
        _mean([r["PlayedEvaluation"] for r in middle]), 2
    )
    report["Middlegame Score"] = _phase_score(report)

    return report


def get_endgame_report(rows: list[Row]) -> dict[str, float | str]:
    endgame = [r for r in rows if r["GamePhase"] == "Endgame"]

    if len(endgame) == 0:
        return {"Message": "No endgame positions available."}

    valid_cpl = [r["CentipawnLoss"] for r in _valid_cpl(endgame)]

    report: dict[str, float | str] = {}
    report["Endgame Positions"] = len(endgame)
    report["Average CPL"] = round(_mean(valid_cpl), 2)
    report["Median CPL"] = round(_median(valid_cpl), 2)
    report["Best Move Accuracy"] = round(
        _mean([r["PlayedBestMove"] for r in endgame]) * 100, 2
    )
    report["Average Mobility"] = round(_mean([r["Mobility"] for r in endgame]), 2)
    report["Average Material Difference"] = round(
        _mean([r["MaterialDifference"] for r in endgame]), 2
    )
    report["Average Evaluation"] = round(
        _mean([r["PlayedEvaluation"] for r in endgame]), 2
    )

    score = (
        100
        - report["Average CPL"] * 0.7
        + report["Best Move Accuracy"] * 0.2
        + report["Average Mobility"] * 0.2
    )
    score = max(0, min(score, 100))
    report["Endgame Score"] = round(score, 1)

    return report
