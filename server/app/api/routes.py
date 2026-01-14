"""API Routes - Main endpoints for the privacy-aware API gateway."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    verify_password,
    get_current_user,
    require_role
)
from app.schemas.request_schema import (
    DataAccessRequest,
    DataAccessResponse,
    AuditLogResponse,
    LoginRequest,
    LoginResponse
)
from app.services.policy_engine import policy_engine
from app.services.risk_engine import risk_engine
from app.services.consent_manager import consent_manager
from app.services.audit_logger import audit_logger

router = APIRouter()

MOCK_USERS = {
    "admin": {
        "username": "admin",
        "password": "$2b$12$MyVkelvvEzzv2D6wRiEWbOwGGkPeVULUCGPemOddPfB0SEkJlBvGe",  # admin123
        "role": "admin"
    },
    "analyst": {
        "username": "analyst",
        "password": "$2b$12$xtxGKB3L5zGj6ZthWvuqoeOrjBHMT9LIIdCDHf9vmoVmvtH2bxyoG",  # analyst123
        "role": "analyst"
    },
    "external": {
        "username": "external",
        "password": "$2b$12$0qFWFluaPW6SkPQAZR9aZebuWxX1YM96J1KuoTomWsOVCYYfJZDzK",  # external123
        "role": "external"
    }
}


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "Privy API Gateway"}


@router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """User login endpoint with JWT token generation."""
    user = MOCK_USERS.get(login_data.username)
    
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=timedelta(minutes=30)
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        role=user["role"]
    )


@router.post("/request-data", response_model=DataAccessResponse)
async def request_data_access(
    request: DataAccessRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Privacy-Aware API Gateway endpoint for data access requests.
    
    This endpoint evaluates data access requests through:
    1. Policy Engine - Rule-based enforcement
    2. Consent Manager - User consent validation
    3. Risk Engine - Risk scoring and assessment
    
    Returns ALLOW or DENY decision with reason and risk score.
    """
    request_dict = {
        "requester_id": request.requester_id,
        "role": request.role,
        "purpose": request.purpose,
        "location": request.location,
        "data_sensitivity": request.data_sensitivity
    }
    
    policy_result = policy_engine.evaluate_policy(request_dict)
    
    consent_result = consent_manager.check_consent(request_dict)
    
    risk_result = risk_engine.assess_risk(request_dict)
    
    final_decision = "DENY"
    reasons = []
    
    if not policy_result["allowed"]:
        reasons.append(f"Policy: {policy_result['reason']}")
    
    if not consent_result["has_consent"]:
        reasons.append(f"Consent: {consent_result['reason']}")
    
    if risk_result["exceeds_threshold"]:
        reasons.append(
            f"Risk: Score {risk_result['risk_score']} exceeds threshold {risk_result['threshold']}"
        )
    
    if policy_result["allowed"] and consent_result["has_consent"] and not risk_result["exceeds_threshold"]:
        final_decision = "ALLOW"
        reasons.append("All checks passed: policy compliant, consent granted, risk acceptable")
    
    final_reason = " | ".join(reasons)
    
    audit_logger.log_request(
        db=db,
        requester_id=request.requester_id,
        requester_role=request.role,
        purpose=request.purpose,
        location=request.location,
        data_sensitivity=request.data_sensitivity,
        decision=final_decision,
        reason=final_reason,
        risk_score=risk_result["risk_score"],
        request_metadata={
            "policy_checks": policy_result["checks"],
            "risk_factors": risk_result["risk_factors"],
            "risk_level": risk_result["risk_level"],
            "consent_granted_purposes": consent_result.get("granted_purposes", [])
        }
    )
    
    return DataAccessResponse(
        decision=final_decision,
        reason=final_reason,
        risk_score=risk_result["risk_score"],
        policy_checks=policy_result,
        consent_status=consent_result
    )


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    requester_id: Optional[str] = None,
    decision: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """
    Retrieve audit logs (admin only).
    
    Query parameters:
    - limit: Maximum number of logs to return (default: 100, max: 1000)
    - offset: Number of logs to skip (default: 0)
    - requester_id: Filter by requester ID
    - decision: Filter by decision (ALLOW/DENY)
    """
    logs = audit_logger.get_audit_logs(
        db=db,
        limit=limit,
        offset=offset,
        requester_id=requester_id,
        decision=decision
    )
    
    return logs


@router.get("/audit-logs/stats")
async def get_audit_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """Get audit log statistics (admin only)."""
    return audit_logger.get_audit_stats(db=db)

    pass


@router.get("/audit-logs")
async def get_audit_logs():
    """Placeholder: Get audit logs."""
    # TODO: Implement audit log retrieval
    pass
