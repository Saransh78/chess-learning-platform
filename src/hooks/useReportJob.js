import { useCallback, useEffect, useState } from "react";
import {
  cancelReportJob,
  getReportResult,
  getReportStatus,
} from "../services/api";
import {
  getSavedReportStage,
  saveReportStage,
} from "../services/reportJobStorage";

const POLL_INTERVAL_MS = 1000;
const MAX_RECONNECT_INTERVAL_MS = 8000;

function isExpiredJobError(error) {
  return error?.message?.toLowerCase().includes("job not found");
}

export default function useReportJob(jobId) {
  const [jobState, setJobState] = useState(null);
  const [lastActiveStage, setLastActiveStage] = useState(getSavedReportStage);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [connectionState, setConnectionState] = useState("connecting");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    if (!jobId) return undefined;

    let disposed = false;
    let timer = null;
    let reconnectDelay = POLL_INTERVAL_MS;
    const controller = new AbortController();

    async function poll() {
      try {
        const status = await getReportStatus(jobId, {
          signal: controller.signal,
        });
        if (disposed) return;

        reconnectDelay = POLL_INTERVAL_MS;
        setConnectionState("connected");
        setJobState(status);

        if (status.status === "queued" || status.status === "running") {
          if (status.stage) {
            setLastActiveStage(status.stage);
            saveReportStage(status.stage);
          }
        }

        if (status.status === "completed") {
          if (status.stage) setLastActiveStage(status.stage);
          const result = await getReportResult(jobId, {
            signal: controller.signal,
          });
          if (disposed) return;

          setReport(result);
          setError("");
          return;
        }

        if (status.status === "failed") {
          try {
            await getReportResult(jobId, { signal: controller.signal });
            if (!disposed) setError("The analysis could not be completed.");
          } catch (resultError) {
            if (!disposed) {
              setError(
                resultError?.message || "The analysis could not be completed."
              );
            }
          }
          return;
        }

        if (status.status === "cancelled") return;

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (pollError) {
        if (disposed || pollError?.name === "AbortError") return;

        if (isExpiredJobError(pollError)) {
          setError(pollError.message);
          setConnectionState("failed");
          return;
        }

        setConnectionState("reconnecting");
        timer = setTimeout(poll, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      disposed = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  const cancel = useCallback(async () => {
    if (!jobId || cancelling || jobState?.cancel_requested) return;

    setCancelling(true);
    setCancelError("");
    try {
      await cancelReportJob(jobId);
      setJobState((previous) =>
        previous ? { ...previous, cancel_requested: true } : previous
      );
    } catch (cancelRequestError) {
      setCancelError(
        cancelRequestError?.message || "Could not request cancellation."
      );
    } finally {
      setCancelling(false);
    }
  }, [cancelling, jobId, jobState?.cancel_requested]);

  const terminal =
    jobState?.status === "completed" ||
    jobState?.status === "failed" ||
    jobState?.status === "cancelled" ||
    connectionState === "failed";

  return {
    jobState,
    lastActiveStage,
    report,
    error,
    connectionState,
    cancelling,
    cancelError,
    cancel,
    terminal,
    completed: report !== null,
  };
}
