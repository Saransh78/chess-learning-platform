import { useState } from "react";
import { pieces } from "../data/startingPosition";
import { pieceImages } from "../data/pieceImages";
import { getLegalMoves } from "../utils/moveGenerator" 
import {
  isKingInCheck,
  isMoveLegal,
  isCheckmate,
   isStalemate,
} from "../utils/gameRules";
import PromotionModal from "./PromotionalModal";

export default function Chessboard({
  moveHistory,
  setMoveHistory,
  currentPosition,
  setCurrentPosition,
}) {
  const [boardPieces, setBoardPieces] = useState(pieces);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [lastMove, setLastMove] = useState(null);
  const [promotionPawn, setPromotionPawn] = useState(null);
  const [promotionSquare, setPromotionSquare] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [boardHistory, setBoardHistory] = useState([
  {
    board: pieces,
    turn: "white",
    lastMove: null,
    gameOver: false,
    gameResult: "",
    moveHistory: [],
  },
]);
function isLegalSquare(row, col) {
    return legalMoves.some(
      (move) => move.row === row && move.col === col
    );
  }
  function promotePawn(pieceType) {
  const promotedBoard = boardPieces.map((piece) => {
    if (
      piece.row === promotionPawn.row &&
      piece.col === promotionPawn.col
    ) {
      return {
        ...piece,
        type: pieceType,
      };
    }

    return piece;
  });
  const opponent =
  currentTurn === "white"
    ? "black"
    : "white";

  if (isCheckmate(opponent, promotedBoard)) {
  const winner =
    currentTurn.charAt(0).toUpperCase() +
    currentTurn.slice(1);

  setBoardPieces(promotedBoard);

  setGameOver(true);
  setGameResult(`${winner} won by checkmate.`);

  setPromotionPawn(null);
  setPromotionSquare(null);

  return;
}

if (isStalemate(opponent, promotedBoard)) {
  setBoardPieces(promotedBoard);

  setGameOver(true);
  setGameResult("Draw by stalemate.");

  setPromotionPawn(null);
  setPromotionSquare(null);

  return;
}

setBoardPieces(promotedBoard);
const newHistory = [
  ...boardHistory.slice(0, currentPosition + 1),
  {
    board: promotedBoard,
    turn: opponent,
    lastMove,
    gameOver: false,
    gameResult: "",
    moveHistory: [...moveHistory],
  },
];

setBoardHistory(newHistory);
setCurrentPosition(newHistory.length - 1);
setPromotionPawn(null);
setPromotionSquare(null);

setCurrentTurn(opponent);
  }
  function undoMove() {
  if (currentPosition === 0) return;

  const previousPosition = currentPosition - 1;
  const snapshot = boardHistory[previousPosition];

  setCurrentPosition(previousPosition);

  setBoardPieces(snapshot.board);
  setCurrentTurn(snapshot.turn);
  setLastMove(snapshot.lastMove);
  setMoveHistory(snapshot.moveHistory);
  setGameOver(snapshot.gameOver);
  setGameResult(snapshot.gameResult);

  setSelectedPiece(null);
  setLegalMoves([]);
}
function redoMove() {
  if (currentPosition >= boardHistory.length - 1) {
    return;
  }

  const nextPosition = currentPosition + 1;
  const snapshot = boardHistory[nextPosition];

  setCurrentPosition(nextPosition);

  setBoardPieces(snapshot.board);
  setCurrentTurn(snapshot.turn);
  setLastMove(snapshot.lastMove);
  setMoveHistory(snapshot.moveHistory);
  setGameOver(snapshot.gameOver);
  setGameResult(snapshot.gameResult);

  setSelectedPiece(null);
  setLegalMoves([]);
}
console.log(selectedPiece);
const rankLabels = isFlipped
  ? [1,2,3,4,5,6,7,8]
  : [8,7,6,5,4,3,2,1];

const fileLabels = isFlipped
  ? "hgfedcba".split("")
  : "abcdefgh".split("");
  return (
    <div>
<div className="flex justify-between items-center mb-3">
  <h2 className="text-xl font-semibold">
    Turn: {currentTurn}
  </h2>

<div className="flex gap-2">
  <button
    onClick={undoMove}
    disabled={currentPosition === 0}
    className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-white"
  >
    ⬅
  </button>

  <button
    onClick={redoMove}
    disabled={currentPosition === boardHistory.length - 1}
    className="bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-white"
  >
    ➡
  </button>

  <button
    onClick={() => setIsFlipped(!isFlipped)}
    className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-white"
  >
    Flip
  </button>
</div>
</div>
{gameOver && (
  <h3 className="text-2xl font-bold text-green-400 mb-3">
    {gameResult}
  </h3>
)}
    <div className="flex gap-2">
        <div className="flex flex-col h-[600px]">
        
                {rankLabels.map((number) => (
  <div key={number} className="flex-1 text-center">
    {number}
  </div>
))}


      </div>
      <div>
    <div className="grid grid-cols-8 grid-rows-8 w-[600px] h-[600px] border">
  {Array.from({ length: 64 }).map((_, index) => {
    let row = Math.floor(index / 8);
let col = index % 8;

if (isFlipped) {
  row = 7 - row;
  col = 7 - col;
}

    const piece = boardPieces.find(
  (p) => p.row === row && p.col === col
);
const kingInCheck =
  piece &&
  piece.type === "king" &&
  isKingInCheck(piece.color, boardPieces);

    const isLight = (row + col) % 2 === 0;
    const isSelected =
  selectedPiece?.row === row &&
  selectedPiece?.col === col;
  const isLegalMove = isLegalSquare(row, col);

    return (
    <div

  key={index}
  onClick={() => {
    const isLegalDestination = isLegalSquare(row, col);
   if (gameOver || promotionPawn) {
  return;
}
  if (!selectedPiece) {
     if (piece && piece.color === currentTurn) {
      setSelectedPiece(piece);
      setLegalMoves(
  getLegalMoves(
    piece,
    boardPieces,
    lastMove
  )
);
     }
     }else {
   if (
  selectedPiece.row === row &&
  selectedPiece.col === col
) {
  setSelectedPiece(null);
  setLegalMoves([]);
}

else if (
  piece &&
  piece.color === selectedPiece.color
) {
  setSelectedPiece(piece);
  setLegalMoves(
  getLegalMoves(
    piece,
    boardPieces,
    lastMove
  )
);
}

else if (
  isLegalDestination &&
  isMoveLegal(
    selectedPiece,
    row,
    col,
    boardPieces
  )
) {
  let piecesAfterCapture = boardPieces;

  if (
    piece &&
    piece.color !== selectedPiece.color
  ) {
    piecesAfterCapture = boardPieces.filter(
      (p) => !(p.row === row && p.col === col)
    );
  }
  const isEnPassant =
  selectedPiece.type === "pawn" &&
  col !== selectedPiece.col &&
  !piece;
  if (isEnPassant) {
  piecesAfterCapture = piecesAfterCapture.filter(
    (p) =>
      !(
        p.row === selectedPiece.row &&
        p.col === col
      )
  );
}
  const isCastling =
  selectedPiece.type === "king" &&
  Math.abs(col - selectedPiece.col) === 2;

  const updatedPieces = piecesAfterCapture.map((p) => {
    if (
      p.row === selectedPiece.row &&
      p.col === selectedPiece.col
    ) {
      return {
        ...p,
        row,
        col,
        hasMoved: true,
      };
    }
    if (
  isCastling &&
  p.type === "rook" &&
  p.color === selectedPiece.color
) {
  const isKingSide = col > selectedPiece.col;
  if (
  isKingSide &&
  p.col === 7
) {
  return {
    ...p,
    col: 5,
    hasMoved: true,
  };
}
if (
  !isKingSide &&
  p.col === 0
) {
  return {
    ...p,
    col: 3,
    hasMoved: true,
  };
}

}

    return p;
  });
let promotedPieces = updatedPieces;

const pawnToPromote = updatedPieces.find(
  (piece) =>
    piece.type === "pawn" &&
    (
      (piece.color === "white" && piece.row === 0) ||
      (piece.color === "black" && piece.row === 7)
    )
);
if (pawnToPromote) {
  setPromotionPawn(pawnToPromote);
  setPromotionSquare({
    row: pawnToPromote.row,
    col: pawnToPromote.col,
  });

  setBoardPieces(updatedPieces);

  return;
}
setBoardPieces(promotedPieces);

const opponent =
  currentTurn === "white"
    ? "black"
    : "white";

if (isCheckmate(opponent,promotedPieces)) {
  const winner =
    currentTurn.charAt(0).toUpperCase() +
    currentTurn.slice(1);

  setGameOver(true);
  setGameResult(`${winner} won by checkmate.`);

  return;
}
if (isStalemate(opponent, promotedPieces)) {
  setGameOver(true);
  setGameResult("Draw by stalemate.");
  return;
}

setSelectedPiece(null);
setLegalMoves([]);
const move = {
  piece: selectedPiece.type,
  color: selectedPiece.color,
  fromRow: selectedPiece.row,
  fromCol: selectedPiece.col,
  toRow: row,
  toCol: col,

  captured: !!piece || isEnPassant,
  castling: isCastling,
  enPassant: isEnPassant,
};
setLastMove(move);
setMoveHistory([
  ...moveHistory,
  move,
]);


setCurrentTurn(opponent);
const newHistory = [
  ...boardHistory.slice(0, currentPosition + 1),
  {
  board: promotedPieces,
  turn: opponent,
  lastMove: move,
  moveHistory: [
    ...moveHistory,
    move,
  ],
  gameOver: false,
  gameResult: "",
}
];

setBoardHistory(newHistory);
setCurrentPosition(newHistory.length - 1);

}
  }
}}
className={`${
  kingInCheck
    ? "bg-red-600"
    : isSelected
    ? "bg-blue-500"
    : isLight
    ? "bg-amber-100"
    : "bg-amber-900"
} relative flex items-center justify-center text-6xl`}
> 
{isLegalMove && !piece && (
  <div className="absolute w-5 h-5 rounded-full bg-black/20"></div>
)}
{isLegalMove && piece && (
  <div className="absolute inset-1 rounded-full border-4 border-black/25"></div>
)}
        {piece && (
  <img
  src={pieceImages[piece.color][piece.type]}
  alt=""
  className="relative z-10 w-16 h-16"
/>
)}
      </div>
    );
  })}
</div>
<div className="flex w-[600px]">
  {fileLabels.map((letter) => (
    <div
      key={letter}
      className="flex-1 text-center text-white"
    >
      {letter}
    </div>
  ))}
</div>

</div>
    </div>
    <PromotionModal
  promotionPawn={promotionPawn}
  promotePawn={promotePawn}
/>

    </div>
    
  );
}
