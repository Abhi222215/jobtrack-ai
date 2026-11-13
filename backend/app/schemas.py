from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

JobStatus = Literal["Saved", "Applied", "Interview", "Offer", "Rejected"]


class JobBase(BaseModel):
    company: str = Field(min_length=1, max_length=160)
    role: str = Field(min_length=1, max_length=200)
    job_url: str | None = Field(default=None, max_length=2048)
    description: str | None = Field(default=None, max_length=30_000)
    status: JobStatus = "Saved"
    applied_date: date | None = None

    @field_validator("company", "role")
    @classmethod
    def trim_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value

    @field_validator("job_url")
    @classmethod
    def validate_job_url(cls, value: str | None) -> str | None:
        value = value.strip() if value else None
        if value and not value.lower().startswith(("https://", "http://")):
            raise ValueError("Job URL must start with http:// or https://")
        return value or None

    @field_validator("description")
    @classmethod
    def normalize_description(cls, value: str | None) -> str | None:
        value = value.strip() if value else None
        return value or None


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    pass


class JobStatusUpdate(BaseModel):
    status: JobStatus


class JobOut(JobBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class JobStats(BaseModel):
    total: int
    in_progress: int
    offers: int


class AnalysisRequest(BaseModel):
    cv_text: str = Field(min_length=1, max_length=30_000)

    @field_validator("cv_text")
    @classmethod
    def trim_cv_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("CV text cannot be blank")
        return value


class AnalysisResult(BaseModel):
    match_score: int = Field(ge=0, le=100)
    missing_skills: list[str] = Field(max_length=6)
    suggestions: list[str] = Field(max_length=6)


class AnalysisOut(AnalysisResult):
    id: int
    job_id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
