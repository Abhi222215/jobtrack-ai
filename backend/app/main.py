from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import jobs

Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobTrack AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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