import asyncio
import logging
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path

from app.config import TEMP_DIR
from app.services.image_processor import (
    generate_black_silhouette,
    process_and_remove_background,
)
from app.services.video_generator import generate_reveal_video

logger = logging.getLogger("who-is-that-pykemon.jobs")


class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    REMOVING_BACKGROUND = "REMOVING_BACKGROUND"
    GENERATING_SILHOUETTE = "GENERATING_SILHOUETTE"
    RENDERING_VIDEO = "RENDERING_VIDEO"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


STATUS_PROGRESS_MAP = {
    JobStatus.QUEUED: (5, "Job queued in processing worker..."),
    JobStatus.REMOVING_BACKGROUND: (30, "Removing background with AI model..."),
    JobStatus.GENERATING_SILHOUETTE: (60, "Generating solid black silhouette..."),
    JobStatus.RENDERING_VIDEO: (
        85,
        "Rendering Pokémon reveal video & synchronizing audio...",
    ),
    JobStatus.COMPLETED: (100, "Video generated successfully!"),
    JobStatus.FAILED: (0, "Processing failed."),
}


@dataclass
class JobRecord:
    job_id: str
    person_name: str
    theme: str
    status: JobStatus = JobStatus.QUEUED
    progress: int = 5
    message: str = "Job queued..."
    video_path: Path | None = None
    error: str | None = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)


class JobManager:
    """
    Thread-safe asynchronous Job and Task Queue Manager.
    Handles background processing, step-by-step progress tracking,
    and output retrieval.
    """

    def __init__(self):
        self._jobs: dict[str, JobRecord] = {}
        self._lock = asyncio.Lock()
        self._background_tasks = set()

    def _update_job_status(self, job: JobRecord, status: JobStatus, custom_msg: str | None = None):
        job.status = status
        default_prog, default_msg = STATUS_PROGRESS_MAP.get(status, (0, ""))
        job.progress = default_prog
        job.message = custom_msg or default_msg
        job.updated_at = time.time()

    async def create_job(
        self, image_bytes: bytes, person_name: str, theme: str = "classic"
    ) -> JobRecord:
        """Registers a new video rendering job and launches the background processing worker."""
        job_id = uuid.uuid4().hex
        job = JobRecord(job_id=job_id, person_name=person_name.strip() or "Pykemon", theme=theme)

        async with self._lock:
            self._jobs[job_id] = job

        # Spawn asynchronous processing task and hold reference
        task = asyncio.create_task(self._process_job_worker(job_id, image_bytes))
        self._background_tasks.add(task)
        task.add_done_callback(self._background_tasks.discard)
        return job

    async def get_job(self, job_id: str) -> JobRecord | None:
        """Retrieves a job by its unique identifier."""
        return self._jobs.get(job_id)

    async def _process_job_worker(self, job_id: str, image_bytes: bytes):
        """Worker executing image segmentation and MoviePy video synthesis."""
        job = self._jobs.get(job_id)
        if not job:
            return

        try:
            logger.info(
                f"[Job {job_id}] Starting processing for '{job.person_name}' (Theme: {job.theme})..."
            )

            # Step 1: Background removal
            self._update_job_status(job, JobStatus.REMOVING_BACKGROUND)
            # Run CPU-bound rembg in default executor
            loop = asyncio.get_event_loop()
            transparent_img = await loop.run_in_executor(
                None, process_and_remove_background, image_bytes
            )

            # Step 2: Silhouette generation
            self._update_job_status(job, JobStatus.GENERATING_SILHOUETTE)
            silhouette_img = await loop.run_in_executor(
                None, generate_black_silhouette, transparent_img
            )

            # Step 3: Video synthesis & encoding
            self._update_job_status(job, JobStatus.RENDERING_VIDEO)
            output_video_path = TEMP_DIR / f"pykemon_{job_id}.mp4"

            await loop.run_in_executor(
                None,
                generate_reveal_video,
                transparent_img,
                silhouette_img,
                job.person_name,
                output_video_path,
                job.theme,
            )

            # Step 4: Completed
            job.video_path = output_video_path
            self._update_job_status(job, JobStatus.COMPLETED)
            logger.info(f"[Job {job_id}] Successfully finished rendering: {output_video_path}")

        except Exception as e:
            logger.exception(f"[Job {job_id}] Execution error: {e}")
            job.error = str(e)
            self._update_job_status(job, JobStatus.FAILED, f"Error: {e!s}")


# Global singleton instance
job_manager = JobManager()
