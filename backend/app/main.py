from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import analysis, jobs


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="JobTrack AI API",
    description="Job application tracking and AI powered CV insights.",
    version="1.0.0",
    lifespan=lifespan,
)
origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(jobs.router)
app.include_router(analysis.router)

@app.get("/")
def root():
    return {"message": "JobTrack AI is running"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
