from fastapi import APIRouter, HTTPException
from app.schemas.pgn import PGNRequest
from app.services.pgn_service import parse_pgn

router = APIRouter()


@router.post("/api/pgn")
def upload_pgn(data: PGNRequest):
    result = parse_pgn(data.pgn)

    if result is None:
        raise HTTPException(status_code=400, detail="Invalid PGN")

    return result