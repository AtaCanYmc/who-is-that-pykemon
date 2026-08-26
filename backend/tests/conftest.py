import io
import pytest
from PIL import Image, ImageDraw

@pytest.fixture
def sample_image_bytes() -> bytes:
    """
    Generates a 300x300 PNG image with a red circle on white background for testing.

    Returns:
        bytes: Raw PNG image bytes.
    """
    img = Image.new("RGB", (300, 300), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 250, 250], fill=(238, 21, 21))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

@pytest.fixture
def sample_transparent_image() -> Image.Image:
    """
    Generates a 300x300 RGBA image with a red circle on transparent canvas for testing.

    Returns:
        Image.Image: Transparent RGBA PIL Image.
    """
    img = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.ellipse([50, 50, 250, 250], fill=(238, 21, 21, 255))
    return img
