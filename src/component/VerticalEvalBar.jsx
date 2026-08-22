import { useGame } from "../context/GameContext";

export default function VerticalEvalBar() {
  const { evaluation } = useGame();

  const value = evaluation ?? 0;
  const clamped = Math.max(-5, Math.min(5, value));

  const chances = 2 / (1 + Math.exp(-0.7 * clamped)) - 1;

  const whitePercent = Math.round(50 + chances * 50);

  return (
    <div className="relative w-8 h-auto self-stretch min-h-[320px] shrink-0 overflow-hidden rounded-xl border border-stone/60 bg-obsidian shadow-[inset_0_1px_0_rgba(244,239,231,0.04)]">
      <div
        className="absolute inset-x-0 bottom-0 bg-white transition-all duration-300"
        style={{ height: `${whitePercent}%` }}
      />

      <span
        className={`absolute inset-x-0 text-center text-[10px] font-bold ${
          whitePercent >= 50 ? "bottom-1 text-obsidian" : "top-1 text-ivory"
        }`}
      >
        {`${value >= 0 ? "+" : ""}${value.toFixed(1)}`}
      </span>
    </div>
  );
}
