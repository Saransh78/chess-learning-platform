import io

import chess.pgn
from fastapi import APIRouter, File, HTTPException, UploadFile
from typing import Annotated

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

    stream = io.StringIO(content)
    games_detected = 0
    while chess.pgn.read_game(stream) is not None:
        games_detected += 1

    return {
        "filename": filename,
        "games_detected": games_detected,
        "file_size_bytes": len(raw),
    }
