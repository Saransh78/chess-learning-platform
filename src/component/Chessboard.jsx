import { useState, useEffect } from "react";
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
import VerticalEvalBar from "./VerticalEvalBar";
import { generateSnapshots } from "../utils/snapshotGenerator";
import { convertBoardToFEN } from "../utils/boardConverter";
import { useGame } from "../context/GameContext";
import useStockfish from "../hooks/useStockfish";



export default function Chessboard({
  moveHistory,
  setMoveHistory,
  engineEnabled,
}) {
   const {
    analyzePosition,
    evaluation,
    depth,
    bestMove,
    pv,
} = useStockfish(engineEnabled);
const {
  boardHistory,
  setBoardHistory,
  currentPosition,
  setCurrentPosition,
  requestedPosition,
  setRequestedPosition,
  selectedGame,
  setEvaluation,
  setDepth,
  setBestMove,
  setPv,
} = useGame();


  const [boardPieces, setBoardPieces] = useState(
  pieces.map(piece => ({ ...piece }))
);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("white");
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [lastMove, setLastMove] = useState(null);
  const [promotionPawn, setPromotionPawn] = useState(null);
  const [promotionSquare, setPromotionSquare] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
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
function jumpToPosition(position) {
  if (position < 0) return;

if (position >= boardHistory.length) return;
  const snapshot = boardHistory[position];

  if (!snapshot) return;

  setCurrentPosition(position);

  setBoardPieces(snapshot.board);
  setCurrentTurn(snapshot.turn);
  setLastMove(snapshot.lastMove);
  setMoveHistory(snapshot.moveHistory);
  setGameOver(snapshot.gameOver);
  setGameResult(snapshot.gameResult);

  setSelectedPiece(null);
  setLegalMoves([]);
}
useEffect(() => {
  if (requestedPosition === null) return;

  jumpToPosition(requestedPosition);

  setRequestedPosition(null);
}, [requestedPosition]);
useEffect(() => {
  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      if (currentPosition > 0) {
        jumpToPosition(currentPosition - 1);
      }
    }

    if (event.key === "ArrowRight") {
      if (currentPosition < boardHistory.length - 1) {
        jumpToPosition(currentPosition + 1);
      }
    }

    if (event.key === "Home") {
      jumpToPosition(0);
    }

    if (event.key === "End") {
      jumpToPosition(boardHistory.length - 1);
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [currentPosition, boardHistory]);
useEffect(() => {
  if (!selectedGame) return;

  const snapshots = generateSnapshots(selectedGame);

  setBoardHistory(snapshots);

  const firstSnapshot = snapshots[0];

  setBoardPieces(firstSnapshot.board);
  setCurrentTurn(firstSnapshot.turn);
  setLastMove(firstSnapshot.lastMove);
  setMoveHistory(firstSnapshot.moveHistory);
  setGameOver(firstSnapshot.gameOver);
  setGameResult(firstSnapshot.gameResult);

  setCurrentPosition(0);

  setSelectedPiece(null);
  setLegalMoves([]);
}, [selectedGame]);
useEffect(() => {
  if (promotionPawn) return;
  if (!engineEnabled) return;

  const snapshot = boardHistory[currentPosition];

  const fen =
    snapshot?.fen ??
    convertBoardToFEN(boardPieces, currentTurn, lastMove);

  analyzePosition(fen);

}, [
  boardPieces,
  currentTurn,
  analyzePosition,
  promotionPawn,
  boardHistory,
  currentPosition,
  lastMove,
  engineEnabled,
]);
useEffect(() => {
    setEvaluation(evaluation);
    setDepth(depth);
    setBestMove(bestMove);
    setPv(pv);
}, [evaluation, depth, bestMove, pv, setEvaluation, setDepth, setBestMove, setPv]);
const rankLabels = isFlipped
  ? [1,2,3,4,5,6,7,8]
  : [8,7,6,5,4,3,2,1];

const fileLabels = isFlipped
  ? "hgfedcba".split("")
  : "abcdefgh".split("");

  const canGoBack = currentPosition > 0;
  const canGoForward = currentPosition < boardHistory.length - 1;

  const coordColor = (row, col) =>
    (row + col) % 2 === 0 ? "text-amber-950/50" : "text-amber-100/60";

  return (
    <div className="w-full min-w-0 max-w-[780px] animate-fade-in">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-stone/50 bg-charcoal/80 py-1.5 pl-3 pr-4 shadow-sm backdrop-blur">
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full ${
              currentTurn === "white"
                ? "bg-ivory shadow-[inset_0_-2px_2px_rgba(0,0,0,0.3)]"
                : "bg-obsidian ring-1 ring-ivory/60"
            }`}
          />
          <span className="text-sm font-medium capitalize text-ivory/90">
            {currentTurn} to move
          </span>
        </div>

        {gameOver && (
          <span className="inline-flex animate-rise items-center rounded-lg border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-sm font-medium text-gold">
            {gameResult}
          </span>
        )}
      </div>

      <div className="flex items-stretch gap-2.5">
        <VerticalEvalBar />
        <div className="relative mb-8 min-w-0 flex-1">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-12 rounded-[3rem] bg-bronze/[0.08] blur-3xl"
          />
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-ash/90 to-charcoal p-2 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.7)] ring-1 ring-stone/60 sm:p-2.5">
            <div className="relative overflow-hidden rounded-xl">
              <div className="grid aspect-square w-full grid-cols-8 grid-rows-8">
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
className={`relative flex items-center justify-center ${
  kingInCheck
    ? "bg-crimson"
    : isSelected
    ? "bg-bronze/45"
    : isLight
    ? "bg-amber-100"
    : "bg-amber-900"
}`}
> 
{isLegalMove && !piece && (
  <div className="absolute h-[26%] w-[26%] rounded-full bg-obsidian/25"></div>
)}
{isLegalMove && piece && (
  <div className="absolute inset-[5%] rounded-full border-[3px] border-obsidian/30"></div>
)}
        {piece && (
  <img
  src={pieceImages[piece.color][piece.type]}
  alt=""
   className="relative z-10 h-[84%] w-[84%] drop-shadow-[0_3px_4px_rgba(0,0,0,0.28)]"
/>
)}
      </div>
    );
  })}
</div>

              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-0 flex w-[5.5%] min-w-4 flex-col ${
                  isFlipped ? "flex-col-reverse" : ""
                }`}
              >
                {rankLabels.map((number, v) => {
                  const actualRow = isFlipped ? 7 - v : v;
                  return (
                    <span
                      key={number}
                      className={`flex flex-1 items-start justify-start pl-1 pt-1 text-[10px] font-semibold ${coordColor(
                        actualRow,
                        0
                      )}`}
                    >
                      {number}
                    </span>
                  );
                })}
              </div>

              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-[5.5%] min-h-4 ${
                  isFlipped ? "flex-row-reverse" : ""
                }`}
              >
                {fileLabels.map((letter, v) => {
                  const actualCol = isFlipped ? 7 - v : v;
                  return (
                    <span
                      key={letter}
                      className={`flex flex-1 items-end justify-end pb-0.5 pr-1 text-[10px] font-semibold ${coordColor(
                        7,
                        actualCol
                      )}`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-stone/60 bg-slate-ash/95 p-1.5 shadow-xl shadow-black/50 backdrop-blur">
            <button
              onClick={undoMove}
              disabled={!canGoBack}
              aria-label="Back"
              className="grid h-8 w-8 place-items-center rounded-full text-parchment transition-colors duration-150 hover:bg-stone/60 hover:text-ivory disabled:pointer-events-none disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={redoMove}
              disabled={!canGoForward}
              aria-label="Forward"
              className="grid h-8 w-8 place-items-center rounded-full text-parchment transition-colors duration-150 hover:bg-stone/60 hover:text-ivory disabled:pointer-events-none disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <span className="mx-0.5 h-5 w-px bg-stone/70" />
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              aria-label="Flip board"
              className="grid h-8 w-8 place-items-center rounded-full text-parchment transition-colors duration-150 hover:bg-stone/60 hover:text-ivory"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
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
