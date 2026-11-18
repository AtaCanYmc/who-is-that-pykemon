[← Back to Root Repository](../README.md)

# Backend Service · Who is That Pykemon

FastAPI video generation backend powered by `rembg` (u2net ONNX session), Pillow, MoviePy, and NumPy. Isolates subjects from uploaded images, synthesizes jet-black silhouettes, and renders customized video reveal clips with synchronized audio.

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)

## Architecture

The backend consists of four primary subsystems:

- **REST & Queue Interface (`app/main.py`)**: Exposes health checks, theme listings, and asynchronous job endpoints.
- **Image Processing (`app/services/image_processor.py`)**: Removes backgrounds via `rembg`, applies Hermite alpha solidifications, and generates pure `#000000` silhouettes.
- **Video Composition (`app/services/video_generator.py`)**: Assembles 1920x1080 24fps MP4 clips using MoviePy, composite clips, and custom text badges.
- **Lifecycle & Garbage Collection (`app/utils/cleanup.py`)**: Runs an automated periodic worker purging temporary MP4 artifacts older than 15 minutes.

```text
backend/
├── app/
│   ├── config.py             # Global constants, paths, and theme presets
│   ├── main.py               # FastAPI application, route handlers, and CORS
│   ├── services/
│   │   ├── image_processor.py # Background isolation and silhouette generation
│   │   ├── job_manager.py     # Asynchronous task queue and status tracker
│   │   └── video_generator.py # MoviePy composition and text overlay rendering
│   └── utils/
│       ├── assets_init.py     # Procedural asset synthesis fallback
│       ├── cleanup.py         # Periodic disk garbage collector
│       └── validator.py       # Image MIME type and file size validation
├── assets/                   # Theme backgrounds, audio clips, and TrueType fonts
├── tests/                    # Pytest test suite
├── Dockerfile                # Multi-stage container definition
└── requirements.txt          # Python runtime dependencies
```

## Prerequisites

- Python 3.11 or later
- FFmpeg installed and available on system `$PATH`
- System graphics libraries (`libgl1`, `libglib2.0-0` on Debian/Ubuntu)

## Quick Start

```bash
# 1. Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start development server
uvicorn app.main:app --reload --port 8000
```

The API documentation is accessible at `http://localhost:8000/docs`.

## API Reference

### Health Check

```http
GET /health
```

Returns service status and version information.

### List Themes

```http
GET /api/themes
```

Returns array of supported themes (`classic`, `gold`, `neon`).

### Submit Video Job (Async)

```http
POST /api/jobs
Content-Type: multipart/form-data

file: <binary image>
name: "Pikachu"
theme: "classic"
font_style: "solid"
```

Returns HTTP 202 with `job_id`:

```json
{
  "job_id": "4a7f8e81-...",
  "status": "queued",
  "message": "Job queued for processing."
}
```

### Poll Job Status

```http
GET /api/jobs/{job_id}
```

Returns processing state and progress percentage (0 to 100). When `status == "completed"`, provides `download_url`.

### Download Rendered Video

```http
GET /api/jobs/{job_id}/download
```

Streams the rendered MP4 file with sanitized RFC 5987 `Content-Disposition` headers.

### Legacy Synchronous Render

```http
POST /generate-video
Content-Type: multipart/form-data
```

Renders and directly streams the completed video clip in a single request.

## Environment Configuration

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `TEMP_DIR` | string | `/tmp/who_is_that_pykemon` | Directory for temporary video renders and job scratch files. |

## Testing

```bash
# Run test suite
pytest tests/ -v

# Run with coverage report
pytest tests/ -v --cov=app --cov-report=term-missing
```
