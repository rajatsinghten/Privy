"""
Request Schemas

Pydantic schemas for API request/response validation.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class DataRequestCreate(BaseModel):
    """Schema for creating a new data request."""
    
    resource_type: str = Field(..., description="Type of resource being requested")
    purpose: str = Field(..., description="Purpose of the data request")
    data_fields: List[str] = Field(default=[], description="Specific data fields requested")


class DataRequestResponse(BaseModel):
    """Schema for data request response."""
    
    id: str
    status: str
    resource_type: str
    purpose: str
    data_fields: List[str]
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DecisionCreate(BaseModel):
    """Schema for creating a decision."""
    
    request_id: str
    approved: bool
    reason: Optional[str] = None


class DecisionResponse(BaseModel):
    """Schema for decision response."""
    
    id: str
    request_id: str
    approved: bool
    reason: Optional[str]
    decided_at: datetime
    decided_by: str
    
    class Config:
        from_attributes = True
