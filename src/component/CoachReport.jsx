import { useState } from "react";
import { useGame } from "../context/GameContext";

const ACCENTS = {
  clay: { dot: "bg-clay", label: "text-clay" },
  bronze: { dot: "bg-bronze", label: "text-gold" },
  sage: { dot: "bg-sage", label: "text-sage" },
  ivory: { dot: "bg-parchment", label: "text-parchment" },
};

const PREVIEW_INSIGHTS = [
  {
    tag: "Recurring Weakness",
    accent: "clay",
    quote: "Losing space in Caro-Kann structures.",
  },
  {
    tag: "Tactical Patterns",
    accent: "bronze",
    quote: "12 missed forks across 38 games.",
  },
  {
    tag: "Opening Trends",
    accent: "sage",
    quote: "Your win rate climbs sharply in closed openings.",
  },
  {
    tag: "Recommended Study",
    accent: "ivory",
    quote: "Minor-piece coordination and isolated pawn structures.",
  },
];

export default function CoachReport() {
  const { games } = useGame();
  const [requested, setRequested] = useState(false);

  const gameCount = games.length;

  return (
    <div className="space-y-5 px-0.5 pb-2">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-slate-ash/70 to-charcoal px-5 py-6 text-center ring-1 ring-stone/40">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 h-32 w-56 -translate-x-1/2 rounded-full bg-bronze/15 blur-3xl"
        />

        <div className="relative mx-auto grid h-11 w-11 place-items-center rounded-xl bg-bronze/15 ring-1 ring-bronze/30">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-bronze" fill="currentColor">
            <path d="M12 2.5l1.9 6.1a1 1 0 0 0 .66.66l6.1 1.9-6.1 1.9a1 1 0 0 0-.66.66L12 19.77l-1.9-6.05a1 1 0 0 0-.66-.66l-6.1-1.9 6.1-1.9a1 1 0 0 0 .66-.66L12 2.5z" />
          </svg>
        </div>

        <h3 className="relative mt-4 text-base font-semibold tracking-tight text-ivory">
          Coach Report
        </h3>
        <p className="relative mx-auto mt-1.5 max-w-[26ch] text-xs leading-relaxed text-parchment">
          Generated after analyzing your games.
        </p>

        <button
          onClick={() => setRequested(true)}
          className="relative mt-5 w-full rounded-xl bg-bronze px-4 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-bronze/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-xl hover:shadow-bronze/25 active:translate-y-0"
        >
          Generate Report
        </button>

        {requested ? (
          <p className="relative mt-3 animate-fade-in text-[11px] leading-relaxed text-gold/90">
            The ML Coach is training on your patterns &mdash; full reports
            arrive with the KnightMind engine release.
          </p>
        ) : (
          gameCount > 0 && (
            <p className="relative mt-3 text-[11px] text-faded">
              Runs across all {gameCount} imported{" "}
              {gameCount === 1 ? "game" : "games"}.
            </p>
          )
        )}
      </section>

      <div>
        <h4 className="px-1 pb-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-faded">
          Sample insights
        </h4>

        <ul className="space-y-2.5">
          {PREVIEW_INSIGHTS.map((insight) => {
            const accent = ACCENTS[insight.accent];
            return (
              <li
                key={insight.tag}
                className="group rounded-xl bg-slate-ash/40 p-4 transition-colors duration-200 hover:bg-slate-ash/60"
              >
                <blockquote className="text-[13px] leading-relaxed text-ivory/90">
                  &ldquo;{insight.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-2.5 flex items-center gap-1.5">
                  <span className={`h-1 w-1 rounded-full ${accent.dot}`} />
                  <span className={`text-[11px] font-medium ${accent.label}`}>
                    {insight.tag}
                  </span>
                </figcaption>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
