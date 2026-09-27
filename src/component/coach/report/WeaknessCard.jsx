import { useState } from "react";
import {
  formatConfidence,
  formatCount,
  formatScore,
  getTrainingActivity,
  getCoachingTopic,
  getWeaknessEvidenceSummary,
  getWeaknessInsight,
  getWeaknessTrainingFocus,
  isFiniteNumber,
} from "./reportData";

function ChessWarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 8.5a3.5 3.5 0 1 1 7 0c0 1.5-.8 2.3-1.6 3.2-.8.8-1.4 1.6-1.4 2.8h-1c0-1.2-.6-2-1.4-2.8C9.3 10.8 8.5 10 8.5 8.5Z" />
      <path d="M9 17h6m-5 2h4M12 5V3" />
      <path d="M12 8.5v2.2m0 1.6h.01" />
    </svg>
  );
}

function SeverityChip({ value }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-clay/[0.09] px-2.5 py-1.5 text-[11px] font-semibold tabular-nums text-clay ring-1 ring-clay/25">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-clay" />
      Severity {isFiniteNumber(value) ? formatScore(value) : "—"}
    </span>
  );
}

function Chevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-parchment transition-transform duration-200 group-open:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

export default function WeaknessCard({
  item,
  index,
  onViewExamples,
  defaultOpen = false,
  delay = 0,
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const hasFocus = typeof item?.recommended_training_focus === "string";
  const activities = Array.isArray(item?.training_activities)
    ? item.training_activities.filter((activity) => typeof activity === "string")
    : [];
  const sampleSize = item?.supporting_metric?.sample_size;

  return (
    <details
      open={expanded}
      onToggle={(event) => setExpanded(event.currentTarget.open)}
      className="group rounded-2xl bg-gradient-to-br from-clay/[0.08] via-charcoal/85 to-charcoal/75 ring-1 ring-clay/25 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.8)] transition-[ring-color,box-shadow] duration-200 open:ring-clay/40 hover:ring-clay/40 motion-safe:animate-settle"
      style={{ animationDelay: `${delay}ms` }}
    >
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 focus-visible:rounded-2xl sm:items-center sm:gap-4 sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-clay/10 text-clay ring-1 ring-clay/25 sm:mt-0">
          <ChessWarningIcon />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-clay">
              Priority {item?.rank ?? index + 1}
            </span>
            <span className="text-[11px] text-parchment">
              Confidence {formatConfidence(item?.confidence)}
            </span>
          </div>
          <h3 className="mt-1 text-base font-semibold leading-snug tracking-tight text-ivory sm:text-lg">
            {getCoachingTopic(item)}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-center">
          <span className="hidden sm:inline-flex"><SeverityChip value={item?.severity_score} /></span>
          <Chevron />
        </div>
        <span className="sr-only">{expanded ? "Collapse details" : "Expand details"}</span>
      </summary>

      <div className="px-4 pb-5 sm:pl-[4.5rem] sm:pr-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 sm:hidden">
          <SeverityChip value={item?.severity_score} />
        </div>
        <section>
          <h4 className="text-xs font-semibold text-ivory/90">Why this matters</h4>
          <p className="mt-1.5 max-w-[68ch] text-sm leading-relaxed text-parchment">
            {getWeaknessInsight(item)}
          </p>
        </section>

        {hasFocus && (
          <section className="mt-4 rounded-xl bg-obsidian/40 p-4 ring-1 ring-stone/35">
            <h4 className="text-xs font-semibold text-gold">Training focus</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-ivory/90">
              {getWeaknessTrainingFocus(item)}
            </p>
            {activities.length > 0 && (
              <ul className="mt-3 space-y-2">
                {activities.map((activity, activityIndex) => (
                  <li
                    key={`${activityIndex}-${activity}`}
                    className="flex gap-2 text-xs leading-relaxed text-parchment"
                  >
                    <span aria-hidden="true" className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-bronze" />
                  <span>{getTrainingActivity(activity, item)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone/30 pt-3">
          <p className="min-w-0 text-xs leading-relaxed text-faded">
            <span className="font-semibold text-parchment">Evidence</span>
            <span className="mx-1.5 text-stone">·</span>
            {sampleSize != null
              ? `${formatCount(sampleSize)} positions`
              : getWeaknessEvidenceSummary(item)}
          </p>
          {onViewExamples && (
            <button
              type="button"
              onClick={onViewExamples}
              className="shrink-0 text-xs font-semibold text-gold transition-colors hover:text-bronze focus-visible:outline-offset-4"
            >
              Show examples
              <span aria-hidden="true" className="ml-1">→</span>
            </button>
          )}
        </div>
      </div>
    </details>
  );
}
