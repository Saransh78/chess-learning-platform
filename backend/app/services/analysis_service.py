import chess
import chess.engine

from collections.abc import Iterator
from contextlib import contextmanager

from app.core.config import settings


@contextmanager
def stockfish_session() -> Iterator[chess.engine.SimpleEngine]:
    """Yield a Stockfish engine, guaranteeing cleanup.

    Single launcher shared by ``analyze_position`` and the
    ``features.stockfish_features`` migration (M3.7 Commit 3), so engine
    access logic lives in exactly one place. Each session opens its own
    process (safe under the FastAPI threadpool) instead of reusing the
    notebook's global ``engine`` object.
    """
    engine = chess.engine.SimpleEngine.popen_uci(settings.STOCKFISH_PATH)

    try:
        yield engine
    finally:
        engine.quit()


def analyze_position(fen: str, depth: int = 12):
    board = chess.Board(fen)

    with stockfish_session() as engine:
        info = engine.analyse(board, chess.engine.Limit(depth=depth))

    score = info["score"].relative

    return {
        "fen": fen,
        "best_move": board.san(info["pv"][0]),
        "evaluation": score.score(mate_score=10000),
    }
