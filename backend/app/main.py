import logging
import re
import unicodedata
import urllib.parse
import uuid
from pathlib import Path

from fastapi import (
    BackgroundTasks,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.config import ASSETS_DIR, TEMP_DIR, THEMES
from app.services.image_processor import (
    generate_black_silhouette,
    process_and_remove_background,
)
from app.services.job_manager import JobStatus, job_manager
from app.services.video_generator import generate_reveal_video
from app.utils.assets_init import ensure_assets
from app.utils.cleanup import start_cleanup_worker, stop_cleanup_worker
from app.utils.validator import validate_uploaded_image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("who-is-that-pykemon")

app = FastAPI(
    title="Who is That Pykemon API",
    description="Asynchronous Task Queue & REST API for Pokémon Reveal Meme Video Generation",
    version="1.1.0",
)

# Configure Cross-Origin Resource Sharing (CORS) for PWA frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Pydantic Response & Request Models
# ==========================================
class ThemeItem(BaseModel):
    id: str
    name: str
    description: str


class JobCreatedResponse(BaseModel):
    job_id: str
    status: str
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: int
    message: str
    download_url: str | None = None
    error: str | None = None


# ==========================================
# Lifecycle Hooks
# ==========================================
@app.on_event("startup")
async def startup_event() -> None:
    """Initializes default assets and starts the background disk cleanup worker."""
    ensure_assets(ASSETS_DIR)
    start_cleanup_worker()
    logger.info("Application started: Assets verified and cleanup worker running.")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Stops the background cleanup worker cleanly on application exit."""
    stop_cleanup_worker()
    logger.info("Application shutdown: Cleanup worker stopped.")


def remove_temp_file(file_path: str) -> None:
    """Deletes temporary video file after download."""
    try:
        p = Path(file_path)
        if p.exists():
            p.unlink()
            logger.info(f"Temporary file deleted: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to delete temp file {file_path}: {e}")


# ==========================================
# API Endpoints
# ==========================================
@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "app": "Who is That Pykemon", "version": "1.1.0"}


@app.get("/api/themes", response_model=list[ThemeItem])
def get_themes() -> list[ThemeItem]:
    """Returns available theme styles."""
    return [
        ThemeItem(id=k, name=v["name"], description=v["description"]) for k, v in THEMES.items()
    ]


# ------------------------------------------
# Asynchronous Job Queue Endpoints
# ------------------------------------------
@app.post("/api/jobs", response_model=JobCreatedResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_video_job(
    file: UploadFile = File(..., description="Portrait image file"),
    name: str = Form("Someone", description="Subject name to announce"),
    theme: str = Form("classic", description="Theme identifier"),
    font_style: str = Form("solid", description="Font style: solid, hollow, arcade, sans"),
) -> JobCreatedResponse:
    """
    Submits a video creation job to the asynchronous processing queue.
    Returns immediately with a job ID for status polling.
    """
    image_bytes = await file.read()
    validate_uploaded_image(file, image_bytes)

    valid_theme = theme if theme in THEMES else "classic"
    job = await job_manager.create_job(
        image_bytes=image_bytes,
        person_name=name,
        theme=valid_theme,
        font_style=font_style,
    )

    return JobCreatedResponse(job_id=job.job_id, status=job.status.value, message=job.message)


@app.get("/api/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str) -> JobStatusResponse:
    """
    Polls the current processing state and progress percentage of a job.
    """
    job = await job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    download_url = f"/api/jobs/{job_id}/download" if job.status == JobStatus.COMPLETED else None

    return JobStatusResponse(
        job_id=job.job_id,
        status=job.status.value,
        progress=job.progress,
        message=job.message,
        download_url=download_url,
        error=job.error,
    )


def get_safe_content_disposition(person_name: str) -> tuple[str, str]:
    """
    Sanitizes Unicode / Turkish characters for HTTP Content-Disposition headers.
    Returns (ascii_filename, content_disposition_header_value).
    """
    tr_map = {
        "ç": "c",
        "Ç": "C",
        "ğ": "g",
        "Ğ": "G",
        "ı": "i",
        "I": "I",
        "İ": "I",
        "i": "i",
        "ö": "o",
        "Ö": "O",
        "ş": "s",
        "Ş": "S",
        "ü": "u",
        "Ü": "U",
    }
    clean = person_name.strip() or "pykemon"
    for tr_char, ascii_char in tr_map.items():
        clean = clean.replace(tr_char, ascii_char)
    normalized = unicodedata.normalize("NFKD", clean).encode("ascii", "ignore").decode("ascii")
    safe_ascii = re.sub(r"[^a-zA-Z0-9_\-]", "_", normalized).strip("_").lower() or "pykemon"

    ascii_filename = f"whos_that_{safe_ascii}.mp4"
    utf8_filename = urllib.parse.quote(
        f"whos_that_{(person_name.strip() or 'pykemon').lower().replace(' ', '_')}.mp4"
    )
    content_disposition = (
        f"attachment; filename=\"{ascii_filename}\"; filename*=UTF-8''{utf8_filename}"
    )
    return ascii_filename, content_disposition


@app.get("/api/jobs/{job_id}/download")
async def download_job_video(job_id: str, background_tasks: BackgroundTasks) -> FileResponse:
    """
    Downloads the completed video file for a specific job.
    """
    job = await job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if job.status != JobStatus.COMPLETED or not job.video_path or not job.video_path.exists():
        raise HTTPException(status_code=400, detail="Video is not ready or has expired.")

    ascii_filename, content_disposition = get_safe_content_disposition(job.person_name)
    return FileResponse(
        path=str(job.video_path),
        media_type="video/mp4",
        filename=ascii_filename,
        headers={
            "Access-Control-Expose-Headers": "Content-Disposition",
            "Content-Disposition": content_disposition,
        },
    )


# ------------------------------------------
# Synchronous Endpoint (Backward Compatible)
# ------------------------------------------
@app.post("/generate-video")
async def generate_video_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Uploaded portrait photo"),
    name: str = Form("Someone", description="Name displayed during reveal"),
    theme: str = Form("classic", description="Theme identifier"),
    font_style: str = Form("solid", description="Font style: solid, hollow, arcade, sans"),
) -> FileResponse:
    """
    Synchronously renders and streams a 'Who is That Pykemon' video.
    """
    image_bytes = await file.read()
    validate_uploaded_image(file, image_bytes)

    clean_name = name.strip() or "Someone"
    valid_theme = theme if theme in THEMES else "classic"

    try:
        transparent_img = process_and_remove_background(image_bytes)
        silhouette_img = generate_black_silhouette(transparent_img)

        video_id = uuid.uuid4().hex
        output_video_path = TEMP_DIR / f"pykemon_{video_id}.mp4"

        generate_reveal_video(
            transparent_img=transparent_img,
            silhouette_img=silhouette_img,
            person_name=clean_name,
            output_path=output_video_path,
            theme=valid_theme,
            font_style=font_style,
        )

        background_tasks.add_task(remove_temp_file, str(output_video_path))

        ascii_filename, content_disposition = get_safe_content_disposition(clean_name)
        return FileResponse(
            path=str(output_video_path),
            media_type="video/mp4",
            filename=ascii_filename,
            headers={
                "Access-Control-Expose-Headers": "Content-Disposition",
                "Content-Disposition": content_disposition,
            },
        )
    except Exception as e:
        logger.exception(f"Error during video generation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate video: {e!s}") from e
