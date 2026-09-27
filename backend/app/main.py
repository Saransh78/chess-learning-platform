from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.analysis import router as analysis_router
from app.routes.auth import router as auth_router
from app.routes.pgn import router as pgn_router
from app.routes.report import router as report_router
from app.routes.upload import router as upload_router
from app.services.analysis_service import resolve_stockfish_path

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail fast with a clear error when no Stockfish binary is available.
    resolve_stockfish_path()
    yield


app = FastAPI(title="BoardSense API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.CORS_ORIGINS),
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Welcome to BoardSense API"}


app.include_router(pgn_router)
app.include_router(analysis_router)
app.include_router(upload_router)
app.include_router(report_router)
app.include_router(auth_router)
