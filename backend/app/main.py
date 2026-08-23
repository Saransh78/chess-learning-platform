from fastapi import FastAPI
from app.routes.analysis import router as analysis_router
from app.routes.pgn import router as pgn_router
from app.routes.upload import router as upload_router

app = FastAPI(title="BoardSense API")


@app.get("/")
def home():
    return {"message": "Welcome to BoardSense API"}


app.include_router(pgn_router)
app.include_router(analysis_router)
app.include_router(upload_router)