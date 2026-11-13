from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.ai import analyze_cv

router = APIRouter(tags=["analysis"])


@router.post("/jobs/{job_id}/analyze", response_model=schemas.AnalysisOut)
def analyze_job(job_id: int, body: schemas.AnalysisRequest, db: Session = Depends(get_db)):
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not job.description:
        raise HTTPException(status_code=400, detail="Add a job description first")

    try:
        raw_result = analyze_cv(body.cv_text, job.company, job.role, job.description)
        result = schemas.AnalysisResult.model_validate(raw_result)
    except Exception as exc:
        # Keep provider credentials, response bodies, and internal errors out of API responses.
        raise HTTPException(status_code=502, detail="AI analysis is temporarily unavailable. Please try again.") from exc

    analysis = models.Analysis(
        job_id=job_id,
        cv_text=body.cv_text,
        match_score=result.match_score,
        missing_skills=result.missing_skills,
        suggestions=result.suggestions,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/jobs/{job_id}/analyses", response_model=list[schemas.AnalysisOut])
def list_analyses(job_id: int, db: Session = Depends(get_db)):
    if not db.get(models.Job, job_id):
        raise HTTPException(status_code=404, detail="Job not found")
    return (
        db.query(models.Analysis)
        .filter(models.Analysis.job_id == job_id)
        .order_by(models.Analysis.created_at.desc())
        .all()
    )
