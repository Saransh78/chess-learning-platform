from fastapi import FastAPI
from app.routes.pgn import router as pgn_router

app = FastAPI(title="BoardSense API")


@app.get("/")
def home():
    return {"message": "Welcome to BoardSense API"}


app.include_router(pgn_router)