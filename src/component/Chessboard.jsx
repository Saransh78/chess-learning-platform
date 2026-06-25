import { useState } from "react";
import { pieces } from "../data/startingPosition";
import { pieceImages } from "../data/pieceImages";
import { getLegalMoves } from "../utils/moveGenerator" 

export default function Chessboard() {
  const [boardPieces, setBoardPieces] = useState(pieces);
const [selectedPiece, setSelectedPiece] = useState(null);
const [legalMoves, setLegalMoves] = useState([]);
function isLegalSquare(row, col) {
    return legalMoves.some(
      (move) => move.row === row && move.col === col
    );
  }
  
console.log(selectedPiece);
  return (
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
  if (!selectedPiece) {
    if (piece) {
      setSelectedPiece(piece);
      setLegalMoves(getLegalMoves(piece, boardPieces));
    }
  } else {
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
}

else if (isLegalDestination) {
  let piecesAfterCapture = boardPieces;

  if (
    piece &&
    piece.color !== selectedPiece.color
  ) {
    piecesAfterCapture = boardPieces.filter(
      (p) => !(p.row === row && p.col === col)
    );
  }

  const updatedPieces = piecesAfterCapture.map((p) => {
    if (
      p.row === selectedPiece.row &&
      p.col === selectedPiece.col
    ) {
      return {
        ...p,
        row,
        col,
      };
    }

    return p;
  });

  setBoardPieces(updatedPieces);
  setSelectedPiece(null);
  setLegalMoves([]);

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
        {piece && (
  <img
    src={pieceImages[piece.color][piece.type]}
    alt=""
    className="w-16 h-16"
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
  );
}
