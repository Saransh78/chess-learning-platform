"""Stockfish-derived move feature helpers.

Migrated behavior-preserving from feature_extraction.ipynb:

* cell 34 ``stockfish_evaluation``
* cell 36 ``evaluate_after_move``
* cell 37 ``evaluate_best_move``
* cell 38 ``analyze_move``

Deliberate production divergence: the notebook held a single global
``engine = popen_uci(STOCKFISH_PATH)`` (cell 32). This module instead
acquires the engine per analysis via
:func:`app.services.analysis_service.stockfish_session`, which uses the
same ``settings.STOCKFISH_PATH`` launcher. Returned feature values keep
notebook semantics (white-perspective pawn units, mate mapped to
``+/-10000``).
"""

import chess
import chess.engine

from app.services.analysis_service import stockfish_session


def stockfish_evaluation(
    board: chess.Board, depth: int = 12
) -> dict[str, float | str | int | None]:
    if board.is_game_over():
        return {
            "StockfishEval": None,
            "BestMove": None,
            "BestMoveUCI": None,
            "Depth": depth,
        }

    with stockfish_session() as engine:
        info = engine.analyse(board, chess.engine.Limit(depth=depth))

    score = info["score"].white()

    if score.is_mate():
        evaluation: float | int | None = 10000 if score.mate() > 0 else -10000
    else:
        evaluation = score.score() / 100

    if "pv" in info and len(info["pv"]) > 0:
        best_move = board.san(info["pv"][0])
        best_move_uci = info["pv"][0].uci()
    else:
        best_move = None
        best_move_uci = None

    return {
        "StockfishEval": evaluation,
        "BestMove": best_move,
        "BestMoveUCI": best_move_uci,
        "Depth": depth,
    }


def evaluate_after_move(
    board: chess.Board, move: chess.Move, depth: int = 12
) -> dict[str, float | str | int | None]:
    """
    Evaluates a position after a given move
    without changing the original board.
    """
    temp_board = board.copy()

    temp_board.push(move)

    result = stockfish_evaluation(temp_board, depth)

    return result


def evaluate_best_move(
    board: chess.Board, depth: int = 12
) -> dict[str, float | str | int | None] | None:
    """
    Evaluates the engine's best move.
    """
    best = stockfish_evaluation(board, depth)

    if best["BestMove"] is None:
        return None

    move = board.parse_san(best["BestMove"])

    temp_board = board.copy()
    temp_board.push(move)

    # If best move is mate, return mate evaluation directly
    if temp_board.is_checkmate():
        return {
            "StockfishEval": 10000,
            "BestMove": None,
            "BestMoveUCI": None,
            "Depth": depth,
        }

    return evaluate_after_move(board, move, depth)


def analyze_move(
    board: chess.Board, move: chess.Move, depth: int = 12
) -> dict[str, float | str | bool | int | None] | None:
    """
    Analyze a played move using Stockfish.

    Returns:
        - BestMove
        - BestMoveUCI
        - PlayedMove
        - PlayedMoveUCI
        - CurrentEvaluation
        - BestEvaluation
        - PlayedEvaluation
        - CentipawnLoss
        - PlayedBestMove
        - Depth
    """
    # Engine analysis of current position
    current = stockfish_evaluation(board, depth)

    if current["BestMoveUCI"] is None:
        return None

    # Check if played move immediately checkmates
    temp_board = board.copy()
    temp_board.push(move)

    if temp_board.is_checkmate():
        return {
            "BestMove": current["BestMove"],
            "BestMoveUCI": current["BestMoveUCI"],
            "PlayedMove": board.san(move),
            "PlayedMoveUCI": move.uci(),
            "CurrentEvaluation": current["StockfishEval"],
            "BestEvaluation": 10000,
            "PlayedEvaluation": 10000,
            "CentipawnLoss": 0,
            "PlayedBestMove": current["BestMoveUCI"] == move.uci(),
            "Depth": depth,
        }

    # Evaluate engine's best move
    best = evaluate_best_move(board, depth)

    # Evaluate player's move
    played = evaluate_after_move(board, move, depth)

    if best is None or played is None:
        return None

    best_eval = best["StockfishEval"]
    played_eval = played["StockfishEval"]

    if best_eval is None or played_eval is None:
        return None

    cpl = abs(best_eval - played_eval) * 100

    return {
        "BestMove": current["BestMove"],
        "BestMoveUCI": current["BestMoveUCI"],
        "PlayedMove": board.san(move),
        "PlayedMoveUCI": move.uci(),
        "CurrentEvaluation": current["StockfishEval"],
        "BestEvaluation": best_eval,
        "PlayedEvaluation": played_eval,
        "CentipawnLoss": cpl,
        "PlayedBestMove": current["BestMoveUCI"] == move.uci(),
        "Depth": depth,
    }
