import { useEffect, useState } from "react";
import Section from "./Section";
import { formatMetric } from "./reportUtils";

const PHASES = [
  { label: "Opening", key: "Opening Score", source: "opening_report" },
  { label: "Middlegame", key: "Middlegame Score", source: "middlegame_report" },
  { label: "Endgame", key: "Endgame Score", source: "endgame_report" },
];

function PhaseBar({ label, value, animate }) {
  const numeric =
    typeof value === "number" && !Number.isNaN(value)
      ? Math.max(0, Math.min(100, value))
      : null;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-parchment">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-gold">
          {numeric === null ? "—" : `${formatMetric(value)}%`}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-obsidian/70 ring-1 ring-stone/40"
        role="progressbar"
        aria-label={`${label} score`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={numeric === null ? undefined : Math.round(numeric)}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-bronze to-gold transition-[width] duration-700 ease-out"
          data-value={numeric === null ? 0 : numeric}
          style={{ width: `${animate && numeric !== null ? numeric : 0}%` }}
        />
      </div>
    </div>
  );
}

export default function StrengthMeter({ report, delay = 0 }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const phases = PHASES.map((phase) => ({
    ...phase,
    value: report[phase.source]?.[phase.key],
  })).filter(
    (phase) => typeof phase.value === "number" && !Number.isNaN(phase.value)
  );

  return (
    <Section title="Strength meter" delay={delay}>
      {phases.length === 0 ? (
        <p className="text-[13px] leading-relaxed text-faded">
          Phase scores are not available yet.
        </p>
      ) : (
        <div className="space-y-3.5">
          {phases.map((phase) => (
            <PhaseBar
              key={phase.label}
              label={phase.label}
              value={phase.value}
              animate={animate}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
