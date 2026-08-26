import os
from pathlib import Path
from typing import Any

# Base project paths
BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "assets"
FONTS_DIR = ASSETS_DIR / "fonts"

# Video generation configuration (16:9 Widescreen)
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
VIDEO_FPS = 24
SILHOUETTE_DURATION = 3.3
TOTAL_DURATION = 6.77

# File upload and validation limits
MAX_UPLOAD_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

# Temporary file directory & Garbage Collection policy
TEMP_DIR = Path(os.environ.get("TEMP_DIR", "/tmp/who_is_that_pykemon"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)
TEMP_FILE_MAX_AGE_SECONDS = 900  # 15 minutes
CLEANUP_INTERVAL_SECONDS = 300  # Check every 5 minutes

# Theme Presets
THEMES: dict[str, dict[str, Any]] = {
    "classic": {
        "name": "Kanto Classic",
        "description": "Original 1997 anime TV transition with blue rayburst and yellow logo.",
        "text_fill": "#FFCB05",
        "text_stroke": "#2A75BB",
        "bg_image": "background.png",
        "audio": "whos_that_pokemon.mp3",
    },
    "gold": {
        "name": "Johto Gold",
        "description": "Nostalgic Gen-2 theme with shimmering gold and crimson accents.",
        "text_fill": "#FFE600",
        "text_stroke": "#9B1C1C",
        "bg_image": "background.png",
        "audio": "whos_that_pokemon.mp3",
    },
    "neon": {
        "name": "Cyber Neon",
        "description": "Futuristic electric synthwave theme with cyan and magenta lighting.",
        "text_fill": "#00FFFF",
        "text_stroke": "#FF007F",
        "bg_image": "background.png",
        "audio": "whos_that_pokemon.mp3",
    },
}
