"""Player style detection.

Migrated behavior-preserving from feature_extraction.ipynb cell 94
(``detect_player_style``). The notebook operates on a pandas DataFrame;
the backend has no pandas dependency, so the same logic is re-expressed
over ``list[dict]`` rows using only the standard library. Formulas,
caps, and rounding are unchanged.

Row contract: same as ``app.services.player_analysis`` (merged
``extract_features`` + ``analyze_move`` + metadata rows).
"""

from statistics import mean
from typing import Any

Row = dict[str, Any]

_MATE_CPL_CUTOFF = 500


def _mean(values: list) -> float:
    """Pandas-style skipna mean; ``nan`` on empty like ``Series.mean``."""
    vals = [v for v in values if v is not None]

    if not vals:
        return float("nan")

    return mean(vals)


def detect_player_style(rows: list[Row]) -> dict[str, float]:
    valid = [
        r
        for r in rows
        if r.get("CentipawnLoss") is not None and r["CentipawnLoss"] < _MATE_CPL_CUTOFF
    ]

    average_cpl = _mean([r["CentipawnLoss"] for r in valid])
    best_move = _mean([r["PlayedBestMove"] for r in rows]) * 100
    mobility = _mean([r["Mobility"] for r in rows])
    material = _mean([r["MaterialDifference"] for r in rows])

    opening_ratio = _mean([1 if r["GamePhase"] == "Opening" else 0 for r in rows])
    middlegame_ratio = _mean([1 if r["GamePhase"] == "Middlegame" else 0 for r in rows])
    endgame_ratio = _mean([1 if r["GamePhase"] == "Endgame" else 0 for r in rows])

    white_castled = _mean([r["WhiteCastled"] for r in rows]) * 100
    black_castled = _mean([r["BlackCastled"] for r in rows]) * 100

    # ---------------------------------------------------
    # Scores
    # ---------------------------------------------------

    tactical = mobility * 0.5 + best_move * 0.5
    positional = (100 - average_cpl) * 0.6 + best_move * 0.4
    aggression = mobility * 0.7 + abs(material) * 12
    solid = (100 - average_cpl) * 0.5 + ((white_castled + black_castled) / 2) * 0.5
    opening = best_move * 0.6 + opening_ratio * 100 * 0.4
    endgame = best_move * 0.5 + endgame_ratio * 100 * 0.5
    activity = mobility
    risk = abs(material) * 15 + mobility * 0.6

    scores = {
        "Tactical Player": round(min(tactical, 100), 1),
        "Positional Player": round(min(positional, 100), 1),
        "Aggressive Player": round(min(aggression, 100), 1),
        "Solid Player": round(min(solid, 100), 1),
        "Opening Specialist": round(min(opening, 100), 1),
        "Endgame Specialist": round(min(endgame, 100), 1),
        "Active Piece Player": round(min(activity, 100), 1),
        "Risk Taking": round(min(risk, 100), 1),
    }

    return scores
