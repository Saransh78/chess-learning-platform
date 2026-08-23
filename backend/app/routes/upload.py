from fastapi import APIRouter, File, HTTPException, UploadFile
from typing import Annotated

from app.services.upload_service import extract_games

router = APIRouter(prefix="/api", tags=["uploads"])


@router.post("/upload")
async def upload_pgn(file: Annotated[UploadFile, File()]):
    filename = file.filename or ""

    if not filename.lower().endswith(".pgn"):
        raise HTTPException(status_code=400, detail="Only .pgn files are accepted")

    raw = await file.read()

    try:
        content = raw.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not valid UTF-8 text")

    games = extract_games(content)

    return {
        "filename": filename,
        "games_detected": len(games),
        "file_size_bytes": len(raw),
        "games": games,
    }
