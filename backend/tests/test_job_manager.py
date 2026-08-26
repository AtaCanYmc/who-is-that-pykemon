import sys
import asyncio
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.job_manager import JobManager, JobStatus

@pytest.mark.asyncio
async def test_job_manager_lifecycle(sample_image_bytes):
    manager = JobManager()
    job = await manager.create_job(sample_image_bytes, "Pikachu", theme="classic")
    assert job.job_id is not None
    assert job.status in [JobStatus.QUEUED, JobStatus.REMOVING_BACKGROUND]

    # Poll until completed (timeout 20s)
    for _ in range(40):
        await asyncio.sleep(0.5)
        current = await manager.get_job(job.job_id)
        if current.status == JobStatus.COMPLETED:
            break
        if current.status == JobStatus.FAILED:
            pytest.fail(f"Job failed: {current.error}")

    assert current.status == JobStatus.COMPLETED
    assert current.progress == 100
    assert current.video_path is not None
    assert current.video_path.exists()
