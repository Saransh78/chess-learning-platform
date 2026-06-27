export default function EvaluationBar() {
  return (
    <div className="bg-zinc-700 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-3">
        Evaluation
      </h2>
<div className="flex flex-col items-center gap-2">
  <span className="text-2xl font-semibold text-green-400">
    +0.0
  </span>
<p className="text-center text-sm text-zinc-400 mt-3">
  Equal Position
</p>
  <p className="text-zinc-400 text-sm">
    Stockfish not connected
  </p>
</div>
    </div>
  );
}