const pieceMap = {
  p: "pawn",
  r: "rook",
  n: "knight",
  b: "bishop",
  q: "queen",
  k: "king",
};

export function convertChessBoard(chessBoard) {
  const pieces = [];

  chessBoard.forEach((row, rowIndex) => {
    row.forEach((square, colIndex) => {
      if (!square) return;

      pieces.push({
        type: pieceMap[square.type],

        color:
          square.color === "w"
            ? "white"
            : "black",

        row: rowIndex,

        col: colIndex,

        hasMoved: true,
      });
    });
  });

  return pieces;
}