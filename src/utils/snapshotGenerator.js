import { Chess } from "chess.js";
import { convertChessBoard } from "./boardConverter";

export function generateSnapshots(game) {
  const chess = new Chess();

  const snapshots = [];

  // Initial position
snapshots.push({
  board: convertChessBoard(chess.board()),
  fen: chess.fen(),
  turn: "white",
  lastMove: null,
  moveHistory: [],
  gameOver: false,
  gameResult: "",
});

  const moveHistory = [];

  game.moves.forEach((move, index) => {
    chess.move(move);
    moveHistory.push(move);

    snapshots.push({
  board: convertChessBoard(chess.board()),
  fen: chess.fen(),

      turn: chess.turn() === "w" ? "white" : "black",

      lastMove: move,

      moveHistory: [...moveHistory],

      gameOver: chess.isGameOver(),

      gameResult: chess.isGameOver()
        ? game.result
        : "",
    });
  });

  return snapshots;
}