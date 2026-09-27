# BoardSense API — production image for Render.
# Build context is the backend/ directory (set the Render service
# Root Directory to `backend/`), so all COPY paths are relative to it.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Stockfish engine binary (lands at /usr/games/stockfish, which the app
# probes via its resolver). No git needed: no VCS dependencies.
RUN apt-get update \
    && apt-get install -y --no-install-recommends stockfish \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Trained artifacts in models/ are required at runtime — do not exclude.
COPY app/ ./app/
COPY ml/ ./ml/
COPY models/ ./models/

EXPOSE 8000

# Render injects $PORT at runtime; default keeps local `docker run` working.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
