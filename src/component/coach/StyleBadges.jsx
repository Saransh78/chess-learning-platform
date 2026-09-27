import Section from "./Section";
import { cleanStyleName, formatMetric } from "./reportUtils";

export default function StyleBadges({ report, delay = 0, showScores = true }) {
  const entries = Object.entries(report.style || {})
    .filter(([, value]) => typeof value === "number" && !Number.isNaN(value))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Section title="Playing style" delay={delay}>
      {entries.length === 0 ? (
        <p className="text-sm leading-relaxed text-faded">
          Style signals are not available yet.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {entries.map(([name, score], index) => (
            <li
              key={name}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-transform duration-200 hover:-translate-y-0.5 ${
                index === 0
                  ? "bg-bronze/15 text-gold ring-1 ring-bronze/40"
                  : "bg-sage/10 text-sage-light ring-1 ring-sage/30"
              }`}
            >
              {cleanStyleName(name)}
              {showScores && (
                <span className="ml-1.5 font-medium tabular-nums opacity-80">
                  {formatMetric(score)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
