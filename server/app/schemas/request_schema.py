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
    privacy_budget: Optional[Dict[str, Any]] = Field(default=None, description="Privacy budget status")
    legal_compliance: Optional[Dict[str, Any]] = Field(default=None, description="Legal compliance status")
    masking_applied: Optional[Dict[str, Any]] = Field(default=None, description="Data masking details")


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


# ============ Self-Destructing Token Schemas ============

class TaskTokenRequest(BaseModel):
    """Request to generate a self-destructing task token."""
    
    task_id: str = Field(..., description="Unique identifier for the AI task")
    task_type: str = Field(default="inference", description="Type: inference, training, analysis")
    max_ttl_seconds: int = Field(default=300, description="Maximum time-to-live in seconds")
    max_uses: int = Field(default=1, description="Maximum number of uses")
    data_scope: Optional[List[str]] = Field(default=None, description="Data fields this token can access")


class TaskTokenResponse(BaseModel):
    """Response with self-destructing token details."""
    
    token: str
    token_id: str
    task_id: str
    expires_at: str
    max_ttl_seconds: int
    max_uses: int
    data_scope: List[str]
    self_destruct_policy: Dict[str, bool]


class TaskCompleteRequest(BaseModel):
    """Signal task completion to destroy associated tokens."""
    
    task_id: str = Field(..., description="The completed task ID")


# ============ Privacy Budget Schemas ============

class PrivacyBudgetRequest(BaseModel):
    """Request to check/consume privacy budget."""
    
    subject_id: str = Field(..., description="Data subject ID")
    query_type: str = Field(default="individual", description="aggregate, individual, or raw")
    data_sensitivity: str = Field(default="medium", description="low, medium, or high")
    num_records: int = Field(default=1, description="Number of records being queried")
    purpose: str = Field(default="analytics", description="Purpose of the query")


class PrivacyBudgetResponse(BaseModel):
    """Privacy budget status response."""
    
    allowed: bool
    reason: str
    budget_remaining: float
    budget_total: Optional[float] = None
    budget_percentage: Optional[float] = None
    query_cost: Optional[float] = None
    alert_level: str
    window_resets_at: Optional[str] = None


class SetBudgetRequest(BaseModel):
    """Admin request to set custom privacy budget."""
    
    subject_id: str
    epsilon_budget: float = Field(default=1.0, description="New epsilon budget value")
    reset_hours: int = Field(default=24, description="Budget reset window in hours")


# ============ Adaptive Masking Schemas ============

class MaskDataRequest(BaseModel):
    """Request to mask data based on risk level."""
    
    data: Dict[str, Any] = Field(..., description="Data to be masked")
    field_types: Dict[str, str] = Field(..., description="Field type mapping (email, phone, ssn, etc.)")
    purpose: str = Field(default="analytics", description="Purpose of access")


class MaskDataResponse(BaseModel):
    """Response with masked data."""
    
    data: Dict[str, Any]
    masking_applied: Dict[str, Any]


# ============ RTBF Schemas ============

class RTBFRequest(BaseModel):
    """Request to trigger Right to Be Forgotten."""
    
    subject_id: str = Field(..., description="Data subject requesting erasure")
    reason: str = Field(default="consent_withdrawal", description="Reason for RTBF")
    scope: Optional[List[str]] = Field(default=None, description="Specific data layers to purge")
    verification_token: Optional[str] = Field(default=None, description="Verification for sensitive operations")


class RTBFResponse(BaseModel):
    """RTBF execution response."""
    
    request_id: str
    subject_id: str
    status: str
    access_blocked: bool
    layer_status: Dict[str, Any]
    deletion_certificate: Optional[Dict[str, Any]] = None
    created_at: str


# ============ Legal Compliance Schemas ============

class ComplianceCheckRequest(BaseModel):
    """Request to check legal compliance."""
    
    data_subject_location: str = Field(..., description="Location of the data subject")
    requester_location: str = Field(..., description="Location of the requester")
    data_storage_location: str = Field(default="US", description="Where data is stored")
    purpose: str = Field(default="analytics", description="Purpose of access")
    data_sensitivity: str = Field(default="medium", description="Sensitivity level")
    consent_verified: bool = Field(default=False, description="Whether consent is verified")


class ComplianceCheckResponse(BaseModel):
    """Legal compliance check response."""
    
    is_compliant: bool
    jurisdictions: List[str]
    applicable_laws: List[str]
    strictness_score: float
    requirements_applied: Dict[str, Any]
    compliance_issues: List[Dict[str, Any]]
    required_actions: List[str]
    evaluated_at: str

