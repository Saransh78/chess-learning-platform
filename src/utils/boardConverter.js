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
const reversePieceMap = {
  pawn: "p",
  rook: "r",
  knight: "n",
  bishop: "b",
  queen: "q",
  king: "k",
};

export function convertBoardToFEN(boardPieces, turn = "white") {
  const board = Array.from({ length: 8 }, () =>
    Array(8).fill(null)
  );

  boardPieces.forEach((piece) => {
    let symbol = reversePieceMap[piece.type];

    if (piece.color === "white") {
      symbol = symbol.toUpperCase();
    }

    board[piece.row][piece.col] = symbol;
  });

  const fenRows = board.map((row) => {
    let fenRow = "";
    let empty = 0;

    row.forEach((square) => {
      if (!square) {
        empty++;
      } else {
        if (empty > 0) {
          fenRow += empty;
          empty = 0;
        }

        fenRow += square;
      }
    });

    if (empty > 0) {
      fenRow += empty;
    }

    return fenRow;
  });

  return (
    fenRows.join("/") +
    ` ${turn === "white" ? "w" : "b"} KQkq - 0 1`
  );
}