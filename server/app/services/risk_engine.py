"""Risk Engine Service - Risk assessment and scoring for data access requests."""

from typing import Dict, Any
from app.core.config import get_settings

settings = get_settings()


class RiskEngine:
    """Risk assessment engine using heuristic scoring."""
    
    ROLE_RISK_WEIGHTS = {
        "admin": 0.1,
        "analyst": 0.3,
        "external": 0.7
    }
    
    SENSITIVITY_RISK_WEIGHTS = {
        "low": 0.1,
        "medium": 0.5,
        "high": 0.9
    }
    
    PURPOSE_RISK_WEIGHTS = {
        "audit": 0.1,
        "compliance": 0.1,
        "security": 0.2,
        "operational": 0.3,
        "analytics": 0.4,
        "research": 0.5,
        "reporting": 0.5,
        "marketing": 0.8
    }
    
    JURISDICTION_RISK_WEIGHTS = {
        "US": 0.2,
        "EU": 0.2,
        "UK": 0.2,
        "APAC": 0.4,
        "LATAM": 0.5,
        "GLOBAL": 0.6
    }
    
    def assess_risk(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Assess risk level for a given request."""
        role = request.get("role")
        purpose = request.get("purpose")
        location = request.get("location")
        data_sensitivity = request.get("data_sensitivity")
        
        role_score = self.ROLE_RISK_WEIGHTS.get(role, 0.5)
        sensitivity_score = self.SENSITIVITY_RISK_WEIGHTS.get(data_sensitivity, 0.5)
        purpose_score = self.PURPOSE_RISK_WEIGHTS.get(purpose, 0.5)
        jurisdiction_score = self.JURISDICTION_RISK_WEIGHTS.get(location, 0.5)
        
        risk_score = self.calculate_risk_score(
            role_score,
            sensitivity_score,
            purpose_score,
            jurisdiction_score
        )
        
        risk_factors = {
            "role_risk": role_score,
            "sensitivity_risk": sensitivity_score,
            "purpose_risk": purpose_score,
            "jurisdiction_risk": jurisdiction_score
        }
        
        risk_level = self.get_risk_level(risk_score)
        exceeds_threshold = risk_score > settings.risk_threshold
        
        return {
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "exceeds_threshold": exceeds_threshold,
            "risk_factors": risk_factors,
            "threshold": settings.risk_threshold
        }
    
    def calculate_risk_score(
        self,
        role_score: float,
        sensitivity_score: float,
        purpose_score: float,
        jurisdiction_score: float
    ) -> float:
        """Calculate weighted risk score."""
        weights = {
            "role": 0.25,
            "sensitivity": 0.35,
            "purpose": 0.25,
            "jurisdiction": 0.15
        }
        
        total_score = (
            role_score * weights["role"] +
            sensitivity_score * weights["sensitivity"] +
            purpose_score * weights["purpose"] +
            jurisdiction_score * weights["jurisdiction"]
        )
        
        return min(1.0, max(0.0, total_score))
    
    def get_risk_level(self, risk_score: float) -> str:
        """Get risk level category."""
        if risk_score < 0.3:
            return "low"
        elif risk_score < 0.6:
            return "medium"
        else:
            return "high"


risk_engine = RiskEngine()
