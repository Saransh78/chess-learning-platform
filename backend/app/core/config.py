import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

DEFAULT_CORS_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
)


def _cors_origins() -> tuple[str, ...]:
    configured = os.environ.get("CORS_ORIGINS")
    if not configured:
        return DEFAULT_CORS_ORIGINS

    origins = tuple(
        origin.strip().rstrip("/")
        for origin in configured.split(",")
        if origin.strip()
    )
    return origins or DEFAULT_CORS_ORIGINS


@dataclass(frozen=True)
class Settings:
    STOCKFISH_PATH: str = "stockfish"
    CORS_ORIGINS: tuple[str, ...] = DEFAULT_CORS_ORIGINS
    SUPABASE_URL: str = ""


settings = Settings(
    STOCKFISH_PATH=os.environ.get("STOCKFISH_PATH", "stockfish"),
    CORS_ORIGINS=_cors_origins(),
    SUPABASE_URL=os.environ.get("SUPABASE_URL", ""),
)
