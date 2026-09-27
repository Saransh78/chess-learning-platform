import { getPatternInsight, getPatternTopic } from "../coach/report/reportData";

function percentage(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${(value * 100).toFixed(1)}%`
    : "—";
}

function featureTitle(feature) {
  const knownNames = {
    CurrentEvaluation: "Position evaluation",
    BestEvaluation: "Engine’s best continuation",
    PlayedEvaluation: "Played move result",
    MoveNumber: "Move timing",
    Mobility: "Available moves",
    GamePhase: "Game phase",
    MaterialDifference: "Material balance",
    WhiteIsolatedPawns: "White’s isolated pawns",
    BlackIsolatedPawns: "Black’s isolated pawns",
    WhitePawnIslands: "White’s pawn islands",
    BlackPawnIslands: "Black’s pawn islands",
  };
  if (knownNames[feature]) return knownNames[feature];
  return String(feature || "Position signal")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^White /, "White’s ")
    .replace(/^Black /, "Black’s ");
}

function featureSentence(feature, helps) {
  const direction = helps ? "supported" : "pushed against";
  const descriptions = {
    CurrentEvaluation: `The position evaluation ${direction} the model's read.`,
    BestEvaluation: `The engine's best continuation ${direction} the model's read.`,
    PlayedEvaluation: `The played continuation ${direction} the model's read.`,
    MoveNumber: `The timing of this position ${direction} the model's read.`,
    Mobility: `The available moves in this position ${direction} the model's read.`,
  };
  return descriptions[feature] || `This position signal ${direction} the model's read.`;
}

function FeatureColumn({ title, items, helps, maxImpact }) {
  return (
    <section className="min-w-0">
      <h3 className={`text-xs font-semibold uppercase tracking-[0.1em] ${helps ? "text-sage-light" : "text-clay"}`}>
        {title}
      </h3>
      {!items?.length ? (
        <p className="mt-3 rounded-xl bg-obsidian/40 p-4 text-sm text-parchment ring-1 ring-stone/30">
          No factors were supplied for this side of the example.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.slice(0, 5).map((item) => {
            const width = maxImpact > 0
              ? Math.max(4, Math.abs(item.impact || 0) / maxImpact * 100)
              : 0;
            return (
              <li
                key={`${item.feature}-${item.impact}`}
                className={`rounded-xl p-3.5 ring-1 ${
                  helps
                    ? "bg-sage/[0.06] ring-sage/20"
                    : "bg-clay/[0.06] ring-clay/20"
                }`}
              >
                <h4 className="text-sm font-semibold text-ivory">
                  {featureTitle(item.feature)}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-parchment">
                  {featureSentence(item.feature, helps)}
                </p>
                <div
                  aria-hidden="true"
                  className="mt-3 h-1 overflow-hidden rounded-full bg-obsidian/75"
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${
                      helps ? "bg-sage" : "bg-clay"
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function ExplainabilitySection({ report, id = "explainability" }) {
  const example = report?.explanations?.[0];
  const positive = example?.top_positive_features || [];
  const negative = example?.top_negative_features || [];
  const maxImpact = Math.max(
    0,
    ...positive.map((item) => Math.abs(item.impact || 0)),
    ...negative.map((item) => Math.abs(item.impact || 0))
  );

  return (
    <section
      id={id}
      aria-labelledby="analysis-explainability-title"
      className="rounded-2xl bg-charcoal/60 p-5 ring-1 ring-stone/45 sm:p-6"
    >
      <h2 id="analysis-explainability-title" className="text-xl font-semibold tracking-tight text-ivory">
        Why the AI reached this conclusion
      </h2>
      <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-parchment">
        Here is an example of the position-level signals behind the model’s read.
      </p>

      {!example ? (
        <p className="mt-5 rounded-xl bg-obsidian/45 p-4 text-sm text-parchment ring-1 ring-stone/30">
          Position explanations are not available in this report.
        </p>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2 md:gap-6">
          <FeatureColumn
            title="Helped the prediction"
            items={positive}
            helps
            maxImpact={maxImpact}
          />
          <FeatureColumn
            title="Worked against the prediction"
            items={negative}
            helps={false}
            maxImpact={maxImpact}
          />
        </div>
      )}
      <a
        href="#technical-details"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold transition-colors hover:text-bronze focus-visible:outline-offset-4"
      >
        Exact values in Technical Details
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m7 4 6 6-6 6" />
        </svg>
      </a>
    </section>
  );
}

function PawnIcon() {
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
      <path d="M8.5 8.5a3.5 3.5 0 1 1 7 0c0 1.6-.8 2.4-1.7 3.3-.7.8-1.3 1.5-1.3 2.7h-1c0-1.2-.6-1.9-1.3-2.7-.9-.9-1.7-1.7-1.7-3.3Z" />
      <path d="M9 17h6m-5 2h4M7 22h10" />
    </svg>
  );
}

export function PatternSection({ report, id = "patterns" }) {
  const mined = Array.isArray(report?.patterns?.patterns)
    ? [...report.patterns.patterns].sort(
        (left, right) => (right.severity_score || 0) - (left.severity_score || 0)
      )
    : [];

  return (
    <section
      id={id}
      aria-labelledby="analysis-patterns-title"
      className="rounded-2xl bg-charcoal/60 p-5 ring-1 ring-stone/45 sm:p-6"
    >
      <h2 id="analysis-patterns-title" className="text-xl font-semibold tracking-tight text-ivory">
        Recurring habits
      </h2>
      <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-parchment">
        The patterns that showed up most clearly across your games.
      </p>

      {mined.length > 0 ? (
        <ol className="mt-4 divide-y divide-stone/30">
          {mined.map((item, index) => (
            <li
              key={`${item.pattern}-${index}`}
              className="flex flex-wrap items-start gap-3 py-4 motion-safe:animate-settle"
              style={{ animationDelay: `${Math.min(index * 35, 140)}ms` }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bronze/10 text-gold ring-1 ring-bronze/25">
                <PawnIcon />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-snug text-ivory">
                  {getPatternTopic(item)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-parchment">
                  {getPatternInsight(item)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-0.5">
                <span className="rounded-full bg-clay/[0.09] px-2.5 py-1 text-[11px] font-medium text-clay ring-1 ring-clay/20">
                  {index === 0 ? "Highest impact" : "Recurring"}
                </span>
                <span className="rounded-full bg-sage/[0.08] px-2.5 py-1 text-[11px] font-medium tabular-nums text-sage-light ring-1 ring-sage/20">
                  {percentage(item.confidence)} confidence
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-5 text-sm leading-relaxed text-parchment">
          No recurring habits were included in this report.
        </p>
      )}
    </section>
  );
}
