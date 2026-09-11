"""Master feature extractor.

Migrated verbatim (behavior-preserving) from feature_extraction.ipynb
cell 30 (``# Master Feature Extractor`` / ``extract_features``).

Helper logic lives in :mod:`material`, :mod:`phase`,
:mod:`piece_counts`, and :mod:`pawn_structure`; this module only
composes them, exactly as the notebook did.
"""

import chess

from app.services.features.material import (
    bishop_pair,
    material_difference,
    queens_present,
)
from app.services.features.pawn_structure import (
    doubled_pawn_count,
    isolated_pawn_count,
    passed_pawn_count,
    pawn_islands,
)
from app.services.features.phase import castled, game_phase
from app.services.features.piece_counts import piece_counts


def extract_features(board: chess.Board) -> dict[str, str | int]:
    return {
        "FEN": board.fen(),
        "MoveNumber": board.fullmove_number,
        "PiecesOnBoard": len(board.piece_map()) - 2,
        "Mobility": board.legal_moves.count(),
        "MaterialDifference": material_difference(board),
        "WhiteCastled": castled(board, chess.WHITE),
        "BlackCastled": castled(board, chess.BLACK),
        "GamePhase": game_phase(board),
        **piece_counts(board),
        "WhiteBishopPair": bishop_pair(board, chess.WHITE),
        "BlackBishopPair": bishop_pair(board, chess.BLACK),
        "QueensPresent": queens_present(board),
        "WhiteDoubledPawns": doubled_pawn_count(board, chess.WHITE),
        "BlackDoubledPawns": doubled_pawn_count(board, chess.BLACK),
        "WhiteIsolatedPawns": isolated_pawn_count(board, chess.WHITE),
        "BlackIsolatedPawns": isolated_pawn_count(board, chess.BLACK),
        "WhitePassedPawns": passed_pawn_count(board, chess.WHITE),
        "BlackPassedPawns": passed_pawn_count(board, chess.BLACK),
        "WhitePawnIslands": pawn_islands(board, chess.WHITE),
        "BlackPawnIslands": pawn_islands(board, chess.BLACK),
    }
