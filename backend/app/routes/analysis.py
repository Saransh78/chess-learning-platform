import io

import chess.pgn
from fastapi import APIRouter, HTTPException

from app.schemas.pgn import PGNRequest
from app.services.analysis_service import analyze_position

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze")
def analyze(data: PGNRequest):
    try:
        game = chess.pgn.read_game(io.StringIO(data.pgn))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid PGN")

    if game is None or game.errors:
        raise HTTPException(status_code=400, detail="Invalid PGN")

    board = game.board()

    for move in game.mainline_moves():
        board.push(move)

    return analyze_position(board.fen())
