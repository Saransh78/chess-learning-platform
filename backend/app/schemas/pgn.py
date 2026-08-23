from pydantic import BaseModel

class PGNRequest(BaseModel):
    pgn: str