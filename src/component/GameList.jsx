import { useGame } from "../context/GameContext";

export default function GameList() {
  const {
  games,
  selectedGame,
  setSelectedGame,
} = useGame();

  if (games.length === 0) {
    return (
      <div className="text-ivory/60 text-center mt-10">
        No games uploaded.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-ivory font-semibold mb-2">
        📚 Games ({games.length})
      </h2>

      {games.map((game) => (
        <button
  key={game.id}
  onClick={() => setSelectedGame(game)}
  className={`rounded-xl p-4 text-left border transition-all duration-200 ${
    selectedGame?.id === game.id
      ? "bg-stone/30 border-bronze/70 shadow-lg shadow-bronze/10"
      : "bg-charcoal/70 border-stone/30 hover:-translate-y-0.5 hover:border-bronze/50 hover:shadow-lg hover:shadow-black/30"
  }`}
>
          <div className="text-ivory font-medium">
            {game.white} <span className="text-bronze">vs</span> {game.black}
          </div>

          <div className="text-sm text-ivory/70 mt-0.5">
            {game.event || "Unknown Event"}
          </div>

          <div className="mt-2.5">
            <span className="inline-block rounded-full bg-bronze/10 border border-bronze/30 px-2 py-0.5 text-xs text-gold">
              Result: {game.result}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}