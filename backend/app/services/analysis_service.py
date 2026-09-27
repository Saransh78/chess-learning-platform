import os
import shutil

import chess
import chess.engine

from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache

import app.core.config  # noqa: F401 — loads backend/.env so STOCKFISH_PATH resolves

#: Debian/Ubuntu system path where `apt install stockfish` places the binary
#: (also the production Dockerfile's install location).
SYSTEM_STOCKFISH_PATH = "/usr/games/stockfish"


@lru_cache(maxsize=1)
def resolve_stockfish_path() -> str:
    """Resolve the Stockfish binary without hardcoding platform paths.

    Priority: explicit ``STOCKFISH_PATH`` env var, then the Debian system
    path, then ``PATH`` lookup. Raises a clear ``RuntimeError`` when no
    usable binary exists so startup fails fast instead of mid-analysis.
    """
    configured = (os.environ.get("STOCKFISH_PATH") or "").strip()
    if configured:
        if os.path.isfile(configured) and os.access(configured, os.X_OK):
            return configured
        raise RuntimeError(
            f"Stockfish not found at STOCKFISH_PATH={configured!r}. "
            "Install Stockfish or point STOCKFISH_PATH at the engine binary."
        )
    if os.path.isfile(SYSTEM_STOCKFISH_PATH) and os.access(
        SYSTEM_STOCKFISH_PATH, os.X_OK
    ):
        return SYSTEM_STOCKFISH_PATH
    on_path = shutil.which("stockfish")
    if on_path:
        return on_path
    raise RuntimeError(
        "Stockfish engine not found. Install Stockfish "
        "(e.g. `apt install stockfish`) or set STOCKFISH_PATH "
        "to the engine binary."
    )


@contextmanager
def stockfish_session() -> Iterator[chess.engine.SimpleEngine]:
    """Yield a Stockfish engine, guaranteeing cleanup.

    Single launcher shared by ``analyze_position`` and the
    ``features.stockfish_features`` migration (M3.7 Commit 3), so engine
    access logic lives in exactly one place. Each session opens its own
    process (safe under the FastAPI threadpool) instead of reusing the
    notebook's global ``engine`` object.
    """
    engine = chess.engine.SimpleEngine.popen_uci(resolve_stockfish_path())

    try:
        yield engine
    finally:
        engine.quit()


def analyze_position(fen: str, depth: int = 12):
    board = chess.Board(fen)

    if board.is_game_over():
        # No legal moves: the engine returns no PV. Mirror the notebook's
        # game-over convention (stockfish_evaluation -> Nones) instead of
        # raising KeyError on info["pv"].
        return {"fen": fen, "best_move": None, "evaluation": None}

    with stockfish_session() as engine:
        info = engine.analyse(board, chess.engine.Limit(depth=depth))

    score = info["score"].relative

    return {
        "fen": fen,
        "best_move": board.san(info["pv"][0]),
        "evaluation": score.score(mate_score=10000),
    }
