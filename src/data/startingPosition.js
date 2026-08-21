export const pieceSymbols = {
  black: {
    rook: "♜",
    knight: "♞",
    bishop: "♝",
    queen: "♛",
    king: "♚",
    pawn: "♟",
  },
  white: {
    rook: "♖",
    knight: "♘",
    bishop: "♗",
    queen: "♕",
    king: "♔",
    pawn: "♙",
  },
};
export const pieces = [
  // Black back rank
  { type: "rook", color: "black", row: 0, col: 0, hasMoved: false },
  { type: "knight", color: "black", row: 0, col: 1, hasMoved: false },
  { type: "bishop", color: "black", row: 0, col: 2, hasMoved: false },
  { type: "queen", color: "black", row: 0, col: 3, hasMoved: false },
  { type: "king", color: "black", row: 0, col: 4, hasMoved: false },
  { type: "bishop", color: "black", row: 0, col: 5, hasMoved: false },
  { type: "knight", color: "black", row: 0, col: 6, hasMoved: false },
  { type: "rook", color: "black", row: 0, col: 7, hasMoved: false },

  // Black pawns
  ...Array.from({ length: 8 }, (_, col) => ({
    type: "pawn",
    color: "black",
    row: 1,
    col,
    hasMoved: false,
  })),

  // White pawns
  ...Array.from({ length: 8 }, (_, col) => ({
    type: "pawn",
    color: "white",
    row: 6,
    col,
    hasMoved: false,
  })),

  // White back rank
  { type: "rook", color: "white", row: 7, col: 0, hasMoved: false },
  { type: "knight", color: "white", row: 7, col: 1, hasMoved: false },
  { type: "bishop", color: "white", row: 7, col: 2, hasMoved: false },
  { type: "queen", color: "white", row: 7, col: 3, hasMoved: false },
  { type: "king", color: "white", row: 7, col: 4, hasMoved: false },
  { type: "bishop", color: "white", row: 7, col: 5, hasMoved: false },
  { type: "knight", color: "white", row: 7, col: 6, hasMoved: false },
  { type: "rook", color: "white", row: 7, col: 7, hasMoved: false },
];