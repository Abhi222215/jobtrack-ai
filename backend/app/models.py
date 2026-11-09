from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, JSON
class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    cv_text = Column(Text, nullable=False)
    match_score = Column(Integer)
    missing_skills = Column(JSON)
    suggestions = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())