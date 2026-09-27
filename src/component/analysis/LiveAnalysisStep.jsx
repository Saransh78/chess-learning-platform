import ETAChip from "../report/ETAChip";
import PositionCounter from "../report/PositionCounter";
import ProgressTimeline from "../report/ProgressTimeline";
import { PROGRESS_STAGES } from "../report/progressStages";

function formatCount(value) {
  return new Intl.NumberFormat().format(value);
}

function GameCounter({ current, total }) {
  const known = total > 0;

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-obsidian/60 px-4 py-3 ring-1 ring-stone/40 sm:justify-start sm:gap-4">
      <span className="text-xs font-medium text-parchment">Current game</span>
      <span className="text-sm font-semibold tabular-nums text-ivory">
        {known ? `${formatCount(current)} / ${formatCount(total)}` : "Preparing"}
      </span>
    </div>
  );
}

function ProgressBar({ value }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-obsidian/75 ring-1 ring-stone/40"
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

export default function LiveAnalysisStep({
  jobState,
  lastActiveStage,
  connectionState,
  cancelling,
  cancelError,
  onCancel,
}) {
  const stageId = jobState?.stage || lastActiveStage;
  const currentStage = PROGRESS_STAGES.find((stage) => stage.id === stageId);
  const progress = jobState?.progress ?? 0;
  const stageProgress = jobState?.stage_progress;
  const cancelRequested = Boolean(jobState?.cancel_requested);

  return (
    <section
      aria-labelledby="live-analysis-title"
      className="mx-auto w-full max-w-[1080px] py-1"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <div>
          <h2 id="live-analysis-title" className="text-xl font-semibold tracking-tight text-ivory sm:text-2xl">
            Analysis in progress
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-parchment">
            Follow each stage as the engine and coach examine your games.
          </p>
        </div>
        <p className="text-2xl font-semibold tabular-nums text-gold">
          {Math.round(Math.max(0, Math.min(100, Number(progress) || 0)))}
          <span className="ml-0.5 text-base text-parchment">%</span>
        </p>
      </div>

      {connectionState === "reconnecting" && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-bronze/[0.08] px-4 py-3 text-sm leading-relaxed text-gold ring-1 ring-bronze/25"
        >
          Connection interrupted. Reconnecting to your saved analysis…
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(270px,0.82fr)_minmax(0,1.5fr)] lg:gap-5">
        <aside className="rounded-2xl bg-obsidian/35 p-4 ring-1 ring-stone/35 sm:p-5">
          <ProgressTimeline
            jobState={jobState}
            lastActiveStage={lastActiveStage}
            showGameCounter={false}
          />
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl bg-gradient-to-br from-bronze/[0.1] via-charcoal to-charcoal p-5 ring-1 ring-bronze/30 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-bronze/15 text-gold ring-1 ring-bronze/30">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold motion-safe:animate-pulse" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-gold">
                  Current stage
                </p>
                <h3 className="mt-1 text-lg font-semibold leading-snug text-ivory sm:text-xl">
                  {currentStage?.label || (jobState ? "Preparing next stage" : "Connecting to analysis")}
                </h3>
                {currentStage?.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-parchment">
                    {currentStage.description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5">
              <ProgressBar value={progress} />
              <p className="mt-2 text-right text-xs tabular-nums text-faded">
                {stageProgress == null
                  ? "Overall progress"
                  : `${Math.round(stageProgress)}% of this stage`}
              </p>
            </div>
          </section>

          <section aria-label="Live analysis metrics" className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <ETAChip etaSeconds={jobState?.eta_seconds} status={jobState?.status} />
              <GameCounter
                current={jobState?.current_game ?? 0}
                total={jobState?.total_games ?? 0}
              />
            </div>
            <PositionCounter
              current={jobState?.current_position}
              total={jobState?.total_positions}
            />
          </section>

          {cancelError && (
            <p role="alert" className="rounded-lg px-1 text-sm leading-relaxed text-clay">
              {cancelError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone/35 pt-4">
            <p className="text-xs leading-relaxed text-faded">
              Your job is saved in this browser. You can minimize this workspace while analysis continues.
            </p>
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling || cancelRequested}
              className="rounded-xl border border-stone/55 px-4 py-2.5 text-sm font-semibold text-parchment transition-colors hover:border-clay/40 hover:bg-clay/[0.08] hover:text-ivory focus-visible:outline-offset-4 disabled:cursor-wait disabled:opacity-50"
            >
              {cancelling || cancelRequested ? "Cancelling…" : "Cancel analysis"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
