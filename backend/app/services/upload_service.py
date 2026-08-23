import io

import chess.pgn


def extract_games(content: str):
    stream = io.StringIO(content)
    games = []

    while True:
        game = chess.pgn.read_game(stream)

        if game is None:
            break

        moves = sum(1 for _ in game.mainline_moves())

        games.append(
            {
                "white": game.headers.get("White", "Unknown"),
                "black": game.headers.get("Black", "Unknown"),
                "result": game.headers.get("Result", "*"),
                "moves": moves,
            }
        )

    return games
