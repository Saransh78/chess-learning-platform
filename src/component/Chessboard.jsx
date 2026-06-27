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

export default function Chessboard() {
  const [boardPieces, setBoardPieces] = useState(pieces);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [lastMove, setLastMove] = useState(null);
function isLegalSquare(row, col) {
    return legalMoves.some(
      (move) => move.row === row && move.col === col
    );
  }
  
console.log(selectedPiece);
  return (
    <div>
    <h2 className="text-xl font-semibold mb-3">
  Turn: {currentTurn}
</h2>
{gameOver && (
  <h3 className="text-2xl font-bold text-green-400 mb-3">
    {gameResult}
  </h3>
)}
    <div className="flex gap-2">
        <div className="flex flex-col h-[600px]">
        {
            [8,7,6,5,4,3,2,1].map((Number) => (
                <div key={Number} className="flex-1 text-center">
                    {Number}
                </div>
            ))
        }


      </div>
      <div>
    <div className="grid grid-cols-8 grid-rows-8 w-[600px] h-[600px] border">
  {Array.from({ length: 64 }).map((_, index) => {
    const row = Math.floor(index / 8);
    const col = index % 8;

    const piece = boardPieces.find(
  (p) => p.row === row && p.col === col
);

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
    if (gameOver) {
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
  const promotedPieces = updatedPieces.map((piece) => {
  if (
    piece.type === "pawn" &&
    (
      (piece.color === "white" && piece.row === 0) ||
      (piece.color === "black" && piece.row === 7)
    )
  ) {
    return {
      ...piece,
      type: "queen",
    };
  }

  return piece;
});

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
setLastMove({
  piece: selectedPiece.type,
  color: selectedPiece.color,
  fromRow: selectedPiece.row,
  fromCol: selectedPiece.col,
  toRow: row,
  toCol: col,
});

setCurrentTurn(opponent);

}
  }
}}
  className={`${
  isSelected
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
  {"abcdefgh".split("").map((letter) => (
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
    </div>
    
  );
}
