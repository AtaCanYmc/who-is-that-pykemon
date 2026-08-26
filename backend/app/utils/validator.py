import io

from fastapi import HTTPException, UploadFile
from PIL import Image

from app.config import ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES


def validate_uploaded_image(file: UploadFile, image_bytes: bytes) -> tuple[Image.Image, str]:
    """
    Validates uploaded image file against size limits, allowed MIME types,
    and checks file integrity using Pillow.

    Args:
        file (UploadFile): The uploaded FastAPI file object.
        image_bytes (bytes): The raw file bytes.

    Returns:
        Tuple[Image.Image, str]: Validated PIL Image and detected format.

    Raises:
        HTTPException: If file violates size, MIME type, or is corrupted.
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

    # 3. Verify image integrity with Pillow
    try:
        buf = io.BytesIO(image_bytes)
        img = Image.open(buf)
        img.verify()

        # Re-open image since verify() invalidates the file pointer
        buf.seek(0)
        img = Image.open(buf)
        detected_format = img.format or "PNG"
        return img, detected_format
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Corrupted or unreadable image file: {e!s}"
        ) from e
