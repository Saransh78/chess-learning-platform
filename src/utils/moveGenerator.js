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