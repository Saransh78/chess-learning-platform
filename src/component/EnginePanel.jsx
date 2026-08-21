import { useGame } from "../context/GameContext";

export default function EnginePanel({ engineEnabled }) {
  const { evaluation, depth, bestMove, pv } = useGame();

  const rows = [
    { label: "Best move", value: bestMove },
    { label: "Depth", value: depth != null ? String(depth) : null },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-slate-ash/40 p-4">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-faded">
          Engine Output
        </h3>

        <dl className="mt-4 space-y-3.5">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <dt className="text-parchment">{row.label}</dt>
              <dd className="font-mono text-[13px] font-semibold text-ivory tabular-nums">
                {row.value ?? "—"}
              </dd>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-parchment">Evaluation</dt>
            <dd className="font-mono text-[13px] font-semibold text-bronze tabular-nums">
              {(evaluation ?? 0) >= 0 ? "+" : ""}
              {(evaluation ?? 0).toFixed(2)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl bg-slate-ash/40 p-4">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-faded">
          Principal Variation
        </h3>
        <p className="mt-3 font-mono text-xs leading-relaxed text-parchment break-words">
          {pv || "Waiting for engine…"}
        </p>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-faded">
        {engineEnabled
          ? "Stockfish re-evaluates automatically after every move."
          : "Engine is off. Enable Stockfish in the header to analyze positions."}
      </p>
    </div>
  );
}
