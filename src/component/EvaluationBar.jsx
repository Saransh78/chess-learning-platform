import { useGame } from "../context/GameContext";
export default function EvaluationBar({ engineEnabled }) {
  const { evaluation, depth, bestMove, pv } = useGame();

  let description = "Equal Position";

  if (evaluation > 0.5)
    description = "White is Better";

  if (evaluation > 1)
    description = "White is Winning";

  if (evaluation < -0.3)
    description = "Black is Better";

  if (evaluation < -1)
    description = "Black is Winning";

  return (
    <div className="relative bg-slate-ash/80 border border-stone/40 rounded-xl p-4 shadow-lg shadow-black/20">
      <h2 className="text-lg font-semibold text-ivory mb-3">
        Evaluation
      </h2>

      <div className="flex flex-col items-center gap-2">

        <span className={`text-2xl font-semibold ${
  evaluation >= 0 ? "text-gold" : "text-ivory/50"
}`}>
          {`${(evaluation ?? 0) >= 0 ? "+" : ""}${(evaluation ?? 0).toFixed(2)}`}
        </span>

        <p className="text-center text-sm text-sage mt-3">
          {description}
        </p>

        <p className="text-ivory/50 text-sm">
          {engineEnabled ? "Stockfish Connected" : "Engine Off"}
        </p>

        <div className="w-full mt-3 pt-3 border-t border-stone/60 space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-ivory/60">Depth</span>
            <span className="text-ivory font-medium">
              {depth ?? "—"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-ivory/60">Best move</span>
            <span className="text-ivory font-medium">
              {bestMove ?? "—"}
            </span>
          </div>

          <div>
            <p className="text-ivory/60 text-sm mb-1">
              Principal variation
            </p>
            <p className="text-sage text-xs leading-relaxed break-words line-clamp-3">
              {pv || "—"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}