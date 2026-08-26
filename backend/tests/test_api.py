import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend root is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """
    Verifies that the /health endpoint returns 200 OK and valid status json.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Who is That Pykemon" in data["app"]

def test_generate_video_invalid_file_type():
    """
    Verifies that uploading a non-image file returns a 400 Bad Request error.
    """
    response = client.post(
        "/generate-video",
        files={"file": ("test.txt", b"plain text content", "text/plain")},
        data={"name": "Test"}
    )
    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]

def test_generate_video_success(sample_image_bytes):
    """
    Verifies that uploading a valid image returns 200 OK and a streaming MP4 video file.
    """
    response = client.post(
        "/generate-video",
        files={"file": ("pikachu.png", sample_image_bytes, "image/png")},
        data={"name": "Pikachu"}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"
    assert "whos_that_pikachu.mp4" in response.headers.get("content-disposition", "")
    assert len(response.content) > 1000
