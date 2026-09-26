"""Adapt the ML analysis pipeline to the existing background-job manager."""

import logging
import time
from collections import defaultdict, deque
from statistics import fmean

from app.core.job_manager import (
    COMPLETED,
    PARSING,
    PATTERN_DETECTION,
    REPORT_GENERATION,
    STATUS_CANCELLED,
    STATUS_QUEUED,
    STATUS_RUNNING,
    STOCKFISH,
    job_manager,
)
from ml.pipeline import (
    PipelineCancelledError,
    PipelineProgress,
    PipelineStageError,
    analyze_games,
)

logger = logging.getLogger(__name__)

_STAGE_PROGRESS_RANGES: dict[str, tuple[float, float]] = {
    "queued": (0.0, 0.0),
    "parsing_pgn": (0.0, 4.0),
    "extracting_features": (4.0, 14.0),
    "stockfish_analysis": (14.0, 82.0),
    "ml_prediction": (82.0, 85.0),
    "shap_analysis": (85.0, 92.0),
    "pattern_mining": (92.0, 96.0),
    "coaching": (96.0, 99.0),
    "completed": (99.0, 100.0),
}

_LEGACY_PHASES: dict[str, str] = {
    "queued": "queued",
    "parsing_pgn": PARSING,
    "extracting_features": PARSING,
    "stockfish_analysis": STOCKFISH,
    "ml_prediction": PATTERN_DETECTION,
    "shap_analysis": PATTERN_DETECTION,
    "pattern_mining": PATTERN_DETECTION,
    "coaching": REPORT_GENERATION,
    "completed": COMPLETED,
}


class _MovingAverageETA:
    """Estimate remaining work from a bounded moving window of observed rates."""

    def __init__(self, window_size: int = 30) -> None:
        self._samples: dict[str, deque[float]] = defaultdict(
            lambda: deque(maxlen=window_size)
        )
        self._last: dict[str, tuple[int, float]] = {}

    def estimate(self, event: PipelineProgress) -> float | None:
        if event.unit == "stage":
            return 0.0 if event.stage_progress >= 1.0 else None
        if event.stage == "parsing_pgn" and event.total_units <= 0:
            return None

        now = time.monotonic()
        previous = self._last.get(event.unit)
        if previous is not None:
            previous_count, previous_time = previous
            completed_delta = event.completed_units - previous_count
            elapsed = now - previous_time
            if completed_delta > 0 and elapsed > 0:
                self._samples[event.unit].append(elapsed / completed_delta)
        self._last[event.unit] = (event.completed_units, now)

        if event.total_units <= 0:
            return None
        remaining = max(event.total_units - event.completed_units, 0)
        if remaining == 0:
            return 0.0
        samples = self._samples[event.unit]
        if not samples:
            return None
        return round(fmean(samples) * remaining, 1)


def _overall_progress(event: PipelineProgress) -> float:
    """Scale real stage completion into the existing overall progress field."""
    start, end = _STAGE_PROGRESS_RANGES.get(event.stage, (0.0, 99.0))
    return start + (end - start) * event.stage_progress


def _publish_progress(
    job_id: str,
    event: PipelineProgress,
    eta_tracker: _MovingAverageETA,
) -> None:
    """Translate pipeline events to the existing status schema plus stage fields."""
    eta = eta_tracker.estimate(event)
    legacy_phase = _LEGACY_PHASES.get(event.stage, REPORT_GENERATION)
    status = STATUS_QUEUED if event.stage == "queued" else STATUS_RUNNING

    fields: dict[str, int] = {}
    if event.total_games > 0:
        fields["total_games"] = event.total_games
    if event.total_positions > 0:
        fields["total_positions"] = event.total_positions
    fields["current_game"] = event.current_game
    if event.stage == "stockfish_analysis":
        fields["current_position"] = event.completed_positions
    elif event.stage in {
        "ml_prediction",
        "shap_analysis",
        "pattern_mining",
        "coaching",
        "completed",
    }:
        fields["current_position"] = event.completed_positions
    job_manager.update(job_id, **fields)

    job_manager.set_phase(
        job_id,
        legacy_phase,
        status=status,
        progress=_overall_progress(event),
        eta_seconds=eta,
        stage=event.stage,
        stage_progress=event.stage_progress * 100.0,
        stage_completed_units=event.completed_units,
        stage_total_units=event.total_units,
        clear_eta=eta is None,
    )


def run_report_job(
    job_id: str,
    content: str,
    filename: str,
    file_size_bytes: int,
    depth: int = 12,
) -> None:
    """Run the unified pipeline inside the established report-job lifecycle."""
    eta_tracker = _MovingAverageETA()
    logger.info("Starting report job %s for %s", job_id, filename)

    def publish(event: PipelineProgress) -> None:
        _publish_progress(job_id, event, eta_tracker)

    try:
        result = analyze_games(
            content,
            depth=depth,
            filename=filename,
            file_size_bytes=file_size_bytes,
            progress_callback=publish,
            cancel_check=lambda: job_manager.is_cancel_requested(job_id),
        )
        completed_job = job_manager.set_completed(job_id, result)
        if completed_job is not None and completed_job.status == STATUS_CANCELLED:
            logger.info("Report job %s was cancelled before completion", job_id)
        else:
            logger.info("Report job %s completed", job_id)
    except PipelineCancelledError:
        job_manager.set_cancelled(job_id)
        logger.info("Report job %s was cancelled", job_id)
    except PipelineStageError as exc:
        logger.exception("Report job %s failed in stage %s", job_id, exc.stage)
        job_manager.set_failed(job_id, str(exc))
    except Exception as exc:  # ensure unexpected worker errors never strand a job
        message = str(exc).strip() or type(exc).__name__
        logger.exception("Report job %s failed unexpectedly", job_id)
        job_manager.set_failed(job_id, f"Analysis pipeline failed: {message}")


__all__ = ["run_report_job"]
