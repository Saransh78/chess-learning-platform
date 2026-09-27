import { formatScore, isFiniteNumber } from "./reportData";

const RADAR_METRICS = [
  {
    label: "Opening",
    getValue: (report) => report?.opening_report?.["Opening Score"],
  },
  {
    label: "Middlegame",
    getValue: (report) => report?.middlegame_report?.["Middlegame Score"],
  },
  {
    label: "Endgame",
    getValue: (report) => report?.endgame_report?.["Endgame Score"],
  },
  {
    label: "Tactical accuracy",
    getValue: (report) =>
      report?.strength_scores?.["Tactical Accuracy"] ??
      report?.strength_scores?.["Tactical Strength"],
  },
  {
    label: "Positional play",
    getValue: (report) =>
      report?.strength_scores?.["Positional Play"] ??
      report?.strength_scores?.["Positional Strength"],
  },
  {
    label: "Decision quality",
    getValue: (report) =>
      report?.strength_scores?.["Decision Quality"] ??
      report?.positional_statistics?.["Best Move Percentage"] ??
      report?.player_statistics?.BestMovePercentage,
  },
];

function pointAt(index, value, count) {
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  const radius = 104 * (Math.max(0, Math.min(100, value)) / 100);
  return [160 + Math.cos(angle) * radius, 126 + Math.sin(angle) * radius];
}

function polygonPoints(indexes, count, scale = 1) {
  return indexes
    .map((index) => {
      const [x, y] = pointAt(index, 100 * scale, count);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function RadarPlot({ metrics }) {
  const count = metrics.length;
  const positions = metrics.map((metric, index) =>
    pointAt(index, metric.value, count)
  );
  const valuePoints = positions.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg
      viewBox="0 0 320 252"
      role="img"
      aria-label={`Performance radar: ${metrics.map((metric) => `${metric.label} ${formatScore(metric.value)}`).join(", ")}`}
      className="mx-auto block w-full max-w-[360px] overflow-visible"
    >
      <defs>
        <linearGradient id="report-radar-fill" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#D8A867" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#B78643" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={polygonPoints(metrics.map((_, index) => index), count, scale)}
          fill="none"
          stroke="rgba(183,175,162,0.24)"
          strokeWidth="1"
        />
      ))}
      {positions.map(([x, y], index) => (
        <line
          key={metrics[index].label}
          x1="160"
          y1="126"
          x2={160 + ((x - 160) * 100) / 104}
          y2={126 + ((y - 126) * 100) / 104}
          stroke="rgba(183,175,162,0.22)"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={valuePoints}
        fill="url(#report-radar-fill)"
        stroke="#D8A867"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray="700"
        className="motion-safe:animate-radar-reveal"
      />
      {positions.map(([x, y], index) => (
        <circle
          key={metrics[index].label}
          cx={x}
          cy={y}
          r="3.5"
          fill="#F4EFE7"
          stroke="#C89B5A"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export default function RadarCard({ report }) {
  const metrics = RADAR_METRICS.map((metric) => ({
    label: metric.label,
    value: metric.getValue(report),
  })).filter((metric) => isFiniteNumber(metric.value));
  return (
    <section className="rounded-2xl bg-charcoal/70 p-5 shadow-[0_18px_42px_-28px_rgba(0,0,0,0.85)] ring-1 ring-stone/50 backdrop-blur-md sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ivory">Performance profile</h3>
          <p className="mt-1 text-xs leading-relaxed text-parchment">
            Reported scores on their 0–100 scale.
          </p>
        </div>
        <span className="rounded-full bg-bronze/10 px-3 py-1 text-xs font-medium text-gold ring-1 ring-bronze/25">
          {metrics.length} {metrics.length === 1 ? "measure" : "measures"}
        </span>
      </div>

      {metrics.length >= 3 ? (
        <div className="mt-4 grid items-center gap-4 md:grid-cols-[minmax(200px,1fr)_minmax(150px,0.8fr)]">
          <RadarPlot metrics={metrics} />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-1">
            {metrics.map((metric) => (
              <li key={metric.label} className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-bronze shadow-[0_2px_8px_-2px_rgba(200,155,90,0.6)]"
                />
                <span className="min-w-0 flex-1 truncate text-xs text-parchment">
                  {metric.label}
                </span>
                <span className="text-sm font-semibold tabular-nums text-ivory">
                  {formatScore(metric.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-obsidian/45 p-4 text-sm leading-relaxed text-parchment ring-1 ring-stone/30">
          A radar profile needs at least three reported 0–100 scores. Available
          values are listed below.
        </p>
      )}

    </section>
  );
}
