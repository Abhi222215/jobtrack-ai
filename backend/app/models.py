from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from .database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    job_url = Column(String)
    description = Column(Text)
    status = Column(String, default="Saved")
    applied_date = Column(Date)
    created_at = Column(DateTime, server_default=func.now())


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    cv_text = Column(Text, nullable=False)
    match_score = Column(Integer)
    missing_skills = Column(JSON)
    suggestions = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())