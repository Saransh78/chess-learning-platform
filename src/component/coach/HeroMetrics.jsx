import Section from "./Section";
import { formatMetric, topStyle } from "./reportUtils";

export default function HeroMetrics({ report, delay = 0 }) {
  const summary = report.upload_summary || {};
  const stats = report.player_statistics || {};
  const opening = report.opening_report || {};
  const signature = topStyle(report.style);

  const metrics = [
    {
      label: "Games analyzed",
      value: formatMetric(summary.games_detected ?? stats.Games),
    },
    {
      label: "Average CPL",
      value: formatMetric(stats.AverageCentipawnLoss),
    },
    {
      label: "Win rate",
      value: formatMetric(opening["Win Rate"], "%"),
    },
    {
      label: "Playing style",
      value: signature ? signature.name : "—",
      sub:
        signature !== null
          ? `${formatMetric(signature.score)} style fit`
          : undefined,
    },
  ];

  return (
    <Section title="Coach summary" delay={delay}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <dt className="truncate text-[11px] text-faded">{metric.label}</dt>
            <dd className="mt-0.5 truncate text-2xl font-semibold tracking-tight tabular-nums text-ivory">
              {metric.value}
            </dd>
            {metric.sub && (
              <dd className="mt-0.5 text-[11px] text-sage-light">{metric.sub}</dd>
            )}
          </div>
        ))}
      </dl>
    </Section>
  );
}
