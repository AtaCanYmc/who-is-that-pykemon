import io
from PIL import Image, ImageOps
from rembg import remove, new_session

# u2net modelini hafızada hazır tutalım
_session = None

def get_session():
    global _session
    if _session is None:
        _session = new_session("u2net")
    return _session

def process_and_remove_background(image_bytes: bytes) -> Image.Image:
    """
    Görselin arka planını siler ve saydam RGBA formatında döndürür.
    EXIF rotasyonunu otomatik olarak düzeltir.
    """
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)
    img = img.convert("RGBA")
    
    # rembg arka plan temizleme
    session = get_session()
    result = remove(img, session=session)
    return result

def generate_black_silhouette(transparent_image: Image.Image) -> Image.Image:
    """
    Saydam arka planlı görseli alfa kanalını koruyarak
    tamamen saf siyaha (#000000) dönüştürür.
    """
    if transparent_image.mode != "RGBA":
        transparent_image = transparent_image.convert("RGBA")
    
    # Alfa kanalını ayır
    r, g, b, alpha = transparent_image.split()
    
    # Saf siyah RGBA görseli oluştur ve alfa kanalını aktar
    silhouette = Image.new("RGBA", transparent_image.size, (0, 0, 0, 255))
    silhouette.putalpha(alpha)
    return silhouette
