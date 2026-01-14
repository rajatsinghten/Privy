"""Consent Manager Service - Simulated user consent storage and validation."""

from typing import Dict, Any, Optional
from datetime import datetime


class ConsentManager:
    """Consent management for data access requests."""
    
    def __init__(self):
        self.consents = {
            "user_123": {
                "purposes": ["analytics", "research", "reporting"],
                "granted_at": datetime.utcnow(),
                "expires_at": None,
                "data_types": ["profile", "usage", "preferences"]
            },
            "user_456": {
                "purposes": ["operational", "security", "audit"],
                "granted_at": datetime.utcnow(),
                "expires_at": None,
                "data_types": ["profile", "transactions", "logs"]
            },
            "user_789": {
                "purposes": ["compliance", "audit"],
                "granted_at": datetime.utcnow(),
                "expires_at": None,
                "data_types": ["profile"]
            }
        }
    
    def check_consent(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Check whether requested purpose matches granted consent."""
        requester_id = request.get("requester_id")
        purpose = request.get("purpose")
        
        consent = self.consents.get(requester_id)
        
        if not consent:
            return {
                "has_consent": False,
                "reason": f"No consent found for requester: {requester_id}",
                "granted_purposes": []
            }
        
        if self._is_consent_expired(consent):
            return {
                "has_consent": False,
                "reason": f"Consent has expired for requester: {requester_id}",
                "granted_purposes": consent.get("purposes", [])
            }
        
        granted_purposes = consent.get("purposes", [])
        
        if purpose not in granted_purposes:
            return {
                "has_consent": False,
                "reason": f"Purpose '{purpose}' not in granted consents. Granted: {', '.join(granted_purposes)}",
                "granted_purposes": granted_purposes
            }
        
        return {
            "has_consent": True,
            "reason": f"Consent granted for purpose: {purpose}",
            "granted_purposes": granted_purposes,
            "granted_at": consent.get("granted_at").isoformat() if consent.get("granted_at") else None
        }
    
    def _is_consent_expired(self, consent: Dict[str, Any]) -> bool:
        """Check if consent has expired."""
        expires_at = consent.get("expires_at")
        if expires_at is None:
            return False
        return datetime.utcnow() > expires_at
    
    def grant_consent(self, requester_id: str, purposes: list, data_types: list = None) -> bool:
        """Grant consent for a requester."""
        self.consents[requester_id] = {
            "purposes": purposes,
            "granted_at": datetime.utcnow(),
            "expires_at": None,
            "data_types": data_types or []
        }
        return True
    
    def revoke_consent(self, requester_id: str) -> bool:
        """Revoke consent for a requester."""
        if requester_id in self.consents:
            del self.consents[requester_id]
            return True
        return False


consent_manager = ConsentManager()
