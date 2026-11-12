from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import jobs
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobTrack AI")
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)

@app.get("/")
def root():
    return {"message": "JobTrack AI is running"}
from .routers import jobs, analysis
...
app.include_router(jobs.router)
app.include_router(analysis.router)