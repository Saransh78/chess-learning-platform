import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    STOCKFISH_PATH: str = "stockfish"


settings = Settings(
    STOCKFISH_PATH=os.environ.get("STOCKFISH_PATH", "stockfish"),
)
