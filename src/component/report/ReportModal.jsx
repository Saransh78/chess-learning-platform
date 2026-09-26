import { useCallback, useEffect, useRef } from "react";
import useReportJob from "../../hooks/useReportJob";
import FullCoachReport from "./FullCoachReport";
import AnalysisProgress from "./AnalysisProgress";

function focusables(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null);
}

export default function ReportModal({ jobId, onClose }) {
  const {
    jobState,
    lastActiveStage,
    report,
    error,
    connectionState,
    cancelling,
    cancelError,
    cancel,
    completed,
  } = useReportJob(jobId);
  const panelRef = useRef(null);
  const scrollRef = useRef(null);

  const closeModal = useCallback(() => {
    onClose?.(error ? "failed" : jobState?.status);
  }, [error, jobState?.status, onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (completed) scrollRef.current?.scrollTo({ top: 0 });
  }, [completed]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const items = focusables(panelRef.current);

      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  if (!jobId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div
        aria-hidden="true"
        onClick={closeModal}
        className="absolute inset-0 bg-obsidian/70 backdrop-blur-md"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={completed ? "AI Coach report" : "Live game analysis"}
        tabIndex={-1}
        className="relative flex h-[90vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-2xl border border-stone/50 bg-charcoal/95 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7)] ring-1 ring-ivory/[0.04] animate-fade-in before:pointer-events-none before:absolute before:inset-x-10 before:top-0 before:z-10 before:h-px before:bg-gradient-to-r before:from-transparent before:via-gold/50 before:to-transparent"
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close report"
          title="Close analysis"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full text-parchment ring-1 ring-stone/50 transition-colors duration-200 hover:bg-stone/50 hover:text-ivory"
        >
          ✕
        </button>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {completed && report ? (
            <FullCoachReport report={report} onClose={closeModal} />
          ) : (
            <AnalysisProgress
              jobState={jobState}
              lastActiveStage={lastActiveStage}
              connectionState={connectionState}
              error={error}
              cancelError={cancelError}
              cancelling={cancelling}
              onCancel={cancel}
              onClose={closeModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}
