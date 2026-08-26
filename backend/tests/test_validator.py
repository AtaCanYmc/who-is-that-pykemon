import io
import sys
from pathlib import Path

import pytest
from fastapi import HTTPException, UploadFile

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.utils.validator import validate_uploaded_image


def test_validate_valid_image(sample_image_bytes):
    mock_file = UploadFile(
        file=io.BytesIO(sample_image_bytes),
        filename="test.png",
        headers={"content-type": "image/png"},
    )
    img, fmt = validate_uploaded_image(mock_file, sample_image_bytes)
    assert img is not None
    assert fmt.upper() in ["PNG", "JPEG"]


def test_validate_empty_file():
    mock_file = UploadFile(
        file=io.BytesIO(b""),
        filename="empty.png",
        headers={"content-type": "image/png"},
    )
    with pytest.raises(HTTPException) as exc:
        validate_uploaded_image(mock_file, b"")
    assert exc.value.status_code == 400


def test_validate_invalid_mime():
    mock_file = UploadFile(
        file=io.BytesIO(b"%PDF-1.4..."),
        filename="doc.pdf",
        headers={"content-type": "application/pdf"},
    )
    with pytest.raises(HTTPException) as exc:
        validate_uploaded_image(mock_file, b"%PDF-1.4...")
    assert exc.value.status_code == 400


def test_validate_oversized_file():
    large_bytes = b"0" * (16 * 1024 * 1024)  # 16 MB
    mock_file = UploadFile(
        file=io.BytesIO(large_bytes),
        filename="large.png",
        headers={"content-type": "image/png"},
    )
    with pytest.raises(HTTPException) as exc:
        validate_uploaded_image(mock_file, large_bytes)
    assert exc.value.status_code == 413
