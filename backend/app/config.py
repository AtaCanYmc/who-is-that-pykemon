import os
from pathlib import Path

# Base project paths
BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "assets"
FONTS_DIR = ASSETS_DIR / "fonts"

# Video generation configuration (16:9 Widescreen to match classic Pokémon transition card)
VIDEO_WIDTH = 1920
VIDEO_HEIGHT = 1080
VIDEO_FPS = 24
SILHOUETTE_DURATION = 3.5
TOTAL_DURATION = 7.0

# Temporary file directory
TEMP_DIR = Path(os.environ.get("TEMP_DIR", "/tmp/who_is_that_pykemon"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)
