"""Policy Engine Service - Rule-based enforcement for data access policies."""

from typing import Dict, Any


class PolicyEngine:
    """Rule-based policy enforcement engine."""
    
    VALID_PURPOSES = [
        "analytics",
        "research",
        "compliance",
        "audit",
        "reporting",
        "operational",
        "marketing",
        "security"
    ]
    
    VALID_JURISDICTIONS = [
        "US",
        "EU",
        "UK",
        "APAC",
        "LATAM",
        "GLOBAL"
    ]
    
    ROLE_PERMISSIONS = {
        "admin": {
            "purposes": VALID_PURPOSES,
            "jurisdictions": VALID_JURISDICTIONS,
            "max_sensitivity": "high"
        },
        "analyst": {
            "purposes": ["analytics", "research", "reporting"],
            "jurisdictions": ["US", "EU", "UK"],
            "max_sensitivity": "medium"
        },
        "external": {
            "purposes": ["reporting"],
            "jurisdictions": ["US"],
            "max_sensitivity": "low"
        }
    }
    
    SENSITIVITY_LEVELS = {
        "low": 1,
        "medium": 2,
        "high": 3
    }
    
    def evaluate_policy(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate access policy for a given request."""
        requester_role = request.get("role")
        purpose = request.get("purpose")
        location = request.get("location")
        data_sensitivity = request.get("data_sensitivity")
        
        checks = {
            "role_valid": False,
            "purpose_allowed": False,
            "jurisdiction_allowed": False,
            "sensitivity_allowed": False
        }
        
        if requester_role not in self.ROLE_PERMISSIONS:
            return {
                "allowed": False,
                "reason": f"Invalid role: {requester_role}",
                "checks": checks
            }
        
        checks["role_valid"] = True
        role_perms = self.ROLE_PERMISSIONS[requester_role]
        
        if purpose not in self.VALID_PURPOSES:
            return {
                "allowed": False,
                "reason": f"Invalid purpose: {purpose}",
                "checks": checks
            }
        
        if purpose not in role_perms["purposes"]:
            return {
                "allowed": False,
                "reason": f"Purpose '{purpose}' not allowed for role '{requester_role}'",
                "checks": checks
            }
        
        checks["purpose_allowed"] = True
        
        if location not in self.VALID_JURISDICTIONS:
            return {
                "allowed": False,
                "reason": f"Invalid jurisdiction: {location}",
                "checks": checks
            }
        
        if location not in role_perms["jurisdictions"]:
            return {
                "allowed": False,
                "reason": f"Access from jurisdiction '{location}' not allowed for role '{requester_role}'",
                "checks": checks
            }
        
        checks["jurisdiction_allowed"] = True
        
        if data_sensitivity not in self.SENSITIVITY_LEVELS:
            return {
                "allowed": False,
                "reason": f"Invalid sensitivity level: {data_sensitivity}",
                "checks": checks
            }
        
        max_allowed_sensitivity = role_perms["max_sensitivity"]
        if self.SENSITIVITY_LEVELS[data_sensitivity] > self.SENSITIVITY_LEVELS[max_allowed_sensitivity]:
            return {
                "allowed": False,
                "reason": f"Data sensitivity '{data_sensitivity}' exceeds maximum allowed '{max_allowed_sensitivity}' for role '{requester_role}'",
                "checks": checks
            }
        
        checks["sensitivity_allowed"] = True
        
        return {
            "allowed": True,
            "reason": "All policy checks passed",
            "checks": checks
        }


policy_engine = PolicyEngine()
