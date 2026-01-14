"""Request Schemas - Pydantic schemas for API request/response validation."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DataAccessRequest(BaseModel):
    """Schema for data access request."""
    
    requester_id: str = Field(..., description="Identity of the requester")
    role: str = Field(..., description="Role of the requester (admin, analyst, external)")
    purpose: str = Field(..., description="Purpose of the data request")
    location: str = Field(..., description="Location/jurisdiction of the requester")
    data_sensitivity: str = Field(..., description="Sensitivity level of requested data (low, medium, high)")


class DataAccessResponse(BaseModel):
    """Schema for data access response."""
    
    decision: str = Field(..., description="Final decision: ALLOW or DENY")
    reason: str = Field(..., description="Reason for the decision")
    risk_score: float = Field(..., description="Risk score between 0 and 1")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    policy_checks: Dict[str, Any] = Field(default_factory=dict)
    consent_status: Dict[str, Any] = Field(default_factory=dict)


class AuditLogResponse(BaseModel):
    """Schema for audit log response."""
    
    id: int
    timestamp: datetime
    requester_id: str
    requester_role: str
    purpose: str
    location: Optional[str]
    data_sensitivity: Optional[str]
    decision: str
    reason: Optional[str]
    risk_score: float
    request_metadata: Optional[Dict[str, Any]]
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema for login request."""
    
    username: str
    password: str


class LoginResponse(BaseModel):
    """Schema for login response."""
    
    access_token: str
    token_type: str = "bearer"
    role: str
