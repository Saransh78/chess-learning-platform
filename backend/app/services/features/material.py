"""Material-related pure feature helpers.

Migrated verbatim (behavior-preserving) from feature_extraction.ipynb.
"""

import chess


PIECE_VALUES = {
    chess.PAWN: 1,
    chess.KNIGHT: 3,
    chess.BISHOP: 3,
    chess.ROOK: 5,
    chess.QUEEN: 9,
}


def material_difference(board: chess.Board) -> int:
    white = 0
    black = 0

    for piece_type, value in PIECE_VALUES.items():
        white += len(board.pieces(piece_type, chess.WHITE)) * value
        black += len(board.pieces(piece_type, chess.BLACK)) * value

    return white - black


def bishop_pair(board: chess.Board, color: chess.Color) -> int:
    return int(len(board.pieces(chess.BISHOP, color)) >= 2)


def queens_present(board: chess.Board) -> int:
    return len(board.pieces(chess.QUEEN, chess.WHITE)) + len(
        board.pieces(chess.QUEEN, chess.BLACK)
    )
