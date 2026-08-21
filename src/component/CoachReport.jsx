import { useState } from "react";
import { useGame } from "../context/GameContext";

const ACCENTS = {
  clay: { dot: "bg-clay", label: "text-clay" },
  bronze: { dot: "bg-bronze", label: "text-gold" },
  sage: { dot: "bg-sage", label: "text-sage" },
};

const PREVIEW_INSIGHTS = [
  {
    tag: "Recurring Weakness",
    accent: "clay",
    quote: "Losing space in Caro-Kann structures.",
  },
  {
    tag: "Tactical Pattern",
    accent: "bronze",
    quote: "Missed forks across multiple games.",
  },
  {
    tag: "Opening Trend",
    accent: "sage",
    quote:
      "Strong early development but weak central control after the opening.",
  },
  {
    tag: "Study Recommendation",
    accent: "sage",
    quote:
      "Focus on isolated pawn structures and minor-piece coordination this week.",
  },
];

export default function CoachReport() {
  const { games } = useGame();
  const [requested, setRequested] = useState(false);

  const gameCount = games.length;

  return (
    <div className="space-y-5 px-0.5 pb-2">
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-b from-sage/[0.08] to-charcoal px-5 py-6 text-center ring-1 ring-sage/25">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 h-32 w-56 -translate-x-1/2 rounded-full bg-sage/15 blur-3xl"
        />

        <div className="relative mx-auto grid h-11 w-11 place-items-center rounded-xl bg-sage/15 ring-1 ring-sage/30">
          <svg
            viewBox="0 0 24 24"
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

        <h3 className="relative mt-4 text-base font-semibold tracking-tight text-ivory">
          AI Coach
        </h3>
        <p className="relative mx-auto mt-1.5 max-w-[28ch] text-xs leading-relaxed text-parchment">
          Your personalized improvement report.
        </p>

        <button
          onClick={() => setRequested(true)}
          className="relative mt-5 w-full rounded-xl bg-bronze px-4 py-2.5 text-sm font-semibold text-obsidian shadow-lg shadow-bronze/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gold hover:shadow-xl hover:shadow-bronze/25 active:translate-y-0"
        >
          Generate AI Report
        </button>

        {requested ? (
          <p className="relative mt-3 animate-fade-in text-[11px] leading-relaxed text-sage">
            The AI Coach is studying your patterns &mdash; full reports arrive
            with the KnightMind engine release.
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
                className="group rounded-xl bg-slate-ash/40 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-ash/60"
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
