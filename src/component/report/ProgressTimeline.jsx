import { PROGRESS_STAGES, getProgressStageId } from "./progressStages";

function StageMark({ state }) {
  if (state === "completed") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 10 4 4 8-8" />
      </svg>
    );
  }

  if (state === "interrupted") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M6 6v8m8-8v8" />
      </svg>
    );
  }

  return <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />;
}

export default function ProgressTimeline({ jobState, lastActiveStage }) {
  const stageId = getProgressStageId(jobState, lastActiveStage);
  const currentIndex = Math.max(
    PROGRESS_STAGES.findIndex((stage) => stage.id === stageId),
    0
  );
  const status = jobState?.status;
  const stopped = status === "cancelled" || status === "failed";

  return (
    <section aria-labelledby="progress-timeline-title">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h3
          id="progress-timeline-title"
          className="text-sm font-semibold text-ivory"
        >
          Analysis stages
        </h3>
        {jobState?.current_game > 0 && jobState?.total_games > 0 && (
          <p className="text-xs tabular-nums text-parchment">
            Game {jobState.current_game.toLocaleString()} of {jobState.total_games.toLocaleString()}
          </p>
        )}
      </div>

      <ol className="relative space-y-1 before:absolute before:bottom-5 before:left-[13px] before:top-5 before:w-px before:bg-stone/50">
        {PROGRESS_STAGES.map((stage, index) => {
          const complete = status === "completed" || index < currentIndex;
          const active = !stopped && status !== "completed" && index === currentIndex;
          const interrupted = stopped && index === currentIndex;
          const markState = complete
            ? "completed"
            : interrupted
              ? "interrupted"
              : "pending";

          return (
            <li
              key={stage.id}
              aria-current={active ? "step" : undefined}
              className={`relative flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-300 ${
                active ? "bg-bronze/[0.08]" : ""
              }`}
            >
              <span
                className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 transition-colors duration-300 ${
                  complete
                    ? "bg-sage/15 text-sage-light ring-sage/40"
                    : active
                      ? "bg-bronze/15 text-gold ring-bronze/60 motion-safe:animate-pulse"
                      : interrupted
                        ? "bg-clay/10 text-clay ring-clay/40"
                        : "bg-charcoal text-faded ring-stone/60"
                }`}
              >
                <StageMark state={markState} />
              </span>
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <p
                  className={`text-sm font-medium ${
                    complete
                      ? "text-ivory"
                      : active
                        ? "text-gold"
                        : interrupted
                          ? "text-parchment"
                          : "text-faded"
                  }`}
                >
                  {stage.label}
                  {active && (
                    <span className="ml-2 text-[11px] font-normal text-parchment">
                      In progress
                    </span>
                  )}
                  {interrupted && (
                    <span className="ml-2 text-[11px] font-normal text-parchment">
                      {status === "cancelled" ? "Stopped here" : "Interrupted here"}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-faded sm:mt-0">
                  {stage.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
