import io
from PIL import Image, ImageOps
from rembg import remove, new_session

# Global cache for the rembg u2net session to avoid re-initialization latency
_session = None

def get_session():
    """
    Retrieves or initializes the global rembg u2net ONNX session.

    Returns:
        rembg.Session: Pre-loaded rembg session instance.
    """
    global _session
    if _session is None:
        _session = new_session("u2net")
    return _session

def process_and_remove_background(image_bytes: bytes) -> Image.Image:
    """
    Removes the background from input image bytes using rembg (u2net model).
    Automatically fixes EXIF orientation to ensure portrait orientation is preserved.

    Args:
        image_bytes (bytes): Raw bytes of the uploaded image file.

    Returns:
        Image.Image: Transparent RGBA PIL Image.
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGBA")
    
    # Execute AI background removal
    session = get_session()
    result = remove(img, session=session)
    return result

def generate_black_silhouette(transparent_image: Image.Image) -> Image.Image:
    """
    Converts a transparent RGBA image into a solid black silhouette (#000000)
    while strictly preserving the alpha transparency channel.

    Args:
        transparent_image (Image.Image): Transparent RGBA PIL Image.

    Returns:
        Image.Image: Solid black RGBA silhouette with original alpha channel.
    """
    if transparent_image.mode != "RGBA":
        transparent_image = transparent_image.convert("RGBA")
    
    # Extract alpha channel
    r, g, b, alpha = transparent_image.split()
    
    # Create pure black canvas with matching size and re-apply alpha mask
    silhouette = Image.new("RGBA", transparent_image.size, (0, 0, 0, 255))
    silhouette.putalpha(alpha)
    return silhouette
