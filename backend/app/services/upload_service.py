import io

import chess.pgn

from app.services.analysis_service import analyze_position


def extract_games(content: str):
    stream = io.StringIO(content)
    games = []

    while True:
        game = chess.pgn.read_game(stream)

        if game is None:
            break

        moves = sum(1 for _ in game.mainline_moves())

        board = game.board()
        for move in game.mainline_moves():
            board.push(move)

        summary = {
            "white": game.headers.get("White", "Unknown"),
            "black": game.headers.get("Black", "Unknown"),
            "result": game.headers.get("Result", "*"),
            "moves": moves,
        }
        summary.update(analyze_position(board.fen()))

        games.append(summary)

    return games
