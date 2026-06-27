function getPieceAt(row, col, boardPieces) {
  return boardPieces.find(
    (piece) => piece.row === row && piece.col === col
  );
}

function getPawnMoves(piece, boardPieces) {
  const moves = [];

  const direction = piece.color === "white" ? -1 : 1;
  const startingRow = piece.color === "white" ? 6 : 1;

  const nextRow = piece.row + direction;

  const pieceInFront = getPieceAt(
  nextRow,
  piece.col,
  boardPieces
  );

  if (!pieceInFront) {
    moves.push({
      row: nextRow,
      col: piece.col,
    });
  }

  const twoStepsRow = piece.row + direction * 2;

  const pieceTwoSquaresAhead = getPieceAt(
  twoStepsRow,
  piece.col,
  boardPieces
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

const leftPiece = getPieceAt(
  captureLeft.row,
  captureLeft.col,
  boardPieces
);
const rightPiece = getPieceAt(
  captureRight.row,
  captureRight.col,
  boardPieces
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
function getPawnAttackSquares(piece) {
  const attacks = [];

  const direction = piece.color === "white" ? -1 : 1;

  const leftCol = piece.col - 1;
  const rightCol = piece.col + 1;
  const nextRow = piece.row + direction;

  if (nextRow >= 0 && nextRow <= 7) {
    if (leftCol >= 0) {
      attacks.push({
        row: nextRow,
        col: leftCol,
      });
    }

    if (rightCol <= 7) {
      attacks.push({
        row: nextRow,
        col: rightCol,
      });
    }
  }

  return attacks;
}
function getKnightMoves(piece, boardPieces) {
  const moves = [];
  const knightOffsets = [
  [-2, -1],
  [-2, 1],
  [2, -1],
  [2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
];
for (const [rowOffset, colOffset] of knightOffsets) {
  const newRow = piece.row + rowOffset;
  const newCol = piece.col + colOffset;
  if (
  newRow < 0 ||
  newRow > 7 ||
  newCol < 0 ||
  newCol > 7
) {
  continue;
}
const destinationPiece = getPieceAt(
  newRow,
  newCol,
  boardPieces
);
if (
  !destinationPiece ||
  destinationPiece.color !== piece.color
) {
  moves.push({
    row: newRow,
    col: newCol,
  });
}

}
  
  return moves;
}
function getRookMoves(piece, boardPieces) {
  const moves = [];
  const rookDirections = [
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1],  // Right
  ];
  for (const [rowDirection, colDirection] of rookDirections) {
    let currentRow = piece.row + rowDirection;
    let currentCol = piece.col + colDirection;
    while (
  currentRow >= 0 &&
  currentRow <= 7 &&
  currentCol >= 0 &&
  currentCol <= 7
        ){
           const destinationPiece = getPieceAt(
  currentRow,
  currentCol,
  boardPieces
);

if (!destinationPiece) {
  moves.push({
    row: currentRow,
    col: currentCol,
  });

  currentRow += rowDirection;
  currentCol += colDirection;
}

else if (destinationPiece.color !== piece.color) {
  moves.push({
    row: currentRow,
    col: currentCol,
  });

  break;
}

else {
  break;
}
        }
  }  


  return moves;
}
function getBishopMoves(piece, boardPieces) {
  const moves = [];
    const bishopDirections = [
  [-1, -1], // Up Left
  [-1, 1],  // Up Right
  [1, -1],  // Down Left
  [1, 1],   // Down Right
];
  for (const [rowDirection, colDirection] of bishopDirections)  {
    let currentRow = piece.row + rowDirection;
    let currentCol = piece.col + colDirection;
    while (
  currentRow >= 0 &&
  currentRow <= 7 &&
  currentCol >= 0 &&
  currentCol <= 7
        ){
           const destinationPiece = getPieceAt(
  currentRow,
  currentCol,
  boardPieces
);

if (!destinationPiece) {
  moves.push({
    row: currentRow,
    col: currentCol,
  });

  currentRow += rowDirection;
  currentCol += colDirection;
}

else if (destinationPiece.color !== piece.color) {
  moves.push({
    row: currentRow,
    col: currentCol,
  });

  break;
}

else {
  break;
}
        }
  } 
  

  return moves;
}
function getQueenMoves(piece, boardPieces){
  const moves = [];
    const queenDirections = [
  [-1, -1], // Up Left
  [-1, 1],  // Up Right
  [1, -1],  // Down Left
  [1, 1],   // Down Right
  [-1, 0], // Up
  [1, 0],  // Down
  [0, -1], // Left
  [0, 1],  // Right
  ];
    for (const [rowDirection, colDirection] of queenDirections) {
    let currentRow = piece.row + rowDirection;
    let currentCol = piece.col + colDirection;
    while (
  currentRow >= 0 &&
  currentRow <= 7 &&
  currentCol >= 0 &&
  currentCol <= 7
        ){
           const destinationPiece = getPieceAt(
  currentRow,
  currentCol,
  boardPieces
);

if (!destinationPiece) {
  moves.push({
    row: currentRow,
    col: currentCol,
  });

  currentRow += rowDirection;
  currentCol += colDirection;
}

else if (destinationPiece.color !== piece.color) {
  moves.push({
    row: currentRow,
    col: currentCol,
  });

  break;
}

else {
  break;
}
        }
  }  


  return moves;

  

}
function getKingMoves(piece, boardPieces){
   const moves = [];
  const kingOffsets = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];
for (const [rowOffset, colOffset] of kingOffsets) {
  const newRow = piece.row + rowOffset;
  const newCol = piece.col + colOffset;
  if (
  newRow < 0 ||
  newRow > 7 ||
  newCol < 0 ||
  newCol > 7
) {
  continue;
}
const destinationPiece = getPieceAt(
  newRow,
  newCol,
  boardPieces
);
if (
  !destinationPiece ||
  destinationPiece.color !== piece.color
) {
  moves.push({
    row: newRow,
    col: newCol,
  });
}

}
  
  return moves;
}
export function getAttackedSquares(piece, boardPieces) {
  switch (piece.type) {
    case "pawn":
      return getPawnAttackSquares(piece);

    default:
      return getLegalMoves(piece, boardPieces);
  }
}
export function getLegalMoves(piece, boardPieces) {
  switch (piece.type) {
    case "pawn":
      return getPawnMoves(piece, boardPieces); 

     case "knight":
      return getKnightMoves(piece, boardPieces);

    case "rook":
    return getRookMoves(piece, boardPieces);

    case "bishop":
    return getBishopMoves(piece, boardPieces);

    case "queen":
    return getQueenMoves(piece, boardPieces);

    case "king":
    return getKingMoves(piece, boardPieces);

    default:
      return [];
  }
}