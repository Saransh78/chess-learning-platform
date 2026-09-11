"""Pawn-structure pure feature helpers.

Migrated verbatim (behavior-preserving) from feature_extraction.ipynb.
"""

import chess


def doubled_pawn_count(board: chess.Board, color: chess.Color) -> int:
    count = 0

    pawns = board.pieces(chess.PAWN, color)

    for file in range(8):
        pawns_on_file = 0

        for square in pawns:
            if chess.square_file(square) == file:
                pawns_on_file += 1

        if pawns_on_file > 1:
            count += pawns_on_file - 1

    return count


def isolated_pawn_count(board: chess.Board, color: chess.Color) -> int:
    pawns = board.pieces(chess.PAWN, color)

    isolated = 0

    for square in pawns:
        file = chess.square_file(square)

        left_file = file - 1
        right_file = file + 1

        has_neighbor = False

        for other in pawns:
            other_file = chess.square_file(other)

            if other_file == left_file or other_file == right_file:
                has_neighbor = True
                break

        if not has_neighbor:
            isolated += 1

    return isolated


def passed_pawn_count(board: chess.Board, color: chess.Color) -> int:
    pawns = board.pieces(chess.PAWN, color)

    enemy = not color

    passed_count = 0

    for pawn in pawns:
        file = chess.square_file(pawn)
        rank = chess.square_rank(pawn)

        passed = True

        enemy_pawns = board.pieces(chess.PAWN, enemy)

        for ep in enemy_pawns:
            ep_file = chess.square_file(ep)
            ep_rank = chess.square_rank(ep)

            if abs(ep_file - file) <= 1:
                if color == chess.WHITE:
                    if ep_rank > rank:
                        passed = False
                else:
                    if ep_rank < rank:
                        passed = False

        if passed:
            passed_count += 1

    return passed_count


def pawn_islands(board: chess.Board, color: chess.Color) -> int:
    pawns = board.pieces(chess.PAWN, color)

    files = set()

    for pawn in pawns:
        files.add(chess.square_file(pawn))

    files = sorted(files)

    if not files:
        return 0

    islands = 1

    for i in range(1, len(files)):
        if files[i] - files[i - 1] > 1:
            islands += 1

    return islands
