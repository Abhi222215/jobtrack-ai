from sqlalchemy import Column, Integer, String, Text, Date, DateTime
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