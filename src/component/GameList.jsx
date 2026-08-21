import { useGame } from "../context/GameContext";
import usePgnImport from "../hooks/usePgnImport";

export default function GameList() {
  const { games, selectedGame, setSelectedGame } = useGame();
  const { openPicker, fileInput } = usePgnImport();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-1 pb-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-faded">
          Games{" "}
          <span className="ml-1 rounded-full bg-slate-ash/80 px-2 py-0.5 text-[11px] font-semibold tracking-normal text-parchment">
            {games.length}
          </span>
        </h2>

        <button
          onClick={openPicker}
          className="rounded-md px-2 py-1 text-xs font-medium text-bronze transition-colors duration-150 hover:bg-bronze/10 hover:text-gold"
        >
          + Import PGNs
        </button>
      </div>

      {games.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-parchment">No games yet.</p>
          <button
            onClick={openPicker}
            className="mt-3 text-xs font-medium text-bronze hover:text-gold"
          >
            Import your first PGN
          </button>
        </div>
      ) : (
        <ul className="scrollbar-thin space-y-2 pr-0.5">
          {games.map((game) => {
            const isSelected = selectedGame?.id === game.id;
            return (
              <li key={game.id}>
                <button
                  onClick={() => setSelectedGame(game)}
                  aria-current={isSelected ? "true" : undefined}
                  className={`group relative w-full overflow-hidden rounded-xl p-4 pl-[18px] text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-slate-ash/70 shadow-lg shadow-black/25 ring-1 ring-bronze/40"
                      : "bg-charcoal/60 ring-1 ring-stone/30 hover:-translate-y-0.5 hover:bg-slate-ash/50 hover:shadow-lg hover:shadow-black/30 hover:ring-stone/50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-bronze transition-all duration-200 ${
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-30"
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ivory">
                        {game.white}
                        <span className="mx-1.5 text-[10px] uppercase tracking-wider text-faded">vs</span>
                        {game.black}
                      </p>
                      <p className="mt-1 truncate text-xs text-faded">
                        {game.event || "Unknown event"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-md bg-obsidian/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-gold ring-1 ring-stone/40">
                      {game.result}
                    </span>
                  </div>

                  {Array.isArray(game.moves) && game.moves.length > 0 && (
                    <p className="mt-2.5 text-[11px] tabular-nums text-faded">
                      {Math.ceil(game.moves.length / 2)} moves
                    </p>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {fileInput}
    </div>
  );
}
