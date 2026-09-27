import { useCallback, useEffect, useRef, useState } from "react";
import useReport from "../../hooks/useReport";
import useReportJob from "../../hooks/useReportJob";
import {
  clearSavedReportJobId,
  getSavedReportStartedAt,
  saveReportStartedAt,
} from "../../services/reportJobStorage";
import { DEFAULT_REPORT_DEPTH } from "../../services/api";
import AnalysisHeader from "./AnalysisHeader";
import CompletedReportStep from "./CompletedReportStep";
import ErrorStep from "./ErrorStep";
import LiveAnalysisStep from "./LiveAnalysisStep";
import MinimizedWidget from "./MinimizedWidget";
import UploadStep from "./UploadStep";
import { PROGRESS_STAGES } from "../report/progressStages";

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => element.offsetParent !== null);
}

function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return "—";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export default function AnalysisWorkspace({
  open,
  minimized,
  initialJobId,
  onOpenChange,
  onMinimizedChange,
  onJobCreated,
  onJobCleared,
}) {
  const [jobId, setJobId] = useState(() => initialJobId || null);
  const [startedAt, setStartedAt] = useState(getSavedReportStartedAt);
  const [clockNow, setClockNow] = useState(null);
  const [maximized, setMaximized] = useState(false);
  const dialogRef = useRef(null);
  const minimizedWidgetRef = useRef(null);
  const contentRef = useRef(null);
  const {
    status: uploadStatus,
    error: uploadError,
    filename,
    isUploading,
    submitReport,
    reset: resetUpload,
  } = useReport();
  const analysis = useReportJob(jobId);

  const cancelled = analysis.jobState?.status === "cancelled";
  const failed =
    analysis.jobState?.status === "failed" ||
    analysis.connectionState === "failed" ||
    Boolean(analysis.error);
  const isError = uploadStatus === "error" || cancelled || failed;
  const completed = analysis.report !== null;
  const live = Boolean(jobId) && !isError && !completed;
  const active =
    live &&
    (analysis.jobState?.status === "queued" ||
      analysis.jobState?.status === "running" ||
      analysis.jobState?.status === "completed" ||
      !analysis.jobState);
  const visible = open && !minimized;
  const currentStage = PROGRESS_STAGES.find(
    (stage) => stage.id === analysis.jobState?.stage
  )?.label;
  const status = isError
    ? "error"
    : completed
      ? "complete"
      : analysis.jobState?.cancel_requested || analysis.cancelling
        ? "cancelling"
        : isUploading
          ? "uploading"
          : live
            ? "live"
            : "ready";
  const gamesAnalyzed = completed
    ? analysis.report?.upload_summary?.games_detected
    : analysis.jobState?.total_games;
  const positionsAnalyzed = completed
    ? analysis.report?.player_statistics?.Positions
    : analysis.jobState?.current_position;
  const duration =
    startedAt == null || clockNow == null
      ? "—"
      : formatDuration(clockNow - startedAt);
  const dialogSize = maximized
    ? "h-dvh w-full max-w-none rounded-none border-0"
    : "h-dvh w-full rounded-none border border-stone/45 sm:h-[90dvh] sm:w-[90vw] sm:rounded-2xl lg:h-[88dvh] lg:w-[min(1180px,calc(100vw-2rem))]";

  const clearJobState = useCallback(() => {
    clearSavedReportJobId();
    resetUpload();
    setJobId(null);
    setStartedAt(null);
    setClockNow(null);
    onJobCleared?.();
  }, [onJobCleared, resetUpload]);

  const closeWorkspace = useCallback(() => {
    if (active) return;

    if (isError && jobId) clearJobState();
    else if (!jobId && uploadStatus === "error") resetUpload();

    onOpenChange?.(false);
    onMinimizedChange?.(false);
    setMaximized(false);
  }, [
    active,
    clearJobState,
    isError,
    jobId,
    onMinimizedChange,
    onOpenChange,
    resetUpload,
    uploadStatus,
  ]);

  const startAnotherAnalysis = useCallback(() => {
    clearJobState();
    onOpenChange?.(true);
    onMinimizedChange?.(false);
  }, [clearJobState, onMinimizedChange, onOpenChange]);

  async function handleFileSelected(file) {
    clearJobState();
    const queuedJob = await submitReport(file);

    if (queuedJob?.job_id) {
      const startTime = Date.now();
      saveReportStartedAt(startTime);
      setStartedAt(startTime);
      setClockNow(startTime);
      setJobId(queuedJob.job_id);
      onJobCreated?.(queuedJob.job_id);
    }
  }

  function restoreWorkspace() {
    onOpenChange?.(true);
    onMinimizedChange?.(false);
  }

  useEffect(() => {
    if (!visible || !dialogRef.current) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [visible]);

  useEffect(() => {
    if (minimized) minimizedWidgetRef.current?.focus();
  }, [minimized]);

  useEffect(() => {
    if (startedAt == null || completed || isError) return undefined;

    const frame = requestAnimationFrame(() => setClockNow(Date.now()));
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
    };
  }, [startedAt, completed, isError]);

  useEffect(() => {
    if (!visible) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (active) {
          event.preventDefault();
          event.stopPropagation();
        } else {
          event.preventDefault();
          closeWorkspace();
        }
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const elements = getFocusableElements(dialogRef.current);
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
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
  }, [active, closeWorkspace, visible]);

  if (!open && !minimized) return null;

  return (
    <>
      {minimized && (
        <MinimizedWidget
          status={status}
        progress={analysis.jobState?.progress}
        currentStage={currentStage}
        filename={filename}
        ref={minimizedWidgetRef}
        onRestore={restoreWorkspace}
        />
      )}

      {open && (
        <div
          aria-hidden={minimized || undefined}
          inert={minimized || undefined}
          className={`fixed inset-0 z-[70] flex items-center justify-center bg-obsidian/55 p-0 backdrop-blur-[3px] motion-safe:animate-fade-in sm:p-4 lg:p-6 ${
            minimized ? "pointer-events-none invisible" : ""
          }`}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal={visible || undefined}
            aria-labelledby="analysis-workspace-title"
            tabIndex={-1}
            className={`relative flex flex-col overflow-hidden bg-charcoal shadow-[0_32px_90px_-30px_rgba(0,0,0,0.8)] outline-none motion-safe:animate-settle ${dialogSize}`}
          >
            <AnalysisHeader
              status={status}
              gamesAnalyzed={gamesAnalyzed}
              positionsAnalyzed={positionsAnalyzed}
              analysisDepth={DEFAULT_REPORT_DEPTH}
              duration={duration}
              maximized={maximized}
              closeDisabled={active}
              onMinimize={() => onMinimizedChange?.(true)}
              onToggleMaximize={() => setMaximized((current) => !current)}
              onClose={closeWorkspace}
            />

            <div
              ref={contentRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6"
            >
              {completed ? (
                <CompletedReportStep
                  report={analysis.report}
                  analysisDepth={DEFAULT_REPORT_DEPTH}
                  duration={duration}
                  scrollRootRef={contentRef}
                  onAnalyzeAnother={startAnotherAnalysis}
                />
              ) : isError ? (
                <ErrorStep
                  cancelled={cancelled}
                  message={analysis.error || uploadError}
                  onTryAgain={startAnotherAnalysis}
                />
              ) : live ? (
                <LiveAnalysisStep
                  jobState={analysis.jobState}
                  lastActiveStage={analysis.lastActiveStage}
                  connectionState={analysis.connectionState}
                  cancelling={analysis.cancelling}
                  cancelError={analysis.cancelError}
                  onCancel={analysis.cancel}
                />
              ) : (
                <UploadStep
                  isUploading={isUploading}
                  filename={filename}
                  onSelectFile={handleFileSelected}
                />
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
