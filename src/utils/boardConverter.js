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

export function convertBoardToFEN(
  boardPieces,
  turn = "white",
  lastMove = null
) {
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

  const findUnmoved = (type, color, row, col) =>
    boardPieces.find(
      (piece) =>
        piece.type === type &&
        piece.color === color &&
        piece.row === row &&
        piece.col === col &&
        !piece.hasMoved
    );

  const whiteKing = findUnmoved("king", "white", 7, 4);
  const blackKing = findUnmoved("king", "black", 0, 4);

  const castling =
    (whiteKing && findUnmoved("rook", "white", 7, 7) ? "K" : "") +
    (whiteKing && findUnmoved("rook", "white", 7, 0) ? "Q" : "") +
    (blackKing && findUnmoved("rook", "black", 0, 7) ? "k" : "") +
    (blackKing && findUnmoved("rook", "black", 0, 0) ? "q" : "");

  let enPassant = "-";

  if (
    lastMove &&
    lastMove.piece === "pawn" &&
    typeof lastMove.fromRow === "number" &&
    Math.abs(lastMove.toRow - lastMove.fromRow) === 2
  ) {
    const epRow = (lastMove.fromRow + lastMove.toRow) / 2;

    enPassant = `${"abcdefgh"[lastMove.toCol]}${8 - epRow}`;
  }

  return (
    fenRows.join("/") +
    ` ${turn === "white" ? "w" : "b"} ${castling || "-"} ${enPassant} 0 1`
  );
}