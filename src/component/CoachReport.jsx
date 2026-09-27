import { useGame } from "../context/GameContext";

export default function CoachReport({ hasSavedAnalysis, onOpenAnalysis }) {
  const { games } = useGame();

  return (
    <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-sage/[0.08] to-charcoal px-4 py-5 text-center ring-1 ring-sage/25">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-56 -translate-x-1/2 rounded-full bg-sage/15 blur-3xl"
      />
      <div className="relative mx-auto grid h-10 w-10 place-items-center rounded-xl bg-sage/15 ring-1 ring-sage/30">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 text-sage"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 17.5l5.2-5.2 3.4 3.4 6.9-6.9" />
          <path d="M14.5 8.5H19V13" />
        </svg>
      </div>

      <h3 className="relative mt-3 text-base font-semibold tracking-tight text-ivory">
        AI Coach
      </h3>
      <p className="relative mx-auto mt-1.5 max-w-[30ch] text-xs leading-relaxed text-parchment">
        Pattern-level coaching across your games, in a dedicated analysis workspace.
      </p>

      <button
        type="button"
        onClick={onOpenAnalysis}
        className="relative mt-4 w-full rounded-xl bg-bronze px-4 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-bronze/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-xl hover:shadow-bronze/25 active:translate-y-0"
      >
        {hasSavedAnalysis ? "Resume AI Analysis" : "Generate AI Report"}
      </button>

      {hasSavedAnalysis ? (
        <p className="relative mt-3 text-[11px] leading-relaxed text-sage-light">
          Your saved report or live analysis is ready to reopen.
        </p>
      ) : games.length > 0 ? (
        <p className="relative mt-3 text-[11px] leading-relaxed text-faded">
          Ready to analyze {games.length} imported {games.length === 1 ? "game" : "games"}.
        </p>
      ) : null}
    </section>
  );
}
