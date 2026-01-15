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
    LoginResponse,
    TaskTokenRequest,
    TaskTokenResponse,
    TaskCompleteRequest,
    PrivacyBudgetRequest,
    PrivacyBudgetResponse,
    SetBudgetRequest,
    MaskDataRequest,
    MaskDataResponse,
    RTBFRequest,
    RTBFResponse,
    ComplianceCheckRequest,
    ComplianceCheckResponse
)
from app.services.policy_engine import policy_engine
from app.services.risk_engine import risk_engine
from app.services.consent_manager import consent_manager
from app.services.audit_logger import audit_logger
from app.services.self_destructing_token import self_destructing_token_manager
from app.services.privacy_budget import privacy_budget_manager
from app.services.adaptive_masking import adaptive_masking_engine
from app.services.rtbf_trigger import rtbf_service
from app.services.legal_compliance import legal_compliance_engine

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


# ============================================================================
# SELF-DESTRUCTING TOKEN ENDPOINTS
# ============================================================================

@router.post("/tokens/task", response_model=TaskTokenResponse)
async def generate_task_token(
    request: TaskTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a self-destructing token for an AI task.
    
    These tokens automatically expire after:
    - Single use (or max_uses reached)
    - Task completion signal
    - Maximum TTL exceeded
    """
    result = self_destructing_token_manager.generate_task_token(
        user_id=current_user.get("sub"),
        task_id=request.task_id,
        task_type=request.task_type,
        max_ttl_seconds=request.max_ttl_seconds,
        max_uses=request.max_uses,
        data_scope=request.data_scope
    )
    return TaskTokenResponse(**result)


@router.post("/tokens/validate")
async def validate_task_token(
    token: str,
    current_user: dict = Depends(get_current_user)
):
    """Validate a self-destructing token and consume one use."""
    return self_destructing_token_manager.validate_and_consume(token)


@router.post("/tokens/task-complete")
async def signal_task_complete(
    request: TaskCompleteRequest,
    current_user: dict = Depends(get_current_user)
):
    """Signal task completion to destroy all associated tokens."""
    return self_destructing_token_manager.complete_task(request.task_id)


@router.get("/tokens/status/{token_id}")
async def get_token_status(
    token_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get status of a specific token."""
    return self_destructing_token_manager.get_token_status(token_id)


@router.get("/tokens/active")
async def get_active_tokens(
    current_user: dict = Depends(get_current_user)
):
    """Get all active tokens for the current user."""
    return self_destructing_token_manager.get_active_tokens_for_user(
        current_user.get("sub")
    )


# ============================================================================
# PRIVACY BUDGET (ε) ENDPOINTS
# ============================================================================

@router.post("/privacy-budget/check", response_model=PrivacyBudgetResponse)
async def check_privacy_budget(
    request: PrivacyBudgetRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Check and consume privacy budget (ε) for a query.
    
    Implements differential privacy protection by limiting
    queries per data subject to prevent re-identification attacks.
    """
    result = privacy_budget_manager.check_and_consume_budget(
        subject_id=request.subject_id,
        requester_id=current_user.get("sub"),
        query_type=request.query_type,
        data_sensitivity=request.data_sensitivity,
        num_records=request.num_records,
        purpose=request.purpose
    )
    return PrivacyBudgetResponse(**result)


@router.get("/privacy-budget/status/{subject_id}")
async def get_budget_status(
    subject_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get current privacy budget status for a subject."""
    return privacy_budget_manager.get_budget_status(subject_id)


@router.post("/privacy-budget/set")
async def set_custom_budget(
    request: SetBudgetRequest,
    current_user: dict = Depends(require_role("admin"))
):
    """Set a custom privacy budget for a subject (admin only)."""
    return privacy_budget_manager.set_custom_budget(
        subject_id=request.subject_id,
        epsilon_budget=request.epsilon_budget,
        reset_hours=request.reset_hours
    )


@router.get("/privacy-budget/history/{subject_id}")
async def get_budget_history(
    subject_id: str,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(require_role("admin"))
):
    """Get query history for a subject's privacy budget (admin only)."""
    return privacy_budget_manager.get_query_history(subject_id, limit)


@router.get("/privacy-budget/all")
async def get_all_budgets(
    current_user: dict = Depends(require_role("admin"))
):
    """Get summary of all privacy budgets (admin only)."""
    return privacy_budget_manager.get_all_budgets_summary()


# ============================================================================
# ADAPTIVE MASKING ENDPOINTS
# ============================================================================

@router.post("/masking/apply", response_model=MaskDataResponse)
async def apply_adaptive_masking(
    request: MaskDataRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Apply adaptive data masking based on requester's risk level.
    
    Automatically anonymizes data fields based on:
    - Risk score
    - Data sensitivity
    - Field types (email, SSN, phone, etc.)
    """
    # Calculate risk score for the requester
    risk_result = risk_engine.assess_risk({
        "role": current_user.get("role"),
        "purpose": request.purpose,
        "location": "US",  # Default, can be enhanced
        "data_sensitivity": "medium"
    })
    
    result = adaptive_masking_engine.mask_data(
        data=request.data,
        field_types=request.field_types,
        risk_score=risk_result["risk_score"],
        requester_id=current_user.get("sub"),
        purpose=request.purpose
    )
    
    return MaskDataResponse(**result)


@router.get("/masking/stats")
async def get_masking_stats(
    current_user: dict = Depends(require_role("admin"))
):
    """Get adaptive masking statistics (admin only)."""
    return adaptive_masking_engine.get_masking_stats()


# ============================================================================
# RTBF (RIGHT TO BE FORGOTTEN) ENDPOINTS
# ============================================================================

@router.post("/rtbf/trigger", response_model=RTBFResponse)
async def trigger_rtbf(
    request: RTBFRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Trigger Right to Be Forgotten (RTBF) data erasure.
    
    Immediately blocks access and initiates automated data purging
    across all data layers when a user withdraws consent.
    """
    result = rtbf_service.trigger_rtbf(
        subject_id=request.subject_id,
        requested_by=current_user.get("sub"),
        reason=request.reason,
        scope=request.scope,
        verification_token=request.verification_token
    )
    
    return RTBFResponse(
        request_id=result["request_id"],
        subject_id=result["subject_id"],
        status=result["status"].value if hasattr(result["status"], "value") else result["status"],
        access_blocked=result["access_blocked"],
        layer_status=result["layer_status"],
        deletion_certificate=result.get("deletion_certificate"),
        created_at=result["created_at"].isoformat()
    )


@router.get("/rtbf/status/{request_id}")
async def get_rtbf_status(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get status of an RTBF request."""
    result = rtbf_service.get_request_status(request_id)
    if not result:
        raise HTTPException(status_code=404, detail="RTBF request not found")
    return result


@router.get("/rtbf/certificate/{subject_id}")
async def get_deletion_certificate(
    subject_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve deletion certificate for compliance proof."""
    cert = rtbf_service.get_deletion_certificate(subject_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Deletion certificate not found")
    return cert


@router.get("/rtbf/blocked/{subject_id}")
async def check_rtbf_block(
    subject_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if a subject's data is blocked due to RTBF."""
    return {
        "subject_id": subject_id,
        "is_blocked": rtbf_service.is_subject_blocked(subject_id)
    }


@router.get("/rtbf/all")
async def get_all_rtbf_requests(
    status: Optional[str] = None,
    current_user: dict = Depends(require_role("admin"))
):
    """Get all RTBF requests (admin only)."""
    return rtbf_service.get_all_rtbf_requests()


# ============================================================================
# LEGAL COMPLIANCE ENGINE ENDPOINTS
# ============================================================================

@router.post("/compliance/check", response_model=ComplianceCheckResponse)
async def check_legal_compliance(
    request: ComplianceCheckRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Check legal compliance for a data access request.
    
    Automatically applies the strictest applicable privacy laws
    based on data subject location, requester location, and data storage.
    """
    result = legal_compliance_engine.evaluate_compliance(
        request={
            "requester_id": current_user.get("sub"),
            "purpose": request.purpose,
            "data_sensitivity": request.data_sensitivity,
            "consent_verified": request.consent_verified,
            "data_storage_location": request.data_storage_location
        },
        data_subject_location=request.data_subject_location,
        requester_location=request.requester_location
    )
    
    return ComplianceCheckResponse(**result)


@router.get("/compliance/laws")
async def get_all_laws(
    current_user: dict = Depends(get_current_user)
):
    """Get summary of all supported privacy laws."""
    return legal_compliance_engine.get_all_laws_summary()


@router.get("/compliance/law/{jurisdiction}")
async def get_law_details(
    jurisdiction: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific privacy law."""
    from app.services.legal_compliance import Jurisdiction
    
    try:
        j = Jurisdiction(jurisdiction)
        details = legal_compliance_engine.get_law_details(j)
        if not details:
            raise HTTPException(status_code=404, detail="Law not found")
        return details
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid jurisdiction: {jurisdiction}")


@router.get("/compliance/report")
async def get_compliance_report(
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(require_role("admin"))
):
    """Get compliance check report (admin only)."""
    return legal_compliance_engine.get_compliance_report(limit)


# ============================================================================
# ENHANCED REQUEST-DATA WITH ALL PRIVACY FEATURES
# ============================================================================

@router.post("/request-data/enhanced", response_model=DataAccessResponse)
async def request_data_access_enhanced(
    request: DataAccessRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Enhanced Privacy-Aware API Gateway with all privacy features:
    
    1. Policy Engine - Rule-based enforcement
    2. Consent Manager - User consent validation
    3. Risk Engine - Risk scoring
    4. Privacy Budget (ε) - Differential privacy protection
    5. Legal Compliance - Multi-jurisdiction law enforcement
    6. Adaptive Masking - Risk-based data anonymization
    7. RTBF Check - Right to Be Forgotten verification
    """
    request_dict = {
        "requester_id": request.requester_id,
        "role": request.role,
        "purpose": request.purpose,
        "location": request.location,
        "data_sensitivity": request.data_sensitivity
    }
    
    # Check RTBF block first
    if rtbf_service.is_subject_blocked(request.requester_id):
        return DataAccessResponse(
            decision="DENY",
            reason="Data subject has exercised Right to Be Forgotten - all access blocked",
            risk_score=1.0,
            policy_checks={"rtbf_blocked": True},
            consent_status={"has_consent": False, "reason": "RTBF active"}
        )
    
    # Standard checks
    policy_result = policy_engine.evaluate_policy(request_dict)
    consent_result = consent_manager.check_consent(request_dict)
    risk_result = risk_engine.assess_risk(request_dict)
    
    # Privacy budget check
    budget_result = privacy_budget_manager.check_and_consume_budget(
        subject_id=request.requester_id,
        requester_id=current_user.get("sub"),
        query_type="individual",
        data_sensitivity=request.data_sensitivity,
        purpose=request.purpose
    )
    
    # Legal compliance check
    compliance_result = legal_compliance_engine.evaluate_compliance(
        request=request_dict,
        data_subject_location=request.location,
        requester_location="US"  # Could be enhanced with user location
    )
    
    final_decision = "DENY"
    reasons = []
    
    if not policy_result["allowed"]:
        reasons.append(f"Policy: {policy_result['reason']}")
    
    if not consent_result["has_consent"]:
        reasons.append(f"Consent: {consent_result['reason']}")
    
    if risk_result["exceeds_threshold"]:
        reasons.append(f"Risk: Score {risk_result['risk_score']} exceeds threshold")
    
    if not budget_result["allowed"]:
        reasons.append(f"Privacy Budget: {budget_result['reason']}")
    
    if not compliance_result["is_compliant"]:
        blocking_issues = [i for i in compliance_result["compliance_issues"] 
                         if i.get("severity") == "blocking"]
        if blocking_issues:
            reasons.append(f"Legal: {blocking_issues[0]['message']}")
    
    # All checks must pass
    all_passed = (
        policy_result["allowed"] and 
        consent_result["has_consent"] and 
        not risk_result["exceeds_threshold"] and
        budget_result["allowed"] and
        compliance_result["is_compliant"]
    )
    
    if all_passed:
        final_decision = "ALLOW"
        reasons.append("All privacy checks passed")
    
    final_reason = " | ".join(reasons)
    
    # Log the request
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
            "policy_checks": policy_result.get("checks", {}),
            "risk_factors": risk_result.get("risk_factors", {}),
            "privacy_budget": {
                "remaining": budget_result.get("budget_remaining"),
                "alert_level": budget_result.get("alert_level")
            },
            "legal_compliance": {
                "laws": compliance_result.get("applicable_laws", []),
                "is_compliant": compliance_result.get("is_compliant")
            }
        }
    )
    
    return DataAccessResponse(
        decision=final_decision,
        reason=final_reason,
        risk_score=risk_result["risk_score"],
        policy_checks=policy_result,
        consent_status=consent_result,
        privacy_budget={
            "remaining": budget_result.get("budget_remaining"),
            "percentage": budget_result.get("budget_percentage"),
            "alert_level": budget_result.get("alert_level")
        },
        legal_compliance={
            "is_compliant": compliance_result.get("is_compliant"),
            "applicable_laws": compliance_result.get("applicable_laws"),
            "strictness_score": compliance_result.get("strictness_score")
        }
    )
