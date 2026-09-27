import { useCallback, useEffect, useRef, useState } from "react";
import { isPgnFile, postReportPgn } from "../services/api";
import {
  clearSavedReportJobId,
  saveReportJobId,
} from "../services/reportJobStorage";

const UPLOAD_TIMEOUT_MS = 120000;

export default function useReport() {
  const [status, setStatus] = useState("idle");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const abortRef = useRef(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const submitReport = useCallback(async (file) => {
    if (!file) return;

    if (!isPgnFile(file)) {
      setStatus("error");
      setReport(null);
      setError("Please choose a file with a .pgn extension.");
      setFilename(file.name || "");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort(
        new Error(
          "Upload timed out. The server is taking too long to respond."
        )
      );
    }, UPLOAD_TIMEOUT_MS);

    setStatus("uploading");
    setError("");
    setReport(null);
    setFilename(file.name);

    try {
      const data = await postReportPgn(file, { signal: controller.signal });
      saveReportJobId(data?.job_id);
      setReport(data);
      setStatus("success");
      return data;
    } catch (err) {
      if (err?.name === "AbortError" && !timedOut) return null;

      setReport(null);
      setError(
        timedOut
          ? controller.signal.reason?.message || "Upload timed out. Please try again."
          : err?.message || "Something went wrong. Please try again."
      );
      setStatus("error");
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    clearSavedReportJobId();
    setStatus("idle");
    setReport(null);
    setError("");
    setFilename("");
  }, []);

  return {
    status,
    report,
    error,
    filename,
    isUploading: status === "uploading",
    submitReport,
    reset,
  };
}
