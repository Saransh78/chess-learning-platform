const ACTIVE_REPORT_JOB_KEY = "knightmind.activeReportJobId";
const ACTIVE_REPORT_STAGE_KEY = "knightmind.activeReportStage";

export function getSavedReportJobId() {
  try {
    return window.localStorage.getItem(ACTIVE_REPORT_JOB_KEY);
  } catch {
    return null;
  }
}

export function saveReportJobId(jobId) {
  try {
    if (!jobId) return;

    if (window.localStorage.getItem(ACTIVE_REPORT_JOB_KEY) !== jobId) {
      window.localStorage.removeItem(ACTIVE_REPORT_STAGE_KEY);
    }
    window.localStorage.setItem(ACTIVE_REPORT_JOB_KEY, jobId);
  } catch {
    // Polling still works for the current session when storage is unavailable.
  }
}

export function getSavedReportStage() {
  try {
    return window.localStorage.getItem(ACTIVE_REPORT_STAGE_KEY);
  } catch {
    return null;
  }
}

export function saveReportStage(stage) {
  try {
    if (stage) window.localStorage.setItem(ACTIVE_REPORT_STAGE_KEY, stage);
  } catch {
    // Polling still works for the current session when storage is unavailable.
  }
}

export function clearSavedReportJobId() {
  try {
    window.localStorage.removeItem(ACTIVE_REPORT_JOB_KEY);
    window.localStorage.removeItem(ACTIVE_REPORT_STAGE_KEY);
  } catch {
    // Storage may be disabled by the browser; nothing else needs cleanup.
  }
}
