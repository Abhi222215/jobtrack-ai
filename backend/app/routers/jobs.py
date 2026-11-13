from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=schemas.JobOut)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


@router.get("/stats", response_model=schemas.JobStats)
def job_stats(db: Session = Depends(get_db)):
    jobs = db.query(models.Job.status).all()
    statuses = [job.status for job in jobs]
    return {
        "total": len(statuses),
        "in_progress": sum(status not in ("Rejected", "Offer") for status in statuses),
        "offers": statuses.count("Offer"),
    }


@router.get("/", response_model=list[schemas.JobOut])
def list_jobs(
    status: schemas.JobStatus | None = None,
    search: str | None = Query(default=None, max_length=200),
    limit: int = Query(default=100, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(models.Job)
    if status:
        query = query.filter(models.Job.status == status)
    if search and search.strip():
        pattern = f"%{search.strip()}%"
        query = query.filter(or_(models.Job.company.ilike(pattern), models.Job.role.ilike(pattern)))
    return query.order_by(models.Job.created_at.desc(), models.Job.id.desc()).offset(offset).limit(limit).all()

@router.get("/{job_id}", response_model=schemas.JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.put("/{job_id}", response_model=schemas.JobOut)
def update_job(job_id: int, data: schemas.JobCreate, db: Session = Depends(get_db)):
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in data.model_dump().items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job


@router.patch("/{job_id}/status", response_model=schemas.JobOut)
def update_job_status(job_id: int, data: schemas.JobStatusUpdate, db: Session = Depends(get_db)):
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = data.status
    db.commit()
    db.refresh(job)
    return job


@router.delete("/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(models.Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"detail": "Job deleted"}
