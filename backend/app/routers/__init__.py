from fastapi import FastAPI

app = FastAPI(title="JobTrack AI")

@app.get("/")
def root():
    return {"message": "JobTrack AI is running"}