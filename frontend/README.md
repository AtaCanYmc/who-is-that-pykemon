[← Back to Root Repository](../README.md)

# Frontend PWA · Who is That Pykemon

Progressive Web Application built with React 18, TypeScript, Vite, and Tailwind CSS. Provides client-side image capture, live SVG badge previews, audio effects via the Web Audio API, internationalization, and video sharing through the Web Share API.

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Component Structure](#component-structure)
- [Environment Configuration](#environment-configuration)
- [Build & Verification](#build--verification)

## Architecture

The frontend interfaces with the backend asynchronous job queue:

- **State Management & Workflow (`src/App.tsx`)**: Manages photo upload/camera capture, live badge configuration, asynchronous job submission, and video download polling.
- **Live Badge Preview (`src/components/LiveBadgePreview.tsx`)**: Renders real-time SVG text overlays with selected fonts and theme color palettes.
- **Audio Synthesizer (`src/utils/soundEffects.ts`)**: Emits procedural 8-bit retro sound effects using the native browser Web Audio API without external audio files.
- **PWA Service Worker (`vite.config.ts`)**: Caches static assets for offline responsiveness and enables home-screen installation.

```text
frontend/
├── src/
│   ├── components/
│   │   ├── BottomActionBar.tsx   # Action controls (generate, share, download)
│   │   ├── ImageCropper.tsx      # Client-side image cropping and adjustment
│   │   ├── LanguageSelector.tsx  # Locale selector (English, Turkish)
│   │   ├── LiveBadgePreview.tsx  # Dynamic SVG badge renderer
│   │   ├── ProgressStepper.tsx   # Multi-stage generation progress indicator
│   │   └── ThemeSelector.tsx     # Theme and font style configuration
│   ├── i18n/
│   │   └── translations.ts       # Localized interface strings
│   ├── utils/
│   │   └── soundEffects.ts       # Web Audio API retro chiptune effects
│   ├── App.tsx                   # Main application controller
│   ├── index.css                 # Tailwind directives and custom font imports
│   └── main.tsx                  # React DOM mount point
├── public/                       # PWA icons, manifest, and static graphics
├── nginx.conf                    # Production Nginx reverse-proxy configuration
├── Dockerfile                    # Multi-stage production container build
├── package.json                  # Dependencies and build scripts
└── vite.config.ts                # Vite and PWA plugin configuration
```

## Prerequisites

- Node.js 20 or later
- npm 10 or later

## Quick Start

```bash
# 1. Install dependencies
npm ci

# 2. Configure environment
cp .env.example .env

# 3. Start development server
npm run dev
```

The application runs at `http://localhost:5173`.

## Environment Configuration

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | string | `http://localhost:8000` | Backend API base URL for job submission and video streaming. |

## Build & Verification

```bash
# Run TypeScript type check
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
