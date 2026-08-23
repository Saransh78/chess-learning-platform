import io
import chess.pgn


def parse_pgn(pgn_text: str):
    game = chess.pgn.read_game(io.StringIO(pgn_text))

    if game is None:
        return None

    moves = sum(1 for _ in game.mainline_moves())

    return {
        "white": game.headers.get("White", "Unknown"),
        "black": game.headers.get("Black", "Unknown"),
        "result": game.headers.get("Result", "*"),
        "moves": moves,
    }