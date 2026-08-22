import { useGame } from "../context/GameContext";

export default function EvaluationBar({ engineEnabled }) {
  const { evaluation, depth, bestMove, pv } = useGame();

  let description = "Equal position";

  if (evaluation > 0.5) description = "White has the initiative";
  if (evaluation > 1) description = "White is winning";
  if (evaluation < -0.3) description = "Black has the initiative";
  if (evaluation < -1) description = "Black is winning";

  const displayEval = `${(evaluation ?? 0) >= 0 ? "+" : ""}${(
    evaluation ?? 0
  ).toFixed(2)}`;

  return (
    <section aria-label="Evaluation" className="rounded-xl bg-slate-ash/45 px-4 py-3.5">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-faded">
          Evaluation
        </h2>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
            engineEnabled ? "text-sage" : "text-faded"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              engineEnabled ? "bg-sage animate-pulse" : "bg-stone"
            }`}
          />
          {engineEnabled ? "Stockfish" : "Engine off"}
        </span>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <span
          key={displayEval}
          className="animate-eval text-[2rem] font-semibold leading-none tracking-tight text-bronze tabular-nums"
        >
          {displayEval}
        </span>
        <span className="pb-0.5 text-right text-xs leading-snug text-parchment">
          {description}
        </span>
      </div>

      <dl className="mt-4 flex items-center gap-x-6 gap-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          <dt className="text-faded">Depth</dt>
          <dd className="font-medium text-ivory/90 tabular-nums">
            {depth ?? "—"}
          </dd>
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <dt className="shrink-0 text-faded">Best</dt>
          <dd>
            <span className="inline-flex max-w-full items-center rounded-md bg-bronze/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-gold ring-1 ring-bronze/25">
              <span className="truncate">{bestMove ?? "—"}</span>
            </span>
          </dd>
        </div>
      </dl>

      {pv && (
        <p
          title={pv}
          className="scrollbar-thin mt-3 overflow-x-hidden whitespace-nowrap border-t border-stone/20 pt-3 font-mono text-[11px] leading-relaxed text-parchment/90"
        >
          {pv}
        </p>
      )}
    </section>
  );
}
