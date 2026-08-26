import asyncio
import sys
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_get_themes_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/themes")
        assert response.status_code == 200
        themes = response.json()
        assert len(themes) >= 3
        theme_ids = [t["id"] for t in themes]
        assert "classic" in theme_ids
        assert "gold" in theme_ids
        assert "neon" in theme_ids


@pytest.mark.asyncio
async def test_async_jobs_workflow(sample_image_bytes):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Create Job
        create_res = await ac.post(
            "/api/jobs",
            files={"file": ("pikachu.png", sample_image_bytes, "image/png")},
            data={"name": "Ash", "theme": "classic"},
        )
        assert create_res.status_code == 202
        job_id = create_res.json()["job_id"]
        assert job_id is not None

        # 2. Poll Status until completed
        completed = False
        for _ in range(40):
            await asyncio.sleep(0.5)
            status_res = await ac.get(f"/api/jobs/{job_id}")
            assert status_res.status_code == 200
            data = status_res.json()
            if data["status"] == "COMPLETED":
                completed = True
                assert data["download_url"] is not None
                break
            if data["status"] == "FAILED":
                pytest.fail(f"Job failed: {data.get('error')}")

        assert completed is True

        # 3. Download the generated video
        download_res = await ac.get(f"/api/jobs/{job_id}/download")
        assert download_res.status_code == 200
        assert download_res.headers["content-type"] == "video/mp4"
        assert len(download_res.content) > 0


@pytest.mark.asyncio
async def test_async_jobs_workflow_with_turkish_characters(sample_image_bytes):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create Job with Turkish Characters
        create_res = await ac.post(
            "/api/jobs",
            files={"file": ("test.png", sample_image_bytes, "image/png")},
            data={"name": "Çağdaş Işık Şükrü", "theme": "gold"},
        )
        assert create_res.status_code == 202
        job_id = create_res.json()["job_id"]

        # Poll status
        completed = False
        for _ in range(40):
            await asyncio.sleep(0.5)
            status_res = await ac.get(f"/api/jobs/{job_id}")
            if status_res.status_code == 200 and status_res.json()["status"] == "COMPLETED":
                completed = True
                break

        assert completed is True

        # Download with Unicode Content-Disposition
        download_res = await ac.get(f"/api/jobs/{job_id}/download")
        assert download_res.status_code == 200
        assert download_res.headers["content-type"] == "video/mp4"
        assert "Content-Disposition" in download_res.headers
