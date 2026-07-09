import { useGame } from "../context/GameContext";

export default function GameList() {
  const { games } = useGame();

  if (games.length === 0) {
    return (
      <div className="text-zinc-400 text-center mt-10">
        No games uploaded.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-white font-semibold mb-2">
        📚 Games ({games.length})
      </h2>

      {games.map((game) => (
        <button
          key={game.id}
          className="bg-zinc-600 hover:bg-zinc-500 rounded-lg p-3 text-left transition"
        >
          <div className="text-white font-medium">
            {game.white} vs {game.black}
          </div>

          <div className="text-sm text-zinc-300">
            {game.event || "Unknown Event"}
          </div>

          <div className="text-xs text-zinc-400 mt-1">
            Result: {game.result}
          </div>
        </button>
      ))}
    </div>
  );
}