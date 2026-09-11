"""Piece-count pure feature helpers.

Migrated verbatim (behavior-preserving) from feature_extraction.ipynb.
"""

import chess


def piece_counts(board: chess.Board) -> dict[str, int]:
    return {
        "WhitePawnCount": len(board.pieces(chess.PAWN, chess.WHITE)),
        "BlackPawnCount": len(board.pieces(chess.PAWN, chess.BLACK)),
        "WhiteKnightCount": len(board.pieces(chess.KNIGHT, chess.WHITE)),
        "BlackKnightCount": len(board.pieces(chess.KNIGHT, chess.BLACK)),
        "WhiteBishopCount": len(board.pieces(chess.BISHOP, chess.WHITE)),
        "BlackBishopCount": len(board.pieces(chess.BISHOP, chess.BLACK)),
        "WhiteRookCount": len(board.pieces(chess.ROOK, chess.WHITE)),
        "BlackRookCount": len(board.pieces(chess.ROOK, chess.BLACK)),
        "WhiteQueenCount": len(board.pieces(chess.QUEEN, chess.WHITE)),
        "BlackQueenCount": len(board.pieces(chess.QUEEN, chess.BLACK)),
    }
