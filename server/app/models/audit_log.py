"""Audit Log Model - Database model for audit logging."""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, JSON
from app.core.database import Base


class AuditLog(Base):
    """Audit log database model."""
    
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    requester_id = Column(String(255), nullable=False, index=True)
    requester_role = Column(String(50), nullable=False)
    purpose = Column(String(255), nullable=False)
    location = Column(String(255))
    data_sensitivity = Column(String(50))
    decision = Column(String(50), nullable=False)
    reason = Column(Text)
    risk_score = Column(Float, nullable=False)
    request_metadata = Column(JSON)
