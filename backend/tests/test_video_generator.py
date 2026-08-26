import sys
import tempfile
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.video_generator import render_reveal_text_layer, generate_reveal_video
from app.services.image_processor import generate_black_silhouette

def test_render_reveal_text_layer():
    """
    Verifies that the Pokémon reveal text layer generates a valid RGBA numpy array.
    """
    text_np = render_reveal_text_layer("Ash Ketchum", 1080, 1920)
    assert isinstance(text_np, np.ndarray)
    assert text_np.shape == (1920, 1080, 4)
    # Ensure there are non-transparent text pixels rendered
    assert np.any(text_np[:, :, 3] > 0)

def test_generate_reveal_video(sample_transparent_image):
    """
    Verifies that MoviePy video synthesis produces a non-empty MP4 file.
    """
    silhouette = generate_black_silhouette(sample_transparent_image)
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        out_path = Path(tmp.name)

    try:
        res = generate_reveal_video(
            transparent_img=sample_transparent_image,
            silhouette_img=silhouette,
            person_name="Charizard",
            output_path=out_path
        )
        assert res.exists()
        assert res.stat().st_size > 1000
    finally:
        if out_path.exists():
            out_path.unlink()
