import os
import uuid
import logging
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import TEMP_DIR, ASSETS_DIR
from app.utils.assets_init import ensure_assets
from app.services.image_processor import process_and_remove_background, generate_black_silhouette
from app.services.video_generator import generate_reveal_video

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("who-is-that-pykemon")

app = FastAPI(
    title="Who is That Pykemon API",
    description="Generate authentic 'Who's that Pokémon?' meme videos from portrait photos",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Uygulama açılırken varsayılan varlıkları ve dizinleri hazırla."""
    ensure_assets(ASSETS_DIR)
    logger.info("Assets & directory initialization complete.")

def remove_temp_file(file_path: str):
    """Geçici videoyu istemciye ilettikten sonra sunucudan temizler."""
    try:
        p = Path(file_path)
        if p.exists():
            p.unlink()
            logger.info(f"Temporary file deleted: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {file_path}: {e}")

@app.get("/health")
def health():
    return {"status": "ok", "app": "Who is That Pykemon"}

@app.post("/generate-video")
async def generate_video_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Yüklenecek insan / karakter fotoğrafı"),
    name: str = Form("Someone", description="Açılışta gösterilecek isim")
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Geçersiz dosya formatı. Lütfen PNG, JPG veya WEBP formatında bir görsel yükleyin."
        )

    clean_name = name.strip() or "Someone"

    try:
        # 1. Fotoğrafı Oku
        image_bytes = await file.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Boş dosya yüklendi.")

        logger.info(f"Processing photo for '{clean_name}' (Size: {len(image_bytes)} bytes)...")

        # 2. Arka Planı Temizle (rembg)
        transparent_img = process_and_remove_background(image_bytes)

        # 3. Saf Siyah Silueti Oluştur
        silhouette_img = generate_black_silhouette(transparent_img)

        # 4. Video Render Et
        video_id = uuid.uuid4().hex
        output_video_path = TEMP_DIR / f"pykemon_{video_id}.mp4"

        generate_reveal_video(
            transparent_img=transparent_img,
            silhouette_img=silhouette_img,
            person_name=clean_name,
            output_path=output_video_path
        )

        logger.info(f"Video rendered successfully: {output_video_path}")

        # 5. İstemci indirdikten sonra geçici dosyayı sil
        background_tasks.add_task(remove_temp_file, str(output_video_path))

        safe_filename = f"whos_that_{clean_name.lower().replace(' ', '_')}.mp4"
        return FileResponse(
            path=str(output_video_path),
            media_type="video/mp4",
            filename=safe_filename,
            headers={
                "Access-Control-Expose-Headers": "Content-Disposition",
                "Content-Disposition": f'attachment; filename="{safe_filename}"'
            }
        )

    except Exception as e:
        logger.error(f"Error during video generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Video oluşturulamadı: {str(e)}")
