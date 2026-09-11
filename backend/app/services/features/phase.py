"""Game-phase / castling pure feature helpers.

Migrated verbatim (behavior-preserving) from feature_extraction.ipynb.
"""

import chess


def castled(board: chess.Board, color: chess.Color) -> int:
    king_square = board.king(color)

    if color == chess.WHITE:
        return int(king_square in [chess.G1, chess.C1])

    return int(king_square in [chess.G8, chess.C8])


def game_phase(board: chess.Board) -> str:
    pieces = len(board.piece_map()) - 2

    if pieces > 24:
        return "Opening"

    elif pieces > 10:
        return "Middlegame"

    return "Endgame"
