"""Weakness / strength / recommendation engines.

Migrated behavior-preserving from feature_extraction.ipynb. The notebook
operates on a pandas DataFrame; the backend has no pandas dependency, so
the same logic is re-expressed over ``list[dict]`` rows using only the
standard library. Thresholds, message strings, and key names are unchanged.

Source cells:

* 88 ``detect_player_weaknesses``
* 92 ``generate_recommendations``
* 96 ``detect_weaknesses``
* 98 ``detect_strengths``
* 106 ``generate_training_plan``

Row contract: same as ``app.services.player_analysis`` (merged
``extract_features`` + ``analyze_move`` + metadata rows).
"""

from statistics import mean, median
from typing import Any

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


def _valid_cpl(rows: list[Row]) -> list[Row]:
    return [
        r
        for r in rows
        if r.get("CentipawnLoss") is not None and r["CentipawnLoss"] < _MATE_CPL_CUTOFF
    ]


def _pawn_defect_score(rows: list[Row]) -> float:
    return (
        _mean([r["WhiteIsolatedPawns"] for r in rows])
        + _mean([r["BlackIsolatedPawns"] for r in rows])
        + _mean([r["WhiteDoubledPawns"] for r in rows])
        + _mean([r["BlackDoubledPawns"] for r in rows])
    )


def detect_player_weaknesses(rows: list[Row]) -> list[str]:
    report: list[str] = []
    valid = _valid_cpl(rows)

    avg_cpl = _mean([r["CentipawnLoss"] for r in valid])
    best_move = _mean([r["PlayedBestMove"] for r in rows]) * 100
    mobility = _mean([r["Mobility"] for r in rows])
    white_castled = _mean([r["WhiteCastled"] for r in rows]) * 100
    black_castled = _mean([r["BlackCastled"] for r in rows]) * 100
    material = _mean([r["MaterialDifference"] for r in rows])
    white_islands = _mean([r["WhitePawnIslands"] for r in rows])
    black_islands = _mean([r["BlackPawnIslands"] for r in rows])

    # --------------------------------------------------------

    if avg_cpl < 15:
        report.append("Excellent tactical accuracy across games.")

    elif avg_cpl < 30:
        report.append("Good tactical accuracy with only occasional inaccuracies.")

    elif avg_cpl < 50:
        report.append("Frequent inaccuracies reduce overall game quality.")

    else:
        report.append("Large average centipawn loss indicates tactical weaknesses.")

    # --------------------------------------------------------

    if best_move > 60:
        report.append("Engine best moves are found consistently.")

    elif best_move > 45:
        report.append("Engine best moves are found at a reasonable rate.")

    else:
        report.append("Many engine best moves are being missed.")

    # --------------------------------------------------------

    if mobility > 34:
        report.append("Piece activity is generally strong.")

    elif mobility > 28:
        report.append("Piece activity is acceptable but can improve.")

    else:
        report.append("Low mobility suggests passive piece placement.")

    # --------------------------------------------------------

    if white_castled > 80:
        report.append("White king safety is excellent.")

    elif white_castled > 60:
        report.append("White usually castles safely.")

    else:
        report.append("White often delays castling.")

    # --------------------------------------------------------

    if black_castled > 80:
        report.append("Black king safety is excellent.")

    elif black_castled > 60:
        report.append("Black usually castles safely.")

    else:
        report.append("Black often delays castling.")

    # --------------------------------------------------------

    if abs(material) < 0.5:
        report.append("Material balance is maintained well.")

    elif material > 0:
        report.append("Player generally gains material advantages.")

    else:
        report.append("Player frequently loses material.")

    # --------------------------------------------------------

    pawn_islands = (white_islands + black_islands) / 2

    if pawn_islands < 2.3:
        report.append("Pawn structure is very healthy.")

    elif pawn_islands < 3:
        report.append("Pawn structure is generally stable.")

    else:
        report.append("Pawn structure frequently becomes fragmented.")

    return report


def generate_recommendations(rows: list[Row]) -> list[str]:
    recommendations: list[str] = []
    valid = _valid_cpl(rows)

    average_cpl = _mean([r["CentipawnLoss"] for r in valid])
    best_move = _mean([r["PlayedBestMove"] for r in rows]) * 100
    mobility = _mean([r["Mobility"] for r in rows])
    white_castled = _mean([r["WhiteCastled"] for r in rows]) * 100
    black_castled = _mean([r["BlackCastled"] for r in rows]) * 100
    material_difference = abs(_mean([r["MaterialDifference"] for r in rows]))
    pawn_islands = (
        _mean([r["WhitePawnIslands"] for r in rows])
        + _mean([r["BlackPawnIslands"] for r in rows])
    ) / 2

    # -------------------------------------------------------

    if average_cpl > 40:
        recommendations.append(
            "Spend more time solving tactical puzzles to reduce large evaluation drops."
        )

    elif average_cpl > 25:
        recommendations.append(
            "Review missed tactical opportunities after every game."
        )

    # -------------------------------------------------------

    if best_move < 45:
        recommendations.append(
            "Compare your moves with Stockfish to understand stronger alternatives."
        )

    # -------------------------------------------------------

    if mobility < 30:
        recommendations.append(
            "Improve piece activity by activating minor pieces earlier."
        )

    # -------------------------------------------------------

    if white_castled < 70:
        recommendations.append(
            "Castle earlier with the white pieces to improve king safety."
        )

    if black_castled < 70:
        recommendations.append(
            "Castle earlier with the black pieces whenever possible."
        )

    # -------------------------------------------------------

    # NOTE: mirrors the notebook verbatim; ``abs(...)`` is never negative,
    # so this branch never fires in the source either.
    if material_difference < 0:
        recommendations.append(
            "Focus on avoiding unnecessary material losses."
        )

    # -------------------------------------------------------

    if pawn_islands > 3:
        recommendations.append(
            "Study pawn structures to reduce long-term positional weaknesses."
        )

    # -------------------------------------------------------

    if len(recommendations) == 0:
        recommendations.append(
            "Current statistics show balanced play. Continue reviewing critical moments to improve further."
        )

    return recommendations


def detect_weaknesses(rows: list[Row]) -> list[str]:
    weaknesses: list[str] = []
    valid = _valid_cpl(rows)

    avg_cpl = _mean([r["CentipawnLoss"] for r in valid])
    best_move = _mean([r["PlayedBestMove"] for r in rows]) * 100

    opening = [r for r in rows if r["GamePhase"] == "Opening"]
    middlegame = [r for r in rows if r["GamePhase"] == "Middlegame"]
    endgame = [r for r in rows if r["GamePhase"] == "Endgame"]

    # -------------------------------------------------------
    # Engine Accuracy
    # -------------------------------------------------------

    if best_move < 45:
        weaknesses.append(
            "Engine first-choice agreement is low. Improve calculation before committing to moves."
        )

    elif best_move < 60:
        weaknesses.append(
            "Engine agreement is moderate but can still be improved."
        )

    # -------------------------------------------------------
    # Average CPL
    # -------------------------------------------------------

    if avg_cpl > 40:
        weaknesses.append(
            "Average centipawn loss is high, indicating frequent inaccuracies."
        )

    elif avg_cpl > 20:
        weaknesses.append(
            "Average centipawn loss is acceptable but still leaves room for improvement."
        )

    # -------------------------------------------------------
    # Opening
    # -------------------------------------------------------

    if len(opening):
        if _median([r["CentipawnLoss"] for r in opening]) > 20:
            weaknesses.append("Opening play loses evaluation too early.")

    # -------------------------------------------------------
    # Middlegame
    # -------------------------------------------------------

    if len(middlegame):
        if _median([r["CentipawnLoss"] for r in middlegame]) > 30:
            weaknesses.append("Most evaluation losses occur during the middlegame.")

    # -------------------------------------------------------
    # Endgame
    # -------------------------------------------------------

    if len(endgame):
        if _median([r["CentipawnLoss"] for r in endgame]) > 20:
            weaknesses.append("Endgame conversion needs improvement.")

    # -------------------------------------------------------
    # Mobility
    # -------------------------------------------------------

    if _mean([r["Mobility"] for r in rows]) < 30:
        weaknesses.append(
            "Piece activity is lower than expected. Improve piece coordination."
        )

    # -------------------------------------------------------
    # Pawn Structure
    # -------------------------------------------------------

    if _pawn_defect_score(rows) > 1.5:
        weaknesses.append("Pawn structure frequently deteriorates during games.")

    return weaknesses


def detect_strengths(rows: list[Row]) -> list[str]:
    strengths: list[str] = []
    valid = _valid_cpl(rows)

    avg_cpl = _mean([r["CentipawnLoss"] for r in valid])
    best_move = _mean([r["PlayedBestMove"] for r in rows]) * 100

    opening = [r for r in rows if r["GamePhase"] == "Opening"]
    middlegame = [r for r in rows if r["GamePhase"] == "Middlegame"]
    endgame = [r for r in rows if r["GamePhase"] == "Endgame"]

    # -----------------------------------------------
    # Engine Accuracy
    # -----------------------------------------------

    if best_move >= 55:
        strengths.append("Frequently finds the engine's strongest continuation.")

    # -----------------------------------------------
    # Low Centipawn Loss
    # -----------------------------------------------

    if avg_cpl <= 20:
        strengths.append("Maintains excellent move accuracy throughout games.")

    elif avg_cpl <= 35:
        strengths.append("Maintains good positional accuracy.")

    # -----------------------------------------------
    # Opening
    # -----------------------------------------------

    if len(opening):
        if _median([r["CentipawnLoss"] for r in opening]) <= 15:
            strengths.append("Builds solid positions in the opening.")

    # -----------------------------------------------
    # Middlegame
    # -----------------------------------------------

    if len(middlegame):
        if _median([r["CentipawnLoss"] for r in middlegame]) <= 20:
            strengths.append("Handles middlegame positions consistently.")

    # -----------------------------------------------
    # Endgame
    # -----------------------------------------------

    if len(endgame):
        if _median([r["CentipawnLoss"] for r in endgame]) <= 15:
            strengths.append("Converts endgames accurately.")

    # -----------------------------------------------
    # Mobility
    # -----------------------------------------------

    if _mean([r["Mobility"] for r in rows]) >= 35:
        strengths.append("Maintains active and well-coordinated pieces.")

    # -----------------------------------------------
    # Pawn Structure
    # -----------------------------------------------

    if _pawn_defect_score(rows) < 1:
        strengths.append("Maintains healthy pawn structures.")

    # -----------------------------------------------
    # King Safety
    # -----------------------------------------------

    castling_rate = (
        _mean([r["WhiteCastled"] for r in rows])
        + _mean([r["BlackCastled"] for r in rows])
    ) / 2

    if castling_rate >= 0.80:
        strengths.append("Consistently prioritises king safety.")

    return strengths


def generate_training_plan(
    rows: list[Row],
    opening_report: dict[str, Any],
    middlegame_report: dict[str, Any],
    endgame_report: dict[str, Any],
    strengths: list[str],
    weaknesses: list[str],
    player_style: dict[str, float],
) -> list[str]:
    """Combine weaknesses, phase scores, style, and strengths into a plan.

    ``rows`` is accepted (but not read) to preserve the notebook's call
    contract; cell 106 only consumes the reports and lists.
    """
    recommendations: list[str] = []

    # ----------------------------------------------------
    # Weakness Based
    # ----------------------------------------------------

    for weakness in weaknesses:
        recommendations.append(weakness)

    # ----------------------------------------------------
    # Opening
    # ----------------------------------------------------

    if opening_report.get("Opening Score", 100) < 75:
        recommendations.append(
            "Study your opening repertoire and review the first 10-15 moves using an engine."
        )

    # ----------------------------------------------------
    # Middlegame
    # ----------------------------------------------------

    if middlegame_report.get("Middlegame Score", 100) < 75:
        recommendations.append(
            "Spend more time solving middlegame calculation exercises and tactical positions."
        )

    # ----------------------------------------------------
    # Endgame
    # ----------------------------------------------------

    if "Endgame Score" in endgame_report and endgame_report["Endgame Score"] < 75:
        recommendations.append(
            "Practice fundamental rook and pawn endgames to improve conversion."
        )

    # ----------------------------------------------------
    # Style Based
    # ----------------------------------------------------

    if player_style["Tactical Player"] < 45:
        recommendations.append(
            "Increase tactical puzzle practice to improve calculation speed."
        )

    if player_style["Positional Player"] < 50:
        recommendations.append(
            "Study positional chess and annotated grandmaster games."
        )

    if player_style["Risk Taking"] > 70:
        recommendations.append(
            "Reduce unnecessary complications and choose more stable continuations."
        )

    # ----------------------------------------------------
    # Strength Based
    # ----------------------------------------------------

    for strength in strengths:
        if "opening" in strength.lower():
            recommendations.append(
                "Continue maintaining your strong opening preparation."
            )

        if "pawn" in strength.lower():
            recommendations.append(
                "Your pawn structure is a strength. Preserve this advantage."
            )

    # ----------------------------------------------------
    # Remove duplicates
    # ----------------------------------------------------

    recommendations = list(dict.fromkeys(recommendations))

    return recommendations
