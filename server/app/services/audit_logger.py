"""Audit Logger Service - Logging and retrieval of access decisions."""

from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog


class AuditLogger:
    """Service for logging and retrieving audit entries."""
    
    def log_request(
        self,
        db: Session,
        requester_id: str,
        requester_role: str,
        purpose: str,
        location: str,
        data_sensitivity: str,
        decision: str,
        reason: str,
        risk_score: float,
        request_metadata: Dict[str, Any] = None
    ) -> AuditLog:
        """Log a data access request and decision."""
        audit_log = AuditLog(
            timestamp=datetime.utcnow(),
            requester_id=requester_id,
            requester_role=requester_role,
            purpose=purpose,
            location=location,
            data_sensitivity=data_sensitivity,
            decision=decision,
            reason=reason,
            risk_score=risk_score,
            request_metadata=request_metadata or {}
        )
        
        db.add(audit_log)
        db.commit()
        db.refresh(audit_log)
        
        return audit_log
    
    def get_audit_logs(
        self,
        db: Session,
        limit: int = 100,
        offset: int = 0,
        requester_id: str = None,
        decision: str = None
    ) -> List[AuditLog]:
        """Retrieve audit logs with optional filtering."""
        query = db.query(AuditLog)
        
        if requester_id:
            query = query.filter(AuditLog.requester_id == requester_id)
        
        if decision:
            query = query.filter(AuditLog.decision == decision)
        
        query = query.order_by(AuditLog.timestamp.desc())
        query = query.offset(offset).limit(limit)
        
        return query.all()
    
    def get_audit_log_by_id(self, db: Session, log_id: int) -> AuditLog:
        """Retrieve a specific audit log by ID."""
        return db.query(AuditLog).filter(AuditLog.id == log_id).first()
    
    def get_audit_stats(self, db: Session) -> Dict[str, Any]:
        """Get statistics about audit logs."""
        total_logs = db.query(AuditLog).count()
        allowed_count = db.query(AuditLog).filter(AuditLog.decision == "ALLOW").count()
        denied_count = db.query(AuditLog).filter(AuditLog.decision == "DENY").count()
        
        return {
            "total_requests": total_logs,
            "allowed": allowed_count,
            "denied": denied_count,
            "allow_rate": round(allowed_count / total_logs, 2) if total_logs > 0 else 0
        }


audit_logger = AuditLogger()
