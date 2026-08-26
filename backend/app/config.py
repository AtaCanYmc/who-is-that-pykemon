import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "assets"
FONTS_DIR = ASSETS_DIR / "fonts"

# Video ayarları
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
VIDEO_FPS = 24
SILHOUETTE_DURATION = 3.5
TOTAL_DURATION = 7.0

# Çıktı klasörü / Geçici dosyalar
TEMP_DIR = Path(os.environ.get("TEMP_DIR", "/tmp/who_is_that_pykemon"))
TEMP_DIR.mkdir(parents=True, exist_ok=True)
