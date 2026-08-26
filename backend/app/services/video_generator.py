import os
from pathlib import Path
from typing import Optional
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Pillow >= 10 compatibility patch
if not hasattr(Image, "ANTIALIAS"):
    Image.ANTIALIAS = Image.Resampling.LANCZOS

try:
    from moviepy.editor import ImageClip, AudioFileClip, CompositeVideoClip
except ImportError:
    from moviepy import ImageClip, AudioFileClip, CompositeVideoClip

from app.config import (
    VIDEO_WIDTH,
    VIDEO_HEIGHT,
    VIDEO_FPS,
    SILHOUETTE_DURATION,
    TOTAL_DURATION,
    ASSETS_DIR,
    FONTS_DIR,
    THEMES
)
from app.utils.assets_init import ensure_assets

def render_reveal_text_layer(
    person_name: str,
    width: int = VIDEO_WIDTH,
    height: int = VIDEO_HEIGHT,
    theme: str = "classic"
) -> np.ndarray:
    """
    Renders the themed 'IT'S [NAME]!' badge overlay.

    Args:
        person_name (str): Name or title of the subject.
        width (int, optional): Canvas width in pixels. Defaults to VIDEO_WIDTH.
        height (int, optional): Canvas height in pixels. Defaults to VIDEO_HEIGHT.
        theme (str, optional): Theme identifier ('classic', 'gold', 'neon'). Defaults to 'classic'.

    Returns:
        np.ndarray: RGBA image array containing the formatted text overlay.
    """
    theme_cfg = THEMES.get(theme, THEMES["classic"])
    text_fill = theme_cfg.get("text_fill", "#FFCB05")
    text_stroke = theme_cfg.get("text_stroke", "#2A75BB")

    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    display_text = f"IT'S {person_name.upper()}!"
    font_size = 80

    font = None
    custom_font_files = list(FONTS_DIR.glob("*.ttf")) if FONTS_DIR.exists() else []
    if custom_font_files:
        try:
            font = ImageFont.truetype(str(custom_font_files[0]), font_size)
        except Exception:
            font = None

    if font is None:
        system_fonts = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/Library/Fonts/Arial Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        ]
        for sf in system_fonts:
            if os.path.exists(sf):
                try:
                    font = ImageFont.truetype(sf, font_size)
                    break
                except Exception:
                    continue

    if font is None:
        font = ImageFont.load_default()

    bbox = draw.textbbox((0, 0), display_text, font=font)
    text_w = bbox[2] - bbox[0]
    
    x = max(30, (width - text_w) // 2)
    y = int(height * 0.08)

    stroke_width = 8
    draw.text(
        (x, y),
        display_text,
        font=font,
        fill=text_fill,
        stroke_width=stroke_width,
        stroke_fill=text_stroke
    )
    return np.array(img)

def generate_reveal_video(
    transparent_img: Image.Image,
    silhouette_img: Image.Image,
    person_name: str,
    output_path: Path,
    theme: str = "classic"
) -> Path:
    """
    Generates a full 'Who is That Pykemon' reveal video with custom theme support.

    Args:
        transparent_img (Image.Image): Isolated full-color subject image.
        silhouette_img (Image.Image): Solid black silhouette image.
        person_name (str): Name or title to announce.
        output_path (Path): Destination path for the rendered MP4 file.
        theme (str, optional): Theme identifier ('classic', 'gold', 'neon'). Defaults to 'classic'.

    Returns:
        Path: Path to the generated video file.
    """
    ensure_assets(ASSETS_DIR)

    video_size = (VIDEO_WIDTH, VIDEO_HEIGHT)
    bg_path = ASSETS_DIR / "background.png"
    audio_candidates = [
        ASSETS_DIR / "whos_that_pokemon.mp3",
        ASSETS_DIR / "whos_that_pokemon.wav"
    ]
    audio_path = next((p for p in audio_candidates if p.exists()), None)

    # 1. Prepare Background Clip
    if bg_path.exists():
        with Image.open(bg_path) as raw_bg:
            bg_pil = raw_bg.convert("RGB").resize(video_size, Image.Resampling.LANCZOS)
            bg_np = np.array(bg_pil)
    else:
        bg_np = np.zeros((VIDEO_HEIGHT, VIDEO_WIDTH, 3), dtype=np.uint8) + np.array([42, 117, 187], dtype=np.uint8)

    bg_clip = ImageClip(bg_np).set_duration(TOTAL_DURATION)

    # 2. Scale Character to Fit Inside the Explosion Burst
    max_w = int(VIDEO_WIDTH * 0.44)
    max_h = int(VIDEO_HEIGHT * 0.70)

    orig_copy = transparent_img.copy().convert("RGBA")
    orig_copy.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

    sil_copy = silhouette_img.copy().convert("RGBA")
    sil_copy.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

    sil_np = np.array(sil_copy)
    orig_np = np.array(orig_copy)

    target_center_x = int(VIDEO_WIDTH * 0.28)
    target_center_y = int(VIDEO_HEIGHT * 0.48)
    
    char_x_pos = max(10, target_center_x - orig_copy.width // 2)
    char_y_pos = max(10, target_center_y - orig_copy.height // 2)

    # 3. Silhouette Video Clip (0.0s – 3.3s)
    sil_clip = (
        ImageClip(sil_np, ismask=False, transparent=True)
        .set_position((char_x_pos, char_y_pos))
        .set_start(0.0)
        .set_duration(SILHOUETTE_DURATION)
    )

    # 4. Color Reveal Video Clip (3.3s – 6.77s)
    reveal_duration = TOTAL_DURATION - SILHOUETTE_DURATION
    orig_clip = (
        ImageClip(orig_np, ismask=False, transparent=True)
        .set_position((char_x_pos, char_y_pos))
        .set_start(SILHOUETTE_DURATION)
        .set_duration(reveal_duration)
        .crossfadein(0.2)
    )

    # 5. Name Text Overlay Clip (3.3s – 6.77s)
    text_np = render_reveal_text_layer(person_name, VIDEO_WIDTH, VIDEO_HEIGHT, theme=theme)
    text_clip = (
        ImageClip(text_np, transparent=True)
        .set_start(SILHOUETTE_DURATION)
        .set_duration(reveal_duration)
        .crossfadein(0.15)
    )

    # 6. Composite Layers
    video = CompositeVideoClip(
        [bg_clip, sil_clip, orig_clip, text_clip],
        size=video_size
    )

    # 7. Attach Audio Track
    if audio_path and audio_path.exists():
        try:
            audio_clip = AudioFileClip(str(audio_path))
            if audio_clip.duration > TOTAL_DURATION:
                audio_clip = audio_clip.subclip(0, TOTAL_DURATION)
            video = video.set_audio(audio_clip)
        except Exception as e:
            print(f"Audio attachment warning: {e}")

    # 8. Encode and Write MP4 Video File
    output_path.parent.mkdir(parents=True, exist_ok=True)
    video.write_videofile(
        str(output_path),
        fps=VIDEO_FPS,
        codec="libx264",
        audio_codec="aac",
        preset="ultrafast",
        threads=4,
        logger=None
    )

    video.close()
    return output_path
