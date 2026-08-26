import math
import wave
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

def generate_default_pokemon_background(output_path: Path, width: int = 1080, height: int = 1920) -> Path:
    """
    Programmatically generates the classic Pokémon ray-burst transition background.

    Args:
        output_path (Path): File destination for the generated PNG background.
        width (int, optional): Image width in pixels. Defaults to 1080.
        height (int, optional): Image height in pixels. Defaults to 1920.

    Returns:
        Path: The path to the saved background image.
    """
    # Create base image with Pokémon blue color
    img = Image.new("RGBA", (width, height), (42, 117, 187, 255))
    draw = ImageDraw.Draw(img)

    center_x, center_y = width // 2, int(height * 0.45)
    max_radius = int(math.hypot(width, height))
    num_rays = 24
    angle_step = (2 * math.pi) / num_rays

    # Draw radial ray burst patterns
    for i in range(0, num_rays, 2):
        angle1 = i * angle_step
        angle2 = (i + 1) * angle_step
        
        p1 = (center_x, center_y)
        p2 = (center_x + max_radius * math.cos(angle1), center_y + max_radius * math.sin(angle1))
        p3 = (center_x + max_radius * math.cos(angle2), center_y + max_radius * math.sin(angle2))
        
        draw.polygon([p1, p2, p3], fill=(59, 130, 246, 255)) # Light blue ray

    # Draw center glowing halo circle
    halo_radius = int(width * 0.45)
    draw.ellipse(
        [center_x - halo_radius, center_y - halo_radius, center_x + halo_radius, center_y + halo_radius],
        fill=(255, 203, 5, 120) # Semi-transparent Pokémon yellow
    )
    
    # Decorative bottom banner and divider
    draw.rectangle([0, int(height * 0.78), width, height], fill=(238, 21, 21, 240)) # Red bar
    draw.rectangle([0, int(height * 0.78), width, int(height * 0.785)], fill=(255, 255, 255, 255)) # White divider

    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG")
    return output_path

def generate_default_pokemon_sound(output_path: Path, duration: float = 7.0, sample_rate: int = 44100) -> Path:
    """
    Synthesizes an 8-bit chiptune style 'Who's that Pokémon?' teaser and fanfare audio jingle.

    Args:
        output_path (Path): File destination for the generated WAV audio.
        duration (float, optional): Total duration in seconds. Defaults to 7.0.
        sample_rate (int, optional): Audio sample rate in Hz. Defaults to 44100.

    Returns:
        Path: The path to the saved audio file.
    """
    total_samples = int(duration * sample_rate)
    audio = np.zeros(total_samples)

    # Note sequence definition: (start_time_in_seconds, frequency_in_hz, duration_in_seconds)
    # 0.0s - 3.5s: Teaser question melody
    # 3.5s - 7.0s: Reveal victory fanfare
    notes = [
        (0.1, 523.25, 0.25),  # C5
        (0.4, 659.25, 0.25),  # E5
        (0.7, 783.99, 0.3),   # G5
        (1.1, 1046.50, 0.6),  # C6 (Sustained)
        (2.0, 783.99, 0.2),   # G5
        (2.3, 1046.50, 0.5),  # C6
        # Reveal fanfare (post 3.5s)
        (3.5, 659.25, 0.2),   # E5
        (3.75, 783.99, 0.2),  # G5
        (4.0, 1046.50, 0.2),  # C6
        (4.25, 1318.51, 0.8), # E6 (Climax)
        (5.2, 1046.50, 0.6),  # C6
    ]

    for start_time, freq, dur in notes:
        start_idx = int(start_time * sample_rate)
        note_samples = int(dur * sample_rate)
        if start_idx + note_samples <= total_samples:
            note_t = np.linspace(0, dur, note_samples, endpoint=False)
            # Composite waveform: square wave + sine wave with exponential decay envelope
            envelope = np.exp(-3 * note_t / dur)
            square_wave = np.sign(np.sin(2 * np.pi * freq * note_t)) * 0.4
            sine_wave = np.sin(2 * np.pi * freq * note_t) * 0.6
            wave_val = (square_wave + sine_wave) * envelope * 0.5
            audio[start_idx : start_idx + note_samples] += wave_val

    # Normalize audio levels and convert to 16-bit PCM
    max_val = np.max(np.abs(audio))
    if max_val > 0:
        audio = (audio / max_val) * 0.85
    
    audio_int16 = (audio * 32767).astype(np.int16)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(output_path), "w") as wav_file:
        wav_file.setnchannels(1) # Mono
        wav_file.setsampwidth(2) # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_int16.tobytes())

    return output_path

def ensure_assets(assets_dir: Path) -> None:
    """
    Checks for required audio and visual assets, generating procedural fallbacks if missing.

    Args:
        assets_dir (Path): The assets directory containing images and sounds.
    """
    bg_file = assets_dir / "background.png"
    if not bg_file.exists():
        generate_default_pokemon_background(bg_file)

    sound_file = assets_dir / "whos_that_pokemon.wav"
    if not sound_file.exists() and not (assets_dir / "whos_that_pokemon.mp3").exists():
        generate_default_pokemon_sound(sound_file)
