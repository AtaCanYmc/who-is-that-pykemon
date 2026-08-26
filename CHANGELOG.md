# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-26

### Added
- **FastAPI Backend Pipeline**:
  - AI-powered background removal using `rembg` (`u2net` ONNX session).
  - Silhouette generation with pure `#000000` fill and alpha channel preservation.
  - MoviePy 9:16 vertical MP4 video synthesis with Pokémon-style typography and audio synchronization.
  - Procedural ray-burst background generator and 8-bit chiptune audio synthesizer for standalone fallback.
  - Background task for temporary video file cleanup after client download.
- **Frontend PWA (Progressive Web App)**:
  - React 18, Vite, TypeScript, and Tailwind CSS.
  - Responsive mobile-first UI with photo upload, camera trigger, and drag-and-drop.
  - Native Web Share API integration and direct `.mp4` file download.
  - PWA support with `manifest.webmanifest`, Pokéball SVG icons, and `vite-plugin-pwa` service worker.
- **Testing & Quality Assurance**:
  - Comprehensive Pytest test suite covering image processing, video generation, and REST API endpoints.
  - TypeScript strict type checking.
- **DevOps & Containerization**:
  - Multi-stage Dockerfile for frontend (Node.js build + Nginx Alpine) and backend (Python 3.11 slim + FFmpeg + pre-cached AI model).
  - Docker Compose orchestration with health checks and volume persistence.
  - Automated GitHub Actions CI pipeline.
- **Documentation**:
  - English documentation, README hero banner, LICENSE (MIT), Contributing guide, Code of Conduct, and Security policy.
