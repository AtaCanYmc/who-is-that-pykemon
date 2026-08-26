import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

# Proje dizinini python yoluna ekle
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.image_processor import process_and_remove_background, generate_black_silhouette
from app.services.video_generator import generate_reveal_video

def test_pipeline():
    print("Testing 'Who is That Pykemon' pipeline...")
    
    # 1. Test görseli oluştur (kırmızı daire içeren şeffaf/beyaz zemin)
    test_img = Image.new("RGB", (400, 400), (255, 255, 255))
    draw = ImageDraw.Draw(test_img)
    draw.ellipse([80, 80, 320, 320], fill=(220, 20, 60))
    
    img_byte_arr = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    test_img.save(img_byte_arr.name, format="PNG")
    
    with open(img_byte_arr.name, "rb") as f:
        raw_bytes = f.read()

    # 2. Arka plan silme
    print("1. Background removal...")
    transparent = process_and_remove_background(raw_bytes)
    assert transparent.mode == "RGBA"

    # 3. Siluet
    print("2. Silhouette generation...")
    silhouette = generate_black_silhouette(transparent)
    assert silhouette.mode == "RGBA"

    # 4. Video üretimi
    print("3. MoviePy video generation...")
    output_video = Path(tempfile.gettempdir()) / "test_pykemon.mp4"
    generate_reveal_video(
        transparent_img=transparent,
        silhouette_img=silhouette,
        person_name="Pikachu",
        output_path=output_video
    )

    assert output_video.exists()
    assert output_video.stat().st_size > 1000
    print(f"✅ Pipeline test successful! Output video: {output_video} ({output_video.stat().st_size} bytes)")

if __name__ == "__main__":
    test_pipeline()
