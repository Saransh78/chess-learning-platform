import { useState } from "react";
import RecommendationList from "../coach/RecommendationList";
import StrengthMeter from "../coach/StrengthMeter";
import StyleBadges from "../coach/StyleBadges";
import RadarCard from "../coach/report/RadarCard";
import StrengthCard from "../coach/report/StrengthCard";
import SummaryHero from "../coach/report/SummaryHero";
import TrainingTimeline from "../coach/report/TrainingTimeline";
import WeaknessCard from "../coach/report/WeaknessCard";
import {
  getCoachStrengths,
  getCoachWeaknesses,
  getCoachingTopic,
  getPatternTopic,
  isFiniteNumber,
} from "../coach/report/reportData";
import EvidenceDrawer from "./EvidenceDrawer";
import ReportSectionNav from "../coach/report/ReportSectionNav";
import {
  ExplainabilitySection,
  PatternSection,
} from "../analysis/AnalysisEvidenceSections";

const CARD_STAGGER_MS = 45;

function formatValue(value) {
  if (value === null || value === undefined) return "—";
  if (isFiniteNumber(value)) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 3,
    }).format(value);
  }
  return String(value);
}

function StatGrid({ entries }) {
  const available = entries.filter(([, value]) => value !== null && value !== undefined);
  if (available.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
      {available.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs leading-relaxed text-parchment">{label}</dt>
          <dd className="mt-1 break-words text-sm font-semibold tabular-nums text-ivory">
            {formatValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TechnicalGroup({ title, entries }) {
  if (!entries?.length) return null;
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-gold">
        {title}
      </h3>
      <StatGrid entries={entries} />
    </section>
  );
}

function TechnicalAppendix({ report, analysisDepth, duration }) {
  const metadata = [
    ["PGN file", report.upload_summary?.filename],
    ["File size (bytes)", report.upload_summary?.file_size_bytes],
    ["Games", report.upload_summary?.games_detected],
    ["Positions", report.player_statistics?.Positions],
    ["Engine depth", analysisDepth],
    ["Analysis duration", duration],
    ["Predictions", report.predictions?.length],
    ["Positions explained", report.explanations?.length],
    ["Model version", report.predictions?.[0]?.model_version],
    ["Feature schema version", report.predictions?.[0]?.feature_schema_version],
    ["Example position prediction", report.explanations?.[0]?.prediction],
    ["Example prediction confidence", report.explanations?.[0]?.confidence],
    ["Executive-summary confidence", report.coach_report?.executive_summary?.confidence],
    ["Strength findings confidence", report.coach_report?.strengths?.confidence],
    ["Weakness findings confidence", report.coach_report?.weaknesses?.confidence],
    ["Training-plan confidence", report.coach_report?.training_plan?.confidence],
  ];
  const groups = [
    ["Player statistics", Object.entries(report.player_statistics || {})],
    ["Strength scores", Object.entries(report.strength_scores || {})],
    ["Playing-style scores", Object.entries(report.style || {})],
    ["Positional statistics", Object.entries(report.positional_statistics || {})],
    ["Opening measurements", Object.entries(report.opening_report || {})],
    ["Middlegame measurements", Object.entries(report.middlegame_report || {})],
    ["Endgame measurements", Object.entries(report.endgame_report || {})],
    ["Overall pattern measurements", Object.entries(report.patterns?.overall || {})],
    [
      "Coaching phase evidence",
      [
        ["Weakest phase", report.coach_report?.phase_analysis?.weakest_phase],
        ["Phase-analysis confidence", report.coach_report?.phase_analysis?.confidence],
        ...Object.entries(report.coach_report?.phase_analysis?.phases || {}).flatMap(
          ([phase, details]) => [
            [`${phase} sample positions`, details.evidence?.sample_size ?? details.evidence?.positions],
            [`${phase} average CPL`, details.evidence?.average_cpl],
            [`${phase} mistakes`, details.evidence?.mistake_count],
            [`${phase} blunders`, details.evidence?.blunder_count],
            [`${phase} blunder rate`, details.evidence?.blunder_rate],
          ]
        ),
      ],
    ],
    [
      "Weekly-plan evidence",
      (report.coach_report?.training_plan?.days || []).flatMap((day) => [
        [`${day.day} focus`, day.focus],
        [`${day.day} confidence`, day.confidence],
        [`${day.day} plan status`, day.status],
      ]),
    ],
  ];
  const strengths = getCoachStrengths(report);
  const weaknesses = getCoachWeaknesses(report);
  const patterns = Array.isArray(report.patterns?.patterns) ? report.patterns.patterns : [];
  const explanation = report.explanations?.[0];
  const exactShap = [
    ...(explanation?.top_positive_features || []),
    ...(explanation?.top_negative_features || []),
  ];

  return (
    <details
      id="technical-details"
      className="scroll-mt-4 rounded-2xl bg-charcoal/45 ring-1 ring-stone/40"
    >
      <summary className="group flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-semibold text-parchment transition-colors hover:text-ivory focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
        <span>Technical Details</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="h-4 w-4 text-bronze transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </summary>
      <div className="space-y-6 border-t border-stone/30 p-5 sm:p-6">
        <TechnicalGroup title="Analysis metadata" entries={metadata} />
        {groups.map(([title, entries]) => (
          <TechnicalGroup key={title} title={title} entries={entries} />
        ))}

        {strengths.length > 0 && (
          <div className="grid gap-5 xl:grid-cols-2">
            {strengths.map((item, index) => (
              <TechnicalGroup
                key={`strength-${item.rank || index}`}
                title={`Strength evidence · ${getCoachingTopic(item)}`}
                entries={[
                  ["Confidence", item.confidence],
                  ["Observed average CPL", item.supporting_metric?.value],
                  ["Comparison average CPL", item.supporting_metric?.comparison_value],
                  ["CPL difference", item.supporting_metric?.lower_by],
                  ["Sample positions", item.supporting_metric?.sample_size],
                ]}
              />
            ))}
          </div>
        )}

        {weaknesses.length > 0 && (
          <div className="grid gap-5 xl:grid-cols-2">
            {weaknesses.map((item, index) => (
              <TechnicalGroup
                key={`weakness-${item.rank || index}`}
                title={`Weakness evidence · ${getCoachingTopic(item)}`}
                entries={[
                  ["Confidence", item.confidence],
                  ["Severity score", item.severity_score],
                  ["Observed average CPL", item.supporting_metric?.value],
                  ["Comparison average CPL", item.supporting_metric?.comparison_value],
                  ["CPL difference", item.supporting_metric?.difference],
                  ["Sample positions", item.supporting_metric?.sample_size],
                ]}
              />
            ))}
          </div>
        )}

        {patterns.length > 0 && (
          <div className="grid gap-5 xl:grid-cols-2">
            {patterns.map((item, index) => (
              <TechnicalGroup
                key={`pattern-${item.pattern || index}`}
                title={`Pattern details · ${getPatternTopic(item)}`}
                entries={[
                  ["Confidence", item.confidence],
                  ["Severity score", item.severity_score],
                  ...Object.entries(item.metrics || {}),
                ]}
              />
            ))}
          </div>
        )}

        <RecommendationsDisclosure items={report.recommendations} />

        {exactShap.length > 0 && (
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-gold">
              Exact SHAP contributions · example position
            </h3>
            <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {exactShap.map((item) => (
                <li
                  key={`${item.feature}-${item.impact}`}
                  className="flex min-w-0 justify-between gap-3 text-xs text-parchment"
                >
                  <span className="min-w-0 break-words">{item.feature}</span>
                  <span className="shrink-0 font-medium tabular-nums text-ivory">
                    {isFiniteNumber(item.impact) ? item.impact.toFixed(6) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </details>
  );
}

function RecommendationsDisclosure({ items }) {
  if (!items?.length) return null;

  return (
    <details className="group rounded-2xl bg-charcoal/45 ring-1 ring-stone/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-sm font-semibold text-parchment transition-colors hover:text-ivory focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
        <span>Additional recorded recommendations</span>
        <span className="text-xs font-normal text-faded">{items.length} suggestions</span>
      </summary>
      <div className="border-t border-stone/30 p-4 sm:p-5">
        <RecommendationList items={items} />
      </div>
    </details>
  );
}

function EmptyState({ children }) {
  return (
    <p className="rounded-2xl bg-charcoal/50 p-5 text-sm leading-relaxed text-parchment ring-1 ring-stone/40">
      {children}
    </p>
  );
}

export default function FullCoachReport({
  report,
  analysisDepth,
  duration,
  scrollRootRef,
}) {
  const [evidenceIndex, setEvidenceIndex] = useState(null);
  if (!report) return null;

  const games = report.upload_summary?.games || [];
  const strengths = getCoachStrengths(report);
  const weaknesses = getCoachWeaknesses(report);

  return (
    <div className="mx-auto grid w-full max-w-[1380px] gap-5 lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-7">
      <ReportSectionNav scrollRootRef={scrollRootRef} />

      <div className="min-w-0 space-y-8 pb-8 sm:space-y-10">
        <SummaryHero report={report} />

        <section
          id="performance-overview"
          aria-labelledby="performance-overview-title"
          className="scroll-mt-4"
        >
          <div className="mb-4">
            <h2 id="performance-overview-title" className="text-xl font-semibold tracking-tight text-ivory">
              Performance Overview
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-parchment">
              Your phase scores and core chess skills, at a glance.
            </p>
          </div>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            <RadarCard report={report} />
            <StrengthMeter report={report} />
          </div>
          <div className="mt-4 max-w-2xl">
            <StyleBadges report={report} showScores={false} />
          </div>
        </section>

        <section id="strengths" aria-labelledby="strengths-title" className="scroll-mt-4">
          <div className="mb-4">
            <h2 id="strengths-title" className="text-xl font-semibold tracking-tight text-ivory">
              Strengths
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-parchment">
              The position types where your decisions held up best.
            </p>
          </div>
          {strengths.length === 0 ? (
            <EmptyState>No strengths were included in this report.</EmptyState>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {strengths.slice(0, 3).map((item, index) => (
                <StrengthCard
                  key={`${item.rank || index}-${item.title}`}
                  item={item}
                  index={index}
                  delay={index * CARD_STAGGER_MS}
                />
              ))}
            </div>
          )}
        </section>

        <section id="improvements" aria-labelledby="improvements-title" className="relative scroll-mt-4">
          <div className="mb-4">
            <h2 id="improvements-title" className="text-xl font-semibold tracking-tight text-ivory">
              Priority Improvements
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-parchment">
              Start with the first priority. Open another when you’re ready to go deeper.
            </p>
          </div>
          {weaknesses.length === 0 ? (
            <EmptyState>No coaching priorities were included in this report.</EmptyState>
          ) : (
            <div className="space-y-3">
              {weaknesses.map((item, index) => (
                <WeaknessCard
                  key={`${item.rank || index}-${item.title}`}
                  item={item}
                  index={index}
                  defaultOpen={index === 0}
                  delay={index * CARD_STAGGER_MS}
                  onViewExamples={() => setEvidenceIndex(index)}
                />
              ))}
            </div>
          )}

          {evidenceIndex !== null && weaknesses[evidenceIndex] && (
            <EvidenceDrawer
              weakness={getCoachingTopic(weaknesses[evidenceIndex])}
              games={games}
              onClose={() => setEvidenceIndex(null)}
            />
          )}
        </section>

        <PatternSection report={report} />
        <ExplainabilitySection report={report} />
        <TrainingTimeline report={report} />
        <TechnicalAppendix
          report={report}
          analysisDepth={analysisDepth}
          duration={duration}
        />
      </div>
    </div>
  );
}
