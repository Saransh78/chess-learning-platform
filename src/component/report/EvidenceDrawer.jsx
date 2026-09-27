export default function EvidenceDrawer({ weakness, games, onClose }) {
  const rows = (games || []).map((game, index) => ({
    number: index + 1,
    players: `${game.white || "White"} – ${game.black || "Black"}`,
    result: game.result || "*",
    moves: game.moves ?? "—",
  }));

  return (
    <div
      role="dialog"
      aria-label={`Examples for weakness: ${weakness}`}
      className="absolute inset-y-0 right-0 z-10 flex w-full max-w-sm flex-col border-l border-stone/40 bg-charcoal shadow-[-24px_0_48px_-24px_rgba(0,0,0,0.7)] animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 border-b border-stone/30 p-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faded">
            View examples
          </p>
          <h4 className="mt-1 text-sm font-semibold leading-snug text-ivory">
            {weakness}
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close examples"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-parchment transition-colors duration-200 hover:bg-stone/50 hover:text-ivory"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {rows.length === 0 ? (
          <p className="text-[13px] leading-relaxed text-faded">
            No games available for this report.
          </p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.12em] text-faded">
                <th scope="col" className="pb-2 pr-2 font-medium">
                  Game
                </th>
                <th scope="col" className="pb-2 pr-2 font-medium">
                  Players
                </th>
                <th scope="col" className="pb-2 pr-2 font-medium">
                  Result
                </th>
                <th scope="col" className="pb-2 font-medium">
                  Moves
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/20">
              {rows.map((row) => (
                <tr key={row.number} className="text-ivory/90">
                  <td className="py-2 pr-2 tabular-nums text-gold">
                    {row.number}
                  </td>
                  <td className="max-w-[140px] truncate py-2 pr-2">
                    {row.players}
                  </td>
                  <td className="py-2 pr-2 tabular-nums">{row.result}</td>
                  <td className="py-2 tabular-nums">{row.moves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="mt-4 text-xs leading-relaxed text-faded">
          Move-level examples (played move, best move, CPL) will appear here
          once the positions payload ships.
        </p>
      </div>

      <div className="border-t border-stone/30 p-4">
        <button
          type="button"
          disabled
          title="Wiring not available yet"
          className="w-full cursor-not-allowed rounded-xl border border-stone/60 px-4 py-2.5 text-sm font-semibold text-faded"
        >
          Open Position
        </button>
      </div>
    </div>
  );
}
