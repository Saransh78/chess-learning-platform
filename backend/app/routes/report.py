from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    HTTPException,
    Query,
    UploadFile,
)

from app.core.job_manager import (
    STATUS_COMPLETED,
    STATUS_FAILED,
    job_manager,
)
from app.services.report_jobs import run_report_job

router = APIRouter(prefix="/api", tags=["report"])


@router.post("/report")
def generate_report(
    file: Annotated[UploadFile, File()],
    background_tasks: BackgroundTasks,
    depth: Annotated[int, Query(ge=1, le=30)] = 12,
) -> dict:
    """Accept a PGN upload and queue background report analysis.

    Validates the upload synchronously, then returns immediately with the
    job handle. All analysis runs in the background worker, which reuses
    the existing services without duplicating their logic.
    """
    filename = file.filename or ""

    if not filename.lower().endswith(".pgn"):
        raise HTTPException(status_code=400, detail="Only .pgn files are accepted")

    raw = file.file.read()

    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not valid UTF-8 text")

    job = job_manager.create()
    background_tasks.add_task(
        run_report_job, job.job_id, content, filename, len(raw), depth
    )

    return {"job_id": job.job_id, "status": "queued"}


@router.get("/report/status/{job_id}")
def get_report_status(job_id: str) -> dict:
    """Return live progress for a report job."""
    job = job_manager.get(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Unknown job_id")

    return job_manager.to_status_dict(job)


@router.delete("/report/{job_id}")
def cancel_report(job_id: str) -> dict:
    """Request cooperative cancellation without changing polling endpoints."""
    accepted = job_manager.request_cancel(job_id)
    if accepted is None:
        raise HTTPException(status_code=404, detail="Unknown job_id")
    if not accepted:
        raise HTTPException(
            status_code=409,
            detail="The report job is already in a terminal state.",
        )
    return {"job_id": job_id, "status": "cancelling"}


@router.get("/report/result/{job_id}")
def get_report_result(job_id: str) -> dict:
    """Return the final report once the job has completed."""
    job = job_manager.get(job_id)

    if job is None:
        raise HTTPException(status_code=404, detail="Unknown job_id")

    if job.status == STATUS_FAILED:
        raise HTTPException(
            status_code=500, detail=job.error or "Analysis failed."
        )

    if job.status != STATUS_COMPLETED or job.result is None:
        return job_manager.to_status_dict(job)

    return job.result
