from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from auth.router import router as auth_router
from players.router import router as players_router

app = FastAPI(title="JanoraScout API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(players_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
