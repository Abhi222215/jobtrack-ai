from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class JobBase(BaseModel):
    company: str
    role: str
    job_url: Optional[str] = None
    description: Optional[str] = None
    status: str = "Saved"
    applied_date: Optional[date] = None

class JobCreate(JobBase):
    pass

class JobOut(JobBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AnalysisRequest(BaseModel):
    cv_text: str

class AnalysisOut(BaseModel):
    id: int
    job_id: int
    match_score: int
    missing_skills: list[str]
    suggestions: list[str]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)