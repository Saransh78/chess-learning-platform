function getPawnMoves(piece, boardPieces) {
  const moves = [];

  const direction = piece.color === "white" ? -1 : 1;
  const startingRow = piece.color === "white" ? 6 : 1;

  const nextRow = piece.row + direction;

  const pieceInFront = boardPieces.find(
    (p) => p.row === nextRow && p.col === piece.col
  );

  if (!pieceInFront) {
    moves.push({
      row: nextRow,
      col: piece.col,
    });
  }

  const twoStepsRow = piece.row + direction * 2;

  const pieceTwoSquaresAhead = boardPieces.find(
    (p) => p.row === twoStepsRow && p.col === piece.col
  );

  if (
    piece.row === startingRow &&
    !pieceInFront &&
    !pieceTwoSquaresAhead
  ) {
    moves.push({
      row: twoStepsRow,
      col: piece.col,
    });
  }
  const captureLeft = {
  row: nextRow,
  col: piece.col - 1,
};

const captureRight = {
  row: nextRow,
  col: piece.col + 1,
};

const leftPiece = boardPieces.find(
  (p) =>
    p.row === captureLeft.row &&
    p.col === captureLeft.col
);

const rightPiece = boardPieces.find(
  (p) =>
    p.row === captureRight.row &&
    p.col === captureRight.col
);

if (
  leftPiece &&
  leftPiece.color !== piece.color
) {
  moves.push(captureLeft);
}

if (
  rightPiece &&
  rightPiece.color !== piece.color
) {
  moves.push(captureRight);
}

  return moves;
}


export function getLegalMoves(piece, boardPieces) {
  switch (piece.type) {
    case "pawn":
      return getPawnMoves(piece, boardPieces);

    default:
      return [];
  }
}