import io
import numpy as np
from PIL import Image, ImageOps
from rembg import remove, new_session

# Global cache for the rembg u2net session
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

def enhance_and_solidify_alpha(
    img: Image.Image,
    bg_threshold: int = 30,
    fg_threshold: int = 150
) -> Image.Image:
    """
    Cleans up background artifacts and solidifies semi-transparent foreground pixels:
    - Clamps low-alpha background haze (alpha < bg_threshold) to 0 (pure transparent).
    - Boosts semi-transparent body/clothing pixels (alpha >= bg_threshold) towards 255.
    - Preserves smooth edge anti-aliasing without translucent/ghostly body appearance.

    Args:
        img (Image.Image): RGBA Image with soft rembg alpha.
        bg_threshold (int, optional): Cutoff threshold for background noise. Defaults to 30.
        fg_threshold (int, optional): Threshold above which foreground is 100% solid. Defaults to 150.

    Returns:
        Image.Image: Cleaned and solidified RGBA Image.
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    r, g, b, alpha = img.split()
    alpha_np = np.array(alpha, dtype=np.float32)

    # 1. Clean background noise
    clean_alpha = np.where(alpha_np < bg_threshold, 0.0, alpha_np)

    # 2. Smoothly stretch foreground alpha to solid 255
    ramp = np.clip((clean_alpha - bg_threshold) / max(1.0, float(fg_threshold - bg_threshold)), 0.0, 1.0)
    # Smooth Hermite / S-curve interpolation: 3*x^2 - 2*x^3
    solid_alpha = np.where(clean_alpha > 0, ramp * ramp * (3.0 - 2.0 * ramp) * 255.0, 0.0)
    solid_alpha = np.clip(solid_alpha, 0, 255).astype(np.uint8)

    clean_alpha_pil = Image.fromarray(solid_alpha, mode="L")
    cleaned_img = Image.merge("RGBA", (r, g, b, clean_alpha_pil))
    return cleaned_img

def process_and_remove_background(image_bytes: bytes) -> Image.Image:
    """
    Removes the background from input image bytes using rembg (u2net model),
    then applies post-processing mask enhancement to eliminate ghosting,
    hazy borders, and semi-transparency artifacts.

    Args:
        image_bytes (bytes): Raw bytes of the uploaded image file.

    Returns:
        Image.Image: Crisp, vibrant transparent RGBA PIL Image.
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGBA")
    
    # 1. Execute AI background removal with morphological post-processing
    session = get_session()
    raw_result = remove(
        img,
        session=session,
        post_process_mask=True
    )

    # 2. Enhance alpha clarity and solidify subject pixels
    clean_result = enhance_and_solidify_alpha(raw_result, bg_threshold=30, fg_threshold=150)
    return clean_result

def generate_black_silhouette(transparent_image: Image.Image) -> Image.Image:
    """
    Converts a transparent RGBA image into a crisp, solid black silhouette (#000000)
    with clean anti-aliasing, avoiding faint or washed-out transparency shadows.

    Args:
        transparent_image (Image.Image): Transparent RGBA PIL Image.

    Returns:
        Image.Image: Solid black RGBA silhouette with clean edge mask.
    """
    if transparent_image.mode != "RGBA":
        transparent_image = transparent_image.convert("RGBA")
    
    # Extract alpha channel
    r, g, b, alpha = transparent_image.split()
    alpha_np = np.array(alpha, dtype=np.float32)

    # Solidify silhouette mask so it's a bold, non-transparent Pokémon teaser
    sil_alpha = np.where(alpha_np > 25, np.clip(alpha_np * 1.5, 0, 255), 0).astype(np.uint8)
    sil_alpha_pil = Image.fromarray(sil_alpha, mode="L")

    # Create solid black canvas with matching size and apply solidified alpha
    silhouette = Image.new("RGBA", transparent_image.size, (0, 0, 0, 255))
    silhouette.putalpha(sil_alpha_pil)
    return silhouette
