# Who is That Pykemon? ⚡️

A mobile-first Progressive Web App (PWA) and FastAPI backend that transforms portrait photos into nostalgic **"Who's that Pokémon?"** reveal meme videos using AI background removal and video synthesis.

---

## 🏗️ Architecture & Project Structure

```text
who-is-that-pykemon/
├── backend/                  # Python 3 & FastAPI & MoviePy & rembg
│   ├── app/
│   │   ├── main.py           # REST API endpoints & background tasks
│   │   ├── config.py         # Global configuration & environment settings
│   │   ├── services/
│   │   │   ├── image_processor.py  # rembg background removal + pure black silhouette (#000000)
│   │   │   └── video_generator.py  # MoviePy 9:16 vertical video composition & audio mixing
│   │   └── utils/
│   │       └── assets_init.py      # Procedural fallback Pokémon background & chiptune synthesizer
│   ├── assets/               # Background images, sound effects, and custom fonts
│   ├── requirements.txt      # Python dependencies
│   └── tests/
│       └── test_pipeline.py  # End-to-end processing pipeline test
│
├── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS + PWA
│   ├── src/
│   │   ├── App.tsx           # Photo upload/camera, name input, video player & Web Share
│   │   ├── index.css         # Tailwind & custom Pokémon styling
│   │   └── main.tsx          # Application entry point
│   ├── public/               # PWA icons (Pokéball SVG) & manifest
│   ├── vite.config.ts        # VitePWA configuration
│   └── package.json          # Frontend dependencies
│
├── .gitignore                # Git ignore configuration
└── README.md                 # Project documentation
```

---

## ✨ Features

- **AI-Powered Background Removal:** Utilizes `rembg` (`u2net`) to isolate subjects and preserve edge/hair details.
- **Pure Black Silhouette Conversion:** Converts isolated RGBA images to pure `#000000` silhouettes while preserving alpha transparency.
- **Synchronized Video & Audio Composition:**
  - **Stage 1 (0.0s – 3.5s):** Mysterious black silhouette with teaser audio.
  - **Stage 2 (3.5s – 7.0s):** Full-color reveal transition with custom Pokémon-styled *"IT'S [NAME]!"* badge and victory fanfare.
  - **Format:** 1080x1920 (9:16 vertical format) H.264 / AAC MP4 optimized for mobile playback (TikTok, Instagram Reels, YouTube Shorts).
- **Progressive Web App (PWA):**
  - Installable on iOS, Android, macOS, and Windows ("Add to Home Screen").
  - Native Web Share API integration for direct video sharing to social media apps.
  - One-click video download.
- **Procedural Fallback Generator:** Automatically synthesizes standard Pokémon ray-burst backgrounds and 8-bit chiptune jingles if custom copyrighted assets are not provided.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- FFmpeg installed on your system (`brew install ffmpeg` on macOS, or `apt install ffmpeg` on Ubuntu)

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Run pipeline test
python tests/test_pipeline.py

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- **Backend API:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`

---

### 2. Frontend Setup (PWA)

```bash
# In a separate terminal, navigate to the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```

- **Frontend Application:** `http://localhost:5173`

---

## 📡 API Reference

### `POST /generate-video`

Generates an MP4 reveal video from an uploaded portrait image and optional person name.

#### Request (Multipart Form Data):
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File (image/*) | Yes | Image file (PNG, JPEG, WEBP) |
| `name` | string | No | Name to display during the reveal (Default: `Someone`) |

#### Response:
- **Content-Type:** `video/mp4`
- **Content-Disposition:** `attachment; filename="whos_that_[name].mp4"`

---

## 🛠️ Environment Variables & Customization

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the FastAPI backend in Frontend | `http://localhost:8000` |
| `TEMP_DIR` | Directory for temporary video rendering | `/tmp/who_is_that_pykemon` |

### Customizing Assets:
You can replace the procedural assets by placing files into `backend/assets/`:
- `backend/assets/background.png`: Custom 1080x1920 transition background.
- `backend/assets/whos_that_pokemon.mp3`: Custom theme audio track.
- `backend/assets/fonts/Pokemon-Solid.ttf`: Custom font file.

---

## 📄 License

MIT License. Created for meme and entertainment purposes.
