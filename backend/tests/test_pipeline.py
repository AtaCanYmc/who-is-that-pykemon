import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

# Ensure backend root is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.image_processor import (
    generate_black_silhouette,
    process_and_remove_background,
)
from app.services.video_generator import generate_reveal_video


def test_pipeline():
    """
    Executes an end-to-end processing test:
    1. Generates a synthetic input image.
    2. Runs rembg background removal.
    3. Generates the solid black silhouette.
    4. Slices and composites the final 1080x1920 MP4 reveal video.
    """
    print("Testing 'Who is That Pykemon' pipeline...")

    # 1. Create synthetic test image
    test_img = Image.new("RGB", (400, 400), (255, 255, 255))
    draw = ImageDraw.Draw(test_img)
    draw.ellipse([80, 80, 320, 320], fill=(220, 20, 60))

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
        test_img.save(tmp_img.name, format="PNG")
        tmp_img_path = tmp_img.name

    with open(tmp_img_path, "rb") as f:
        raw_bytes = f.read()

    # 2. Test background removal
    print("1. Background removal...")
    transparent = process_and_remove_background(raw_bytes)
    assert transparent.mode == "RGBA"

    # 3. Test silhouette generation
    print("2. Silhouette generation...")
    silhouette = generate_black_silhouette(transparent)
    assert silhouette.mode == "RGBA"

    # 4. Test video rendering
    print("3. MoviePy video generation...")
    output_video = Path(tempfile.gettempdir()) / "test_pykemon.mp4"
    generate_reveal_video(
        transparent_img=transparent,
        silhouette_img=silhouette,
        person_name="Pikachu",
        output_path=output_video,
    )

    assert output_video.exists()
    assert output_video.stat().st_size > 1000
    print(
        f"✅ Pipeline test successful! Output video: {output_video} ({output_video.stat().st_size} bytes)"
    )


if __name__ == "__main__":
    test_pipeline()
