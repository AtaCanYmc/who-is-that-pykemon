# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0](https://github.com/AtaCanYmc/who-is-that-pykemon/compare/v1.1.0...v1.2.0) (2026-08-26)


### Features

* improve API URL handling and add backend connection error translations ([9d6a521](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/9d6a5211019968fdf6facc53d1084845ac5d8e96))


### Bug Fixes

* ensure husky script runs without failure during preparation ([bc84ece](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/bc84ece2a0f8464fdd36525a782776fbbccd0596))

## [1.1.0](https://github.com/AtaCanYmc/who-is-that-pykemon/compare/v1.0.0...v1.1.0) (2026-08-26)


### Features

* add end-to-end processing workflow diagram to README ([7b9638d](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/7b9638dd6bd9b5e8a1ae92f609a0b6a0e48c3f2d))
* add GitHub Actions workflow for building and publishing Docker containers to GHCR ([ae4b24f](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/ae4b24f463d4e36ad2a21a07e04c90b6264d9672))
* add language selector component and implement translations for UI elements ([852af9e](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/852af9e001ce35de9abf2a22f9fa67d478fc280b))
* add pre-commit and commitlint configuration for code quality enforcement ([42e72ea](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/42e72ea94142bfcd73262bb9b319a37500cdce92))
* add release management configuration and update Node.js version in CI ([1842434](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/18424348c139c7221aefb616a74b3ae5683c2894))
* add Vercel deployment instructions and configuration for frontend PWA ([d97303e](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/d97303eed24dcf731bfd87547f0c287e0dda6faf))
* add web app manifest and enhance image processing for improved background removal ([2281e3f](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/2281e3f2abfedbe157a41bdd5606a9374e20a906))
* enhance app layout and functionality with responsive design, keyboard shortcuts, and improved action bar ([29ace94](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/29ace945b5f464e3cff72e0e7d425dc60ebdac50))
* enhance app with live badge preview, sound effects, and bottom action bar ([8c22238](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/8c222385d96e353c31c4a98ed3d1dc6ccf0daebf))
* enhance image processing features with cropping tool and theme selection ([2640e91](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/2640e91226e385ca055d7761f07aed69d47f5eb6))
* implement asynchronous job manager and background cleanup for video generation ([dc8fbf6](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/dc8fbf6c37195a45664d8d303fd7c4c9e0432a59))


### Bug Fixes

* adjust silhouette and total duration settings for improved video output timing ([91453fe](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/91453fe5d210e8b882c5b23779239fc3ecb0c9dc))
* adjust video generation settings for 16:9 aspect ratio and improve text positioning in video output ([7acaca7](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/7acaca7b617e2252c6ae551e5c317fb61be97541))
* update docker-compose to use local backend assets directory for improved development workflow ([461780c](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/461780ca04a6ab295fe5c95a1ad332c2808670a2))
* update nginx configuration to include site.webmanifest in caching rules ([45bc87d](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/45bc87ddf67d8c6598894d43179d5884e226e26d))


### Documentation

* update README with enhanced project description, badges, and deployment instructions ([e8660ae](https://github.com/AtaCanYmc/who-is-that-pykemon/commit/e8660aede76565421f96d7d1ba656b79e14d8b06))

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
