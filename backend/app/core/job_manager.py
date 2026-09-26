"""In-memory background job tracking for long-running report analysis."""

import threading
import time
import uuid
from dataclasses import dataclass, field

QUEUED = "queued"
PARSING = "parsing"
STOCKFISH = "stockfish"
PATTERN_DETECTION = "pattern_detection"
REPORT_GENERATION = "report_generation"
FEATURE_EXTRACTION = "feature_extraction"
ML_PREDICTION = "ml_prediction"
SHAP_ANALYSIS = "shap_analysis"
PATTERN_MINING = "pattern_mining"
COACHING = "coaching"
COMPLETED = "completed"
FAILED = "failed"
CANCELLED = "cancelled"

STATUS_QUEUED = "queued"
STATUS_RUNNING = "running"
STATUS_COMPLETED = "completed"
STATUS_FAILED = "failed"
STATUS_CANCELLED = "cancelled"


@dataclass
class Job:
    job_id: str
    status: str = STATUS_QUEUED
    phase: str = QUEUED
    progress: float = 0.0
    current_game: int = 0
    total_games: int = 0
    current_position: int = 0
    total_positions: int = 0
    eta_seconds: float | None = None
    result: dict | None = None
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    stage: str = QUEUED
    stage_progress: float = 0.0
    stage_completed_units: int = 0
    stage_total_units: int = 0
    cancel_requested: bool = False


class JobManager:
    """Thread-safe in-memory job store (no Redis yet)."""

    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def create(self) -> Job:
        job = Job(job_id=uuid.uuid4().hex)

        with self._lock:
            self._jobs[job.job_id] = job

        return job

    def get(self, job_id: str) -> Job | None:
        with self._lock:
            return self._jobs.get(job_id)

    def request_cancel(self, job_id: str) -> bool | None:
        """Request cooperative cancellation; return None for an unknown job."""
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return None
            if job.status in (STATUS_COMPLETED, STATUS_FAILED, STATUS_CANCELLED):
                return False
            job.cancel_requested = True
            job.updated_at = time.time()
            return True

    def is_cancel_requested(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(job_id)
            return job is None or job.cancel_requested

    def update(self, job_id: str, **fields) -> Job | None:
        with self._lock:
            job = self._jobs.get(job_id)

            if job is None:
                return None

            for key, value in fields.items():
                setattr(job, key, value)

            job.updated_at = time.time()

            return job

    def set_phase(
        self,
        job_id: str,
        phase: str,
        status: str = STATUS_RUNNING,
        progress: float | None = None,
        eta_seconds: float | None = None,
        stage: str | None = None,
        stage_progress: float | None = None,
        stage_completed_units: int | None = None,
        stage_total_units: int | None = None,
        clear_eta: bool = False,
    ) -> Job | None:
        fields: dict = {"phase": phase, "status": status}

        if progress is not None:
            fields["progress"] = progress

        if eta_seconds is not None:
            fields["eta_seconds"] = eta_seconds
        elif clear_eta:
            fields["eta_seconds"] = None

        if stage is not None:
            fields["stage"] = stage
        if stage_progress is not None:
            fields["stage_progress"] = stage_progress
        if stage_completed_units is not None:
            fields["stage_completed_units"] = stage_completed_units
        if stage_total_units is not None:
            fields["stage_total_units"] = stage_total_units

        return self.update(job_id, **fields)

    def set_completed(self, job_id: str, result: dict) -> Job | None:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return None

            if job.cancel_requested:
                job.status = STATUS_CANCELLED
                job.phase = CANCELLED
                job.stage = CANCELLED
                job.error = "Analysis cancelled by request."
                job.eta_seconds = None
            else:
                job.status = STATUS_COMPLETED
                job.phase = COMPLETED
                job.stage = COMPLETED
                job.progress = 100.0
                job.stage_progress = 100.0
                job.stage_completed_units = 1
                job.stage_total_units = 1
                job.eta_seconds = 0.0
                job.result = result
                job.error = None

            job.updated_at = time.time()
            return job

    def set_failed(self, job_id: str, error: str) -> Job | None:
        return self.update(
            job_id,
            status=STATUS_FAILED,
            phase=FAILED,
            stage=FAILED,
            error=error or "Analysis failed.",
            eta_seconds=None,
        )

    def set_cancelled(self, job_id: str) -> Job | None:
        """Mark a cooperatively cancelled job as terminal."""
        return self.update(
            job_id,
            status=STATUS_CANCELLED,
            phase=CANCELLED,
            stage=CANCELLED,
            error="Analysis cancelled by request.",
            eta_seconds=None,
        )

    def to_status_dict(self, job: Job) -> dict:
        return {
            "job_id": job.job_id,
            "status": job.status,
            "phase": job.phase,
            "stage": job.stage,
            "progress": round(job.progress, 1),
            "stage_progress": round(job.stage_progress, 1),
            "stage_completed_units": job.stage_completed_units,
            "stage_total_units": job.stage_total_units,
            "current_game": job.current_game,
            "total_games": job.total_games,
            "current_position": job.current_position,
            "total_positions": job.total_positions,
            "eta_seconds": job.eta_seconds,
            "cancel_requested": job.cancel_requested,
        }


job_manager = JobManager()
