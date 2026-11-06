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