import { forwardRef } from "react";

const MinimizedWidget = forwardRef(function MinimizedWidget({
  status,
  progress = 0,
  currentStage,
  filename,
  onRestore,
}, ref) {
  const complete = status === "complete";
  const error = status === "error";
  const uploading = status === "uploading";
  const cancelling = status === "cancelling";
  const ready = status === "ready";
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <button
      ref={ref}
      type="button"
      onClick={onRestore}
      aria-label={
        complete
        ? "Restore completed AI Coach report"
        : error
          ? "Restore analysis error"
          : ready
            ? "Restore PGN upload workspace"
              : uploading
                ? "Restore PGN upload"
                : "Restore live AI analysis"
      }
      className="fixed bottom-4 right-4 z-[80] flex w-[min(23rem,calc(100vw-2rem))] items-center gap-3 rounded-2xl border border-bronze/35 bg-charcoal/95 p-3.5 text-left shadow-[0_20px_50px_-18px_rgba(0,0,0,0.8)] ring-1 ring-ivory/[0.04] backdrop-blur-xl transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-bronze/60 focus-visible:outline-offset-4 sm:bottom-6 sm:right-6"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bronze/12 text-gold ring-1 ring-bronze/30">
        {complete ? (
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4 10 4 4 8-8" />
          </svg>
        ) : (
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold motion-safe:animate-pulse" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ivory">
          {complete
            ? "AI Coach report ready"
            : error
              ? "Analysis needs attention"
            : uploading
              ? "Uploading PGN"
              : cancelling
                ? "Cancelling analysis"
                  : ready
                    ? "AI Coach workspace"
                    : "Analysis continues"}
        </span>
        <span className="mt-0.5 block truncate text-xs text-parchment">
          {complete
            ? "Click to view your report"
            : error
              ? "Click to review the status"
            : uploading
              ? filename || "Preparing your analysis job"
              : ready
                ? "Click to choose a PGN"
                : currentStage || "Preparing analysis"}
        </span>
        {!complete && !error && !uploading && !ready && (
          <span className="mt-2 block h-1 overflow-hidden rounded-full bg-obsidian ring-1 ring-stone/35">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-bronze to-gold transition-[width] duration-700"
              style={{ width: `${safeProgress}%` }}
            />
          </span>
        )}
      </span>
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-faded"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m7 4 6 6-6 6" />
      </svg>
    </button>
  );
});

export default MinimizedWidget;
