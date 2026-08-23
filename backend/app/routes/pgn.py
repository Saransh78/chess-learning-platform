from fastapi import APIRouter
from app.schemas.pgn import PGNRequest

router = APIRouter()

@router.post("/api/pgn")
def upload_pgn(data: PGNRequest):
    ...