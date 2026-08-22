import { useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";

function squareName(row, col) {
  const files = "abcdefgh";
  const file = files[col];
  const rank = 8 - row;

  return file + rank;
}

function formatMove(move) {
  if (typeof move === "string") {
    return move;
  }

  const destination = squareName(move.toRow, move.toCol);

  switch (move.piece) {
    case "pawn":
      return destination;
    case "knight":
      return "N" + destination;
    case "bishop":
      return "B" + destination;
    case "rook":
      return "R" + destination;
    case "queen":
      return "Q" + destination;
    case "king":
      return "K" + destination;
    default:
      return destination;
  }
}

const MOVE_BASE =
  "rounded-md px-2 py-1.5 text-left text-[13px] font-medium leading-none transition-all duration-100";

export default function MoveHistory({
  moveHistory,
  jumpToPosition,
}) {
  const { selectedGame, currentPosition } = useGame();

  const visibleMoves = selectedGame ? selectedGame.moves : moveHistory;

  const currentRef = useRef(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [currentPosition]);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-baseline justify-between px-1 pb-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-faded">
          {selectedGame ? "Game Moves" : "Session Moves"}
        </h2>
        <span className="truncate pl-3 text-[11px] text-faded/90">
          {selectedGame
            ? `${selectedGame.white} vs ${selectedGame.black}`
            : "Live board"}
        </span>
      </div>

      {visibleMoves.length === 0 ? (
        <p className="mt-14 px-4 text-center text-sm text-faded">
          No moves yet.
        </p>
      ) : (
        <ol className="scrollbar-thin space-y-0.5 pr-0.5">
          {Array.from({
            length: Math.ceil(visibleMoves.length / 2),
          }).map((_, index) => {
            const whiteIndex = index * 2 + 1;
            const blackIndex = index * 2 + 2;
            const whiteMove = visibleMoves[index * 2];
            const blackMove = visibleMoves[index * 2 + 1];

            const whiteActive = currentPosition === whiteIndex;
            const blackActive = currentPosition === blackIndex;

            return (
              <li
                key={index}
                className="grid grid-cols-[1.75rem_1fr_1fr] items-center gap-x-1.5 rounded-lg px-1 py-0.5 hover:bg-white/[0.03]"
              >
                <span className="pr-1 text-right text-[11px] tabular-nums text-faded/70">
                  {index + 1}.
                </span>

                <button
                  ref={whiteActive ? currentRef : undefined}
                  onClick={() => jumpToPosition(whiteIndex)}
                  className={`${MOVE_BASE} ${
                    whiteActive
                      ? "bg-bronze/15 text-gold ring-1 ring-bronze/30"
                      : "text-ivory/85 hover:bg-white/[0.04] hover:text-ivory"
                  }`}
                >
                  {whiteMove ? formatMove(whiteMove) : ""}
                </button>

                <button
                  ref={blackActive ? currentRef : undefined}
                  onClick={() => jumpToPosition(blackIndex)}
                  className={`${MOVE_BASE} ${
                    blackActive
                      ? "bg-bronze/15 text-gold ring-1 ring-bronze/30"
                      : "text-parchment hover:bg-white/[0.04] hover:text-ivory"
                  }`}
                >
                  {blackMove ? formatMove(blackMove) : ""}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
