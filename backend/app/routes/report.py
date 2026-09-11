from typing import Annotated

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from app.services.player_analysis import (
    build_player_rows,
    calculate_player_strength,
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

router = APIRouter(prefix="/api", tags=["report"])


@router.post("/report")
def generate_report(
    file: Annotated[UploadFile, File()],
    depth: Annotated[int, Query(ge=1, le=30)] = 12,
) -> dict:
    """Orchestrate the full player-report pipeline for an uploaded PGN.

    Delegates every computation to the existing services; this route only
    wires upload summary -> per-move rows -> player/style/weakness
    aggregates into a single JSON object.
    """
    filename = file.filename or ""

    if not filename.lower().endswith(".pgn"):
        raise HTTPException(status_code=400, detail="Only .pgn files are accepted")

    raw = file.file.read()

    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not valid UTF-8 text")

    games = extract_games(content)

    if not games:
        raise HTTPException(status_code=400, detail="No games found in PGN")

    rows = build_player_rows(content, depth=depth)

    if not rows:
        raise HTTPException(status_code=400, detail="No moves found in PGN")

    player_statistics = get_player_statistics(rows)
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

    return {
        "upload_summary": {
            "filename": filename,
            "games_detected": len(games),
            "file_size_bytes": len(raw),
            "games": games,
        },
        "player_statistics": player_statistics,
        "positional_statistics": get_positional_statistics(rows),
        "strength_scores": calculate_player_strength(rows),
        "opening_report": opening_report,
        "middlegame_report": middlegame_report,
        "endgame_report": endgame_report,
        "style": style,
        "weaknesses": weaknesses,
        "player_weaknesses": detect_player_weaknesses(rows),
        "strengths": strengths,
        "recommendations": generate_recommendations(rows),
        "training_plan": training_plan,
    }
