const STATUS_STYLES = {
  ready: {
    label: "Ready for PGN",
    dot: "bg-faded",
    text: "text-parchment",
    ring: "ring-stone/50",
  },
  uploading: {
    label: "Uploading PGN",
    dot: "bg-bronze motion-safe:animate-pulse",
    text: "text-gold",
    ring: "ring-bronze/30",
  },
  live: {
    label: "Live analysis",
    dot: "bg-sage motion-safe:animate-pulse",
    text: "text-sage-light",
    ring: "ring-sage/30",
  },
  cancelling: {
    label: "Cancelling",
    dot: "bg-clay motion-safe:animate-pulse",
    text: "text-clay",
    ring: "ring-clay/30",
  },
  complete: {
    label: "Report Ready",
    dot: "bg-sage",
    text: "text-sage-light",
    ring: "ring-sage/30",
  },
  error: {
    label: "Needs attention",
    dot: "bg-clay",
    text: "text-clay",
    ring: "ring-clay/30",
  },
};

function formatCount(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat().format(value)
    : "—";
}

function MinimizeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M4 10h12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

function MaximizeIcon({ maximized }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {maximized ? (
        <path d="M7 3.5v3A1.5 1.5 0 0 1 5.5 8h-3m15 0h-3A1.5 1.5 0 0 1 13 6.5v-3m-10 13h3A1.5 1.5 0 0 0 7 15.5v-3m10 0h-3a1.5 1.5 0 0 0-1.5 1.5v3" />
      ) : (
        <path d="M3.5 8V4.5A1 1 0 0 1 4.5 3.5H8m8 0h3.5v3.5M20 12v3.5a1 1 0 0 1-1 1H15m-7 0H4.5a1 1 0 0 1-1-1V12" />
      )}
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3v9m0 0 3.5-3.5M10 12 6.5 8.5" />
      <path d="M4 12.5v3A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-3" />
    </svg>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] font-medium uppercase tracking-[0.1em] text-faded">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-xs font-semibold tabular-nums text-parchment sm:text-sm">
        {value}
      </dd>
    </div>
  );
}

export default function AnalysisHeader({
  status = "ready",
  gamesAnalyzed,
  positionsAnalyzed,
  analysisDepth,
  duration,
  maximized = false,
  closeDisabled = false,
  onMinimize,
  onToggleMaximize,
  onClose,
}) {
  const presentation = STATUS_STYLES[status] || STATUS_STYLES.ready;

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-stone/45 bg-charcoal/95 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-bronze/25 to-antique/10 text-gold ring-1 ring-bronze/35">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.55"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 20h10M8.5 17h7l-1-4.5 3-4-2.5-4-3 3-3-3-2.5 4 3 4-1 4.5Z" />
              <path d="M9.5 17 8 20m6.5-3 1.5 3M12 7.5l1 2.5" />
            </svg>
          </span>
          <div className="min-w-0">
            <h1
              id="analysis-workspace-title"
              className="truncate text-base font-semibold tracking-tight text-ivory sm:text-lg"
            >
              BoardSense <span className="font-normal text-parchment">AI Coach</span>
            </h1>
            <p className="hidden text-xs text-faded sm:block">Analysis workspace</p>
          </div>
          <span
            role="status"
            aria-live="polite"
            className={`ml-1 inline-flex shrink-0 items-center gap-2 rounded-full bg-obsidian/60 px-2.5 py-1.5 text-[11px] font-medium ring-1 sm:ml-3 sm:px-3 ${presentation.text} ${presentation.ring}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${presentation.dot}`} />
            <span className="hidden sm:inline">{presentation.label}</span>
            <span className="sm:hidden">
              {status === "complete" ? "Ready" : presentation.label.split(" ")[0]}
            </span>
          </span>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            disabled
            aria-label="Export report as PDF"
            title="PDF export is not available yet"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-stone/45 px-2.5 text-xs font-semibold text-faded disabled:cursor-not-allowed disabled:opacity-65 sm:px-3"
          >
            <ExportIcon />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            type="button"
            onClick={onToggleMaximize}
            aria-label={maximized ? "Restore analysis workspace size" : "Maximize analysis workspace"}
            title={maximized ? "Restore size" : "Maximize"}
            className="hidden h-9 w-9 place-items-center rounded-lg text-parchment transition-colors hover:bg-stone/25 hover:text-ivory sm:grid"
          >
            <MaximizeIcon maximized={maximized} />
          </button>
          <button
            type="button"
            onClick={onMinimize}
            aria-label="Minimize analysis workspace"
            title="Minimize"
            className="grid h-9 w-9 place-items-center rounded-lg text-parchment transition-colors hover:bg-stone/25 hover:text-ivory"
          >
            <MinimizeIcon />
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close analysis workspace"
            title={closeDisabled ? "Minimize or cancel while analysis is active" : "Close"}
            className="grid h-9 w-9 place-items-center rounded-lg text-parchment transition-colors hover:bg-stone/25 hover:text-ivory disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-stone/30 pt-3 sm:grid-cols-4 sm:gap-4">
        <HeaderMetric label="Games analyzed" value={formatCount(gamesAnalyzed)} />
        <HeaderMetric label="Positions analyzed" value={formatCount(positionsAnalyzed)} />
        <HeaderMetric label="Analysis depth" value={analysisDepth == null ? "—" : `Depth ${analysisDepth}`} />
        <HeaderMetric label="Duration" value={duration || "—"} />
      </dl>
    </header>
  );
}
