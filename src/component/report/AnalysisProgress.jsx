import ETAChip from "./ETAChip";
import PositionCounter from "./PositionCounter";
import ProgressTimeline from "./ProgressTimeline";

function ProgressBar({ value }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-obsidian/70 ring-1 ring-stone/40"
      role="progressbar"
      aria-label="Overall analysis progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-bronze to-gold transition-[width] duration-1000 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function AnalysisProgress({
  jobState,
  lastActiveStage,
  connectionState,
  error,
  cancelError,
  cancelling,
  onCancel,
  onClose,
}) {
  const status = jobState?.status;
  const completed = status === "completed";
  const cancelled = status === "cancelled";
  const failed = status === "failed" || Boolean(error);
  const progress = completed ? 100 : jobState?.progress ?? 0;

  let title = "Your analysis is underway";
  let subtitle = "Following each step from your games to your coaching report.";
  if (completed) {
    title = "Analysis complete";
    subtitle = "Your games have been analyzed. Your AI Coach report is ready.";
  } else if (cancelled) {
    title = "Analysis cancelled";
    subtitle = "The analysis stopped at your request. Completed stages are marked below.";
  } else if (failed) {
    title = "Analysis needs attention";
    subtitle = "The analysis could not finish. Your completed stages are shown below.";
  } else if (jobState?.cancel_requested || cancelling) {
    title = "Cancelling analysis";
    subtitle = "The engine will stop safely at the next checkpoint.";
  }

  return (
    <div className="mx-auto w-full max-w-2xl py-2 sm:py-4">
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-ivory sm:text-2xl">
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-parchment">
              {subtitle}
            </p>
          </div>
          <p className="shrink-0 text-2xl font-semibold tabular-nums tracking-tight text-gold">
            {Math.round(Math.max(0, Math.min(100, progress)))}
            <span className="ml-0.5 text-base text-parchment">%</span>
          </p>
        </div>

        <div className="mt-5">
          <ProgressBar value={progress} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ETAChip etaSeconds={jobState?.eta_seconds} status={status} />
          <PositionCounter
            current={jobState?.current_position}
            total={jobState?.total_positions}
          />
        </div>
      </header>

      {connectionState === "reconnecting" && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-bronze/[0.08] px-4 py-3 text-sm leading-relaxed text-gold ring-1 ring-bronze/25"
        >
          Connection interrupted. Retrying automatically; your job ID remains saved for recovery.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl bg-clay/[0.08] px-4 py-3 text-sm leading-relaxed text-clay ring-1 ring-clay/25"
        >
          {error}
        </p>
      )}

      {cancelError && (
        <p role="alert" className="mb-5 text-sm leading-relaxed text-clay">
          {cancelError}
        </p>
      )}

      <ProgressTimeline jobState={jobState} lastActiveStage={lastActiveStage} />

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-stone/40 pt-4">
        <p className="text-xs leading-relaxed text-faded">
          {jobState?.job_id ? "Job ID saved in this browser for recovery." : "Connecting to the analysis job…"}
        </p>
        <div className="flex flex-wrap gap-2">
          {!completed && !cancelled && !failed && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling || jobState?.cancel_requested}
              className="rounded-lg px-3 py-2 text-sm font-medium text-parchment ring-1 ring-stone/50 transition-colors hover:bg-stone/20 hover:text-ivory disabled:cursor-wait disabled:opacity-50"
            >
              {cancelling || jobState?.cancel_requested
                ? "Cancelling…"
                : "Cancel analysis"}
            </button>
          )}
          {(completed || cancelled || failed) && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-bronze px-4 py-2 text-sm font-semibold text-obsidian transition-colors hover:bg-gold"
            >
              Close
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
