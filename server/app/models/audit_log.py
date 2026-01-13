"""
Audit Log Model

Model representing audit log entries for tracking data access and decisions.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AuditLog(BaseModel):
    """Audit log entry model."""
    
    id: Optional[str] = None
    timestamp: datetime
    user_id: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    
    class Config:
        from_attributes = True
