# Project Roadmap

This document outlines completed milestones and future technical development goals for Who is That Pykemon.

## Completed Milestones

### v1.0.0 · Core Synthesis Engine
- FastAPI service with synchronous `/generate-video` endpoint.
- Automated background removal with `rembg` u2net model.
- Jet-black silhouette masking preserving alpha transparency.
- Procedural rayburst background and 8-bit chiptune audio generator fallback.
- React Vite PWA with camera capture, photo upload, and Web Share API.
- Multi-arch Docker containers and Docker Compose setup.

### v1.1.0 · Asynchronous Task Queue & Themes
- In-memory asynchronous job manager (`/api/jobs`) with status polling.
- Theme presets: Kanto Classic, Johto Gold, and Cyber Neon.
- Custom Pokémon font selection: Solid, Hollow, Arcade, and Sans.
- Automatic disk garbage collection worker for temporary video files.

### v1.2.0 · Internationalization & Resilience
- Multi-language interface support (English, Turkish) with dynamic font loading.
- Improved backend network failure handling and localized error notices.
- Web Audio API integration for client-side retro sound effects.

### v1.3.0 · Turkish Character Encoding
- RFC 5987 compliant UTF-8 and ASCII sanitized `Content-Disposition` headers.
- Cross-platform support for special Unicode characters during file download.

### v1.4.0 · Live Badge Preview & Typography
- Dynamic SVG live badge preview component with real-time text layout.
- Expanded typography styling with custom font families.
- Locale-aware uppercase text input conversion.

## Future Milestones

### v1.5.0 · Performance & Export Options
- Hardware-accelerated ONNX inference using ONNX Runtime execution providers (CUDA, CoreML, DirectML).
- Multi-format video export presets: 16:9 widescreen (1920x1080) and 9:16 vertical (1080x1920) for mobile social platforms.
- Custom user audio upload option to replace standard reveal jingles.

### v2.0.0 · Distributed Architecture
- Optional Redis task broker with Celery/RQ for horizontally scalable deployments.
- S3-compatible object storage backend for rendered video artifacts.
- Client-side WebAssembly background removal for zero-server silhouette previews.
