const FALLBACK_BASE_URL = "http://127.0.0.1:8000";
export const DEFAULT_REPORT_DEPTH = 12;

export const API_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) || FALLBACK_BASE_URL;

export function isPgnFile(file) {
  const name = file?.name || "";
  return name.toLowerCase().endsWith(".pgn");
}

function friendlyError(status, detail) {
  if (status === 400) {
    return detail || "The server rejected this PGN file.";
  }

  if (status === 500) {
    return "The analysis server hit an unexpected error. Please try again.";
  }

  return detail || `Request failed with status ${status}.`;
}

export async function postReportPgn(
  file,
  { depth = DEFAULT_REPORT_DEPTH, signal } = {}
) {
  if (!isPgnFile(file)) {
    throw new Error("Please choose a file with a .pgn extension.");
  }

  const formData = new FormData();
  formData.append("file", file);

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/report?depth=${encodeURIComponent(depth)}`,
      { method: "POST", body: formData, signal }
    );
  } catch (error) {
    if (error?.name === "AbortError" || signal?.aborted) throw error;

    throw new Error(
      "Cannot reach the analysis server. Make sure the backend is running.",
      { cause: error }
    );
  }

  if (!response.ok) {
    const detail = await readErrorDetail(response);

    throw new Error(friendlyError(response.status, detail));
  }

  return response.json();
}

async function readErrorDetail(response) {
  try {
    const body = await response.json();
    return body?.detail || "";
  } catch {
    return "";
  }
}

async function fetchJson(url, { signal } = {}) {
  let response;

  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error?.name === "AbortError" || signal?.aborted) throw error;

    throw new Error(
      "Cannot reach the analysis server. Make sure the backend is running.",
      { cause: error }
    );
  }

  return response;
}

export async function getReportStatus(jobId, { signal } = {}) {
  const response = await fetchJson(
    `${API_BASE_URL}/api/report/status/${encodeURIComponent(jobId)}`,
    { signal }
  );

  if (!response.ok) {
    const detail = await readErrorDetail(response);

    if (response.status === 404) {
      throw new Error("Report job not found. It may have expired.");
    }

    throw new Error(friendlyError(response.status, detail));
  }

  return response.json();
}

export async function getReportResult(jobId, { signal } = {}) {
  const response = await fetchJson(
    `${API_BASE_URL}/api/report/result/${encodeURIComponent(jobId)}`,
    { signal }
  );

  if (!response.ok) {
    const detail = await readErrorDetail(response);

    if (response.status === 404) {
      throw new Error("Report job not found. It may have expired.");
    }

    // The backend returns the readable analysis error as `detail`.
    throw new Error(detail || "The analysis server hit an unexpected error.");
  }

  return response.json();
}

export async function cancelReportJob(jobId, { signal } = {}) {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}/api/report/${encodeURIComponent(jobId)}`,
      { method: "DELETE", signal }
    );
  } catch (error) {
    if (error?.name === "AbortError" || signal?.aborted) throw error;

    throw new Error(
      "Cannot reach the analysis server. The job will keep running until cancellation is confirmed.",
      { cause: error }
    );
  }

  if (!response.ok) {
    const detail = await readErrorDetail(response);
    throw new Error(friendlyError(response.status, detail));
  }

  return response.json();
}

export async function getAuthMe(accessToken, { signal } = {}) {
  if (!accessToken) {
    throw new Error("Missing access token. Please sign in again.");
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError" || signal?.aborted) throw error;
    throw new Error(
      "Cannot reach the analysis server. Make sure the backend is running.",
      { cause: error }
    );
  }
  if (!response.ok) {
    const detail = await readErrorDetail(response);
    if (response.status === 401) {
      throw new Error(detail || "Session has expired. Please sign in again.");
    }
    throw new Error(friendlyError(response.status, detail));
  }
  return response.json();
}

export function formatEta(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined) {
    return "Calculating…";
  }

  const total = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  if (minutes <= 0) return `${seconds}s remaining`;

  return `${minutes}m ${String(seconds).padStart(2, "0")}s remaining`;
}
