import io
import logging

from fastapi import HTTPException, UploadFile
from PIL import Image

from app.config import (
    ALLOWED_MIME_TYPES,
    MAX_IMAGE_HEIGHT,
    MAX_IMAGE_PIXELS,
    MAX_IMAGE_WIDTH,
    MAX_UPLOAD_SIZE_BYTES,
)

logger = logging.getLogger("who-is-that-pykemon.validator")

# Protect against decompression bomb attacks
Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS


def validate_uploaded_image(file: UploadFile, image_bytes: bytes) -> tuple[Image.Image, str]:
    """
    Validates uploaded image file against size limits, allowed MIME types,
    image resolution constraints, and checks file integrity using Pillow.

    Args:
        file (UploadFile): The uploaded FastAPI file object.
        image_bytes (bytes): The raw file bytes.

    Returns:
        Tuple[Image.Image, str]: Validated PIL Image and detected format.

    Raises:
        HTTPException: If file violates size, MIME type, dimensions, or is corrupted.
    """
    # 1. Check file size
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(image_bytes) > MAX_UPLOAD_SIZE_BYTES:
        max_mb = MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File size exceeds maximum allowed limit of {max_mb} MB.",
        )

    # 2. Check MIME type
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{content_type}'. Allowed formats: PNG, JPEG, WEBP.",
        )

    # 3. Verify image integrity and dimensions with Pillow
    try:
        buf = io.BytesIO(image_bytes)
        img = Image.open(buf)
        img.verify()

        # Re-open image since verify() invalidates the file pointer
        buf.seek(0)
        img = Image.open(buf)

        # 4. Check dimension limits & decompression bomb protection
        width, height = img.size
        if width > MAX_IMAGE_WIDTH or height > MAX_IMAGE_HEIGHT:
            raise HTTPException(
                status_code=400,
                detail=f"Image dimensions ({width}x{height}) exceed maximum allowed limit of {MAX_IMAGE_WIDTH}x{MAX_IMAGE_HEIGHT}px.",
            )

        if (width * height) > MAX_IMAGE_PIXELS:
            raise HTTPException(
                status_code=400,
                detail="Image exceeds maximum allowable pixel density.",
            )

        detected_format = img.format or "PNG"
        return img, detected_format
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Image integrity validation failed: {e}")
        raise HTTPException(
            status_code=400, detail="Corrupted, unreadable, or invalid image file."
        ) from e
