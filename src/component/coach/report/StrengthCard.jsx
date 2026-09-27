import {
  formatConfidence,
  getCoachingTopic,
  getStrengthInsight,
  getStrengthWhy,
  getStrengthEvidenceSummary,
} from "./reportData";

function StrengthIcon() {
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
      <path d="m12 3 2.3 5 5.5.7-4 3.8 1 5.5-4.8-2.7-4.8 2.7 1-5.5-4-3.8 5.5-.7L12 3Z" />
      <path d="M7 21h10" />
    </svg>
  );
}

export default function StrengthCard({ item, delay = 0 }) {
  return (
    <article
      className="group h-full rounded-2xl bg-gradient-to-br from-sage/[0.11] via-charcoal/85 to-charcoal/75 p-5 ring-1 ring-sage/25 shadow-[0_16px_36px_-28px_rgba(0,0,0,0.8)] transition-[transform,ring-color,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:ring-sage/45 hover:shadow-[0_22px_42px_-28px_rgba(0,0,0,0.9)] motion-safe:animate-settle sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sage/15 text-sage-light ring-1 ring-sage/30">
          <StrengthIcon />
        </span>
        <span className="rounded-full bg-obsidian/55 px-3 py-1.5 text-xs font-medium tabular-nums text-sage-light ring-1 ring-sage/25">
          Confidence {formatConfidence(item?.confidence)}
        </span>
      </div>
      <h4 className="mt-5 text-xl font-semibold leading-snug tracking-tight text-ivory">
        {getCoachingTopic(item)}
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-sage-light">
        {getStrengthInsight(item)}
      </p>
      <div className="mt-5 border-t border-sage/20 pt-4">
        <p className="text-xs font-semibold text-ivory/90">Why this matters</p>
        <p className="mt-1.5 text-sm leading-relaxed text-parchment">
          {getStrengthWhy(item)}
        </p>
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-faded">
        <span className="font-semibold uppercase tracking-[0.1em] text-parchment">Evidence</span>
        <span className="mx-1.5 text-stone">·</span>
        {getStrengthEvidenceSummary(item)}
      </p>
    </article>
  );
}
