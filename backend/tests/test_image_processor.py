import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.image_processor import (
    generate_black_silhouette,
    process_and_remove_background,
)


def test_process_and_remove_background(sample_image_bytes):
    """
    Verifies that background removal produces a valid RGBA image with unchanged dimensions.
    """
    result = process_and_remove_background(sample_image_bytes)
    assert isinstance(result, Image.Image)
    assert result.mode == "RGBA"
    assert result.size == (300, 300)


def test_generate_black_silhouette(sample_transparent_image):
    """
    Verifies that all non-transparent pixels in the silhouette have exact RGB values of (0, 0, 0).
    """
    silhouette = generate_black_silhouette(sample_transparent_image)
    assert silhouette.mode == "RGBA"
    assert silhouette.size == sample_transparent_image.size

    arr = np.array(silhouette)
    # Check pixels where alpha > 0
    opaque_pixels = arr[arr[:, :, 3] > 0]
    assert opaque_pixels.shape[0] > 0
    # Ensure RGB channels are all zero
    assert np.all(opaque_pixels[:, :3] == 0)
