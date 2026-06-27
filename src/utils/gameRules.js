import { getLegalMoves } from "./moveGenerator";
import { getAttackedSquares } from "./moveGenerator";

export function findKing(color, boardPieces) {
  return boardPieces.find(
    (piece) =>
      piece.type === "king" &&
      piece.color === color
  );
}
export function isKingInCheck(
  kingColor,
  boardPieces
) {
  const king = findKing(kingColor, boardPieces);
  const enemyColor =
  kingColor === "white"
    ? "black"
    : "white";
    for (const piece of boardPieces) {
      if (piece.color !== enemyColor) {
    continue;
    }
  const enemyMoves = getAttackedSquares(
  piece,
  boardPieces
);
    for (const move of enemyMoves) {
      if (
  move.row === king.row &&
  move.col === king.col
) {
  return true;
}

    }
}
return false;

}
export function isMoveLegal(
  selectedPiece,
  destinationRow,
  destinationCol,
  boardPieces
) {
    let simulatedBoard = [...boardPieces];
    // Remove captured piece
  simulatedBoard = simulatedBoard.filter(
    (piece) =>
      !(
        piece.row === destinationRow &&
        piece.col === destinationCol
      )
  );

  // Move the selected piece
  simulatedBoard = simulatedBoard.map((piece) => {
    if (
      piece.row === selectedPiece.row &&
      piece.col === selectedPiece.col
    ) {
      return {
        ...piece,
        row: destinationRow,
        col: destinationCol,
      };
    }

    return piece;
  });

  return !isKingInCheck(
    selectedPiece.color,
    simulatedBoard
  );

}