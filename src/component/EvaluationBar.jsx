import { useGame } from "../context/GameContext";
export default function EvaluationBar({ engineEnabled }) {
  const { evaluation } = useGame();

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
    <div className="bg-zinc-700 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-3">
        Evaluation
      </h2>

      <div className="flex flex-col items-center gap-2">

        <span className={`text-2xl font-semibold ${
  evaluation >= 0 ? "text-green-400" : "text-red-400"
}`}>
          {`${(evaluation ?? 0) >= 0 ? "+" : ""}${(evaluation ?? 0).toFixed(2)}`}
        </span>

        <p className="text-center text-sm text-zinc-400 mt-3">
          {description}
        </p>

        <p className="text-zinc-400 text-sm">
          {engineEnabled ? "Stockfish Connected" : "Engine Off"}
        </p>

      </div>
    </div>
  );
}