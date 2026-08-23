import chess
import chess.engine

from app.core.config import settings


def analyze_position(fen: str, depth: int = 12):
    board = chess.Board(fen)

    engine = chess.engine.SimpleEngine.popen_uci(settings.STOCKFISH_PATH)

    try:
        info = engine.analyse(board, chess.engine.Limit(depth=depth))
    finally:
        engine.quit()

    score = info["score"].relative

    return {
        "fen": fen,
        "best_move": board.san(info["pv"][0]),
        "evaluation": score.score(mate_score=10000),
    }
