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

  const destination = squareName(
    move.toRow,
    move.toCol
  );

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
export default function MoveHistory({
  moveHistory,
  currentPosition,
  jumpToPosition,
}) {
  const { selectedGame } = useGame();
 const visibleMoves =
  selectedGame
    ? selectedGame.moves
    : moveHistory;
  return (
    <div className="flex-1 bg-zinc-700 rounded-lg p-3 text-white overflow-y-auto">
      <h2 className="text-lg font-semibold mb-3">
        Move History
      </h2>

      {Array.from({
  length: Math.ceil(
  visibleMoves.length / 2
),
}).map((_, index) => {
  const whiteMove = visibleMoves[index * 2];
  const blackMove = visibleMoves[index * 2 + 1];

  return (
    <div
      key={index}
      className="grid grid-cols-[40px_1fr_1fr] items-center py-2 px-2 hover:bg-zinc-600 rounded cursor-pointer"
    >
      <div className="text-zinc-500 text-sm">
        {index + 1}.
      </div>

      <button
  onClick={() => jumpToPosition(index * 2 + 1)}
  className={`font-medium text-left hover:text-blue-400 ${
  currentPosition === index * 2 + 1
    ? "text-blue-400 font-bold"
    : ""
}`}
>
  {whiteMove && formatMove(whiteMove)}
</button>

      <button
  onClick={() => jumpToPosition(index * 2 + 2)}
  className={`font-medium text-left hover:text-blue-400 ${
  currentPosition === index * 2 + 2
    ? "text-blue-400 font-bold"
    : ""
}`}
>
  {blackMove && formatMove(blackMove)}
</button>
    </div>
  );
})}
    </div>
  );
}