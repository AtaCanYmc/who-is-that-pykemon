# ==========================================
# Backend Dockerfile - Who is That Pykemon
# ==========================================
FROM python:3.14-slim

# Prevent Python from writing .pyc and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV U2NET_HOME=/root/.u2net

# Install system dependencies including FFmpeg and required media libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download the u2net model during build to avoid runtime delays
RUN python -c "from rembg import new_session; new_session('u2net')"

# Copy backend application code & assets
COPY . .

# Create non-root user and ensure proper permissions
RUN groupadd -r appuser && useradd -r -g appuser -d /home/appuser -m appuser && \
    mkdir -p /home/appuser/.u2net /tmp/who_is_that_pykemon && \
    cp -r /root/.u2net/* /home/appuser/.u2net/ 2>/dev/null || true && \
    chown -R appuser:appuser /home/appuser /app /tmp/who_is_that_pykemon

ENV U2NET_HOME=/home/appuser/.u2net

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
