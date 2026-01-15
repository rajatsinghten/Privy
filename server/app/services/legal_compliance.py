"""
Legal Compliance Wrapper - Smart Compliance Engine.

Automatically applies the strictest global privacy laws based on geography,
ensuring compliance with GDPR, CCPA, DPDP (India), LGPD (Brazil), and more.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from enum import Enum


class Jurisdiction(str, Enum):
    EU = "EU"           # GDPR
    US_CA = "US_CA"     # CCPA
    US_VA = "US_VA"     # VCDPA
    US_CO = "US_CO"     # CPA
    UK = "UK"           # UK GDPR
    INDIA = "IN"        # DPDP
    BRAZIL = "BR"       # LGPD
    CANADA = "CA"       # PIPEDA
    AUSTRALIA = "AU"    # Privacy Act
    SINGAPORE = "SG"    # PDPA
    GLOBAL = "GLOBAL"   # Most restrictive combination


class LegalComplianceEngine:
    """
    Smart compliance engine that:
    1. Detects applicable jurisdictions from request context
    2. Applies the most restrictive rules when multiple jurisdictions apply
    3. Enforces jurisdiction-specific requirements automatically
    """
    
    # Comprehensive privacy law definitions
    PRIVACY_LAWS = {
        Jurisdiction.EU: {
            "name": "GDPR",
            "full_name": "General Data Protection Regulation",
            "region": "European Union",
            "strictness_score": 0.95,
            "requirements": {
                "consent_required": True,
                "explicit_consent_for_sensitive": True,
                "right_to_erasure": True,
                "data_portability": True,
                "breach_notification_hours": 72,
                "dpo_required": True,
                "cross_border_restrictions": True,
                "profiling_opt_out": True,
                "automated_decision_rights": True,
                "purpose_limitation": "strict",
                "data_minimization": True,
                "retention_limits": True,
                "lawful_basis_required": True
            },
            "penalties": {
                "max_fine_percentage": 4,  # % of global turnover
                "max_fine_amount": 20_000_000  # EUR
            },
            "special_categories": [
                "racial_ethnic", "political", "religious", "trade_union",
                "genetic", "biometric", "health", "sex_life", "orientation"
            ]
        },
        Jurisdiction.US_CA: {
            "name": "CCPA",
            "full_name": "California Consumer Privacy Act",
            "region": "California, USA",
            "strictness_score": 0.75,
            "requirements": {
                "consent_required": False,  # Opt-out model
                "opt_out_of_sale": True,
                "right_to_erasure": True,
                "data_portability": True,
                "breach_notification_hours": None,  # "Expedient"
                "dpo_required": False,
                "cross_border_restrictions": False,
                "profiling_opt_out": True,
                "automated_decision_rights": True,
                "purpose_limitation": "moderate",
                "data_minimization": False,
                "retention_limits": False,
                "do_not_sell_link": True
            },
            "penalties": {
                "max_fine_per_violation": 7500,  # USD intentional
                "max_fine_unintentional": 2500
            }
        },
        Jurisdiction.INDIA: {
            "name": "DPDP",
            "full_name": "Digital Personal Data Protection Act",
            "region": "India",
            "strictness_score": 0.85,
            "requirements": {
                "consent_required": True,
                "explicit_consent_for_sensitive": True,
                "right_to_erasure": True,
                "data_portability": False,
                "breach_notification_hours": None,  # "Without delay"
                "dpo_required": True,  # "Data Protection Officer"
                "cross_border_restrictions": True,  # Blacklist model
                "data_localization": "conditional",
                "purpose_limitation": "strict",
                "data_minimization": True,
                "retention_limits": True,
                "consent_manager_integration": True,
                "significant_data_fiduciary": True
            },
            "penalties": {
                "max_fine_amount": 2_500_000_000  # INR (₹250 Crore)
            },
            "special_provisions": {
                "children_data_age": 18,
                "verifiable_parental_consent": True
            }
        },
        Jurisdiction.UK: {
            "name": "UK GDPR",
            "full_name": "UK General Data Protection Regulation",
            "region": "United Kingdom",
            "strictness_score": 0.93,
            "requirements": {
                "consent_required": True,
                "explicit_consent_for_sensitive": True,
                "right_to_erasure": True,
                "data_portability": True,
                "breach_notification_hours": 72,
                "dpo_required": True,
                "cross_border_restrictions": True,
                "profiling_opt_out": True,
                "automated_decision_rights": True,
                "purpose_limitation": "strict",
                "data_minimization": True,
                "retention_limits": True,
                "ico_registration": True
            },
            "penalties": {
                "max_fine_percentage": 4,
                "max_fine_amount": 17_500_000  # GBP
            }
        },
        Jurisdiction.BRAZIL: {
            "name": "LGPD",
            "full_name": "Lei Geral de Proteção de Dados",
            "region": "Brazil",
            "strictness_score": 0.80,
            "requirements": {
                "consent_required": True,
                "explicit_consent_for_sensitive": True,
                "right_to_erasure": True,
                "data_portability": True,
                "breach_notification_hours": None,  # "Reasonable time"
                "dpo_required": True,
                "cross_border_restrictions": True,
                "purpose_limitation": "moderate",
                "data_minimization": True,
                "retention_limits": True,
                "anpd_notification": True
            },
            "penalties": {
                "max_fine_percentage": 2,
                "max_fine_amount": 50_000_000  # BRL
            }
        },
        Jurisdiction.SINGAPORE: {
            "name": "PDPA",
            "full_name": "Personal Data Protection Act",
            "region": "Singapore",
            "strictness_score": 0.70,
            "requirements": {
                "consent_required": True,
                "right_to_erasure": False,  # Limited
                "data_portability": True,
                "breach_notification_hours": 72,  # If significant
                "dpo_required": True,
                "cross_border_restrictions": True,
                "dnc_registry": True,  # Do Not Call
                "purpose_limitation": "moderate",
                "retention_limits": True
            },
            "penalties": {
                "max_fine_amount": 1_000_000  # SGD
            }
        }
    }
    
    # Geographic mapping to jurisdictions
    GEO_MAPPING = {
        # EU Countries
        "DE": Jurisdiction.EU, "FR": Jurisdiction.EU, "IT": Jurisdiction.EU,
        "ES": Jurisdiction.EU, "NL": Jurisdiction.EU, "BE": Jurisdiction.EU,
        "PL": Jurisdiction.EU, "SE": Jurisdiction.EU, "AT": Jurisdiction.EU,
        "IE": Jurisdiction.EU, "PT": Jurisdiction.EU, "FI": Jurisdiction.EU,
        
        # UK
        "GB": Jurisdiction.UK, "UK": Jurisdiction.UK,
        
        # US States with privacy laws
        "US_CA": Jurisdiction.US_CA, "US_VA": Jurisdiction.US_VA,
        "US_CO": Jurisdiction.US_CO, "CA": Jurisdiction.US_CA,
        
        # Other regions
        "IN": Jurisdiction.INDIA, "INDIA": Jurisdiction.INDIA,
        "BR": Jurisdiction.BRAZIL, "BRAZIL": Jurisdiction.BRAZIL,
        "SG": Jurisdiction.SINGAPORE,
        "AU": Jurisdiction.AUSTRALIA,
    }
    
    def __init__(self):
        self.compliance_log: List[Dict] = []
    
    def detect_jurisdictions(
        self,
        data_subject_location: str,
        requester_location: str,
        data_storage_location: str,
        company_hq_location: str = None
    ) -> List[Jurisdiction]:
        """
        Detect all applicable jurisdictions based on data flow.
        
        GDPR applies if:
        - Data subject is in EU
        - Data is processed in EU
        - Company offers services to EU residents
        
        Similar rules apply for other jurisdictions.
        """
        jurisdictions = set()
        
        # Map locations to jurisdictions
        for location in [data_subject_location, requester_location, data_storage_location]:
            if location:
                loc_upper = location.upper()
                if loc_upper in self.GEO_MAPPING:
                    jurisdictions.add(self.GEO_MAPPING[loc_upper])
                elif loc_upper == "EU":
                    jurisdictions.add(Jurisdiction.EU)
        
        # If no specific jurisdiction found, apply GLOBAL (most restrictive)
        if not jurisdictions:
            jurisdictions.add(Jurisdiction.GLOBAL)
        
        return list(jurisdictions)
    
    def get_strictest_requirements(
        self,
        jurisdictions: List[Jurisdiction]
    ) -> Dict[str, Any]:
        """
        Merge requirements from all applicable jurisdictions,
        always choosing the strictest option.
        """
        if Jurisdiction.GLOBAL in jurisdictions or not jurisdictions:
            # Apply most restrictive combination
            jurisdictions = [Jurisdiction.EU, Jurisdiction.INDIA]
        
        merged = {
            "consent_required": False,
            "explicit_consent_for_sensitive": False,
            "right_to_erasure": False,
            "data_portability": False,
            "breach_notification_hours": None,
            "dpo_required": False,
            "cross_border_restrictions": False,
            "profiling_opt_out": False,
            "automated_decision_rights": False,
            "purpose_limitation": "none",
            "data_minimization": False,
            "retention_limits": False
        }
        
        applicable_laws = []
        max_strictness = 0
        
        for jurisdiction in jurisdictions:
            if jurisdiction in self.PRIVACY_LAWS:
                law = self.PRIVACY_LAWS[jurisdiction]
                applicable_laws.append(law["name"])
                max_strictness = max(max_strictness, law["strictness_score"])
                
                reqs = law["requirements"]
                
                # Apply strictest boolean requirements (True is stricter)
                for key in ["consent_required", "explicit_consent_for_sensitive",
                           "right_to_erasure", "data_portability", "dpo_required",
                           "cross_border_restrictions", "profiling_opt_out",
                           "automated_decision_rights", "data_minimization",
                           "retention_limits"]:
                    if reqs.get(key, False):
                        merged[key] = True
                
                # For breach notification, take the shortest time
                if reqs.get("breach_notification_hours"):
                    if merged["breach_notification_hours"] is None:
                        merged["breach_notification_hours"] = reqs["breach_notification_hours"]
                    else:
                        merged["breach_notification_hours"] = min(
                            merged["breach_notification_hours"],
                            reqs["breach_notification_hours"]
                        )
                
                # For purpose limitation, take strictest
                purpose_strictness = {"none": 0, "moderate": 1, "strict": 2}
                current = purpose_strictness.get(merged["purpose_limitation"], 0)
                new = purpose_strictness.get(reqs.get("purpose_limitation", "none"), 0)
                if new > current:
                    merged["purpose_limitation"] = reqs["purpose_limitation"]
        
        return {
            "merged_requirements": merged,
            "applicable_laws": applicable_laws,
            "strictness_score": max_strictness,
            "jurisdictions": [j.value for j in jurisdictions]
        }
    
    def evaluate_compliance(
        self,
        request: Dict[str, Any],
        data_subject_location: str,
        requester_location: str
    ) -> Dict[str, Any]:
        """
        Evaluate a data access request against all applicable privacy laws.
        
        Returns compliance status and any required actions.
        """
        # Detect applicable jurisdictions
        jurisdictions = self.detect_jurisdictions(
            data_subject_location=data_subject_location,
            requester_location=requester_location,
            data_storage_location=request.get("data_storage_location", "US")
        )
        
        # Get strictest requirements
        requirements = self.get_strictest_requirements(jurisdictions)
        merged_reqs = requirements["merged_requirements"]
        
        compliance_issues = []
        required_actions = []
        
        # Check consent
        if merged_reqs["consent_required"]:
            if not request.get("consent_verified"):
                compliance_issues.append({
                    "issue": "CONSENT_REQUIRED",
                    "severity": "blocking",
                    "laws": requirements["applicable_laws"],
                    "message": "Explicit consent required but not verified"
                })
                required_actions.append("Obtain user consent before processing")
        
        # Check purpose limitation
        if merged_reqs["purpose_limitation"] == "strict":
            purpose = request.get("purpose", "")
            if purpose not in ["analytics", "research", "compliance", "audit", "operational"]:
                compliance_issues.append({
                    "issue": "PURPOSE_LIMITATION",
                    "severity": "warning",
                    "message": f"Purpose '{purpose}' may not meet strict purpose limitation"
                })
        
        # Check data minimization
        if merged_reqs["data_minimization"]:
            sensitivity = request.get("data_sensitivity", "low")
            if sensitivity == "high":
                required_actions.append("Apply data minimization - only collect necessary fields")
        
        # Check cross-border restrictions
        if merged_reqs["cross_border_restrictions"]:
            if data_subject_location != requester_location:
                compliance_issues.append({
                    "issue": "CROSS_BORDER_TRANSFER",
                    "severity": "warning",
                    "message": "Cross-border data transfer - ensure adequate safeguards"
                })
                required_actions.append("Verify Standard Contractual Clauses or adequacy decision")
        
        # Determine overall compliance
        blocking_issues = [i for i in compliance_issues if i.get("severity") == "blocking"]
        is_compliant = len(blocking_issues) == 0
        
        result = {
            "is_compliant": is_compliant,
            "jurisdictions": [j.value for j in jurisdictions],
            "applicable_laws": requirements["applicable_laws"],
            "strictness_score": requirements["strictness_score"],
            "requirements_applied": merged_reqs,
            "compliance_issues": compliance_issues,
            "required_actions": required_actions,
            "evaluated_at": datetime.utcnow().isoformat()
        }
        
        # Log compliance check
        self._log_compliance_check(request, result)
        
        return result
    
    def get_law_details(self, jurisdiction: Jurisdiction) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific privacy law."""
        return self.PRIVACY_LAWS.get(jurisdiction)
    
    def get_all_laws_summary(self) -> List[Dict[str, Any]]:
        """Get summary of all supported privacy laws."""
        return [
            {
                "jurisdiction": j.value,
                "name": law["name"],
                "full_name": law["full_name"],
                "region": law["region"],
                "strictness_score": law["strictness_score"]
            }
            for j, law in self.PRIVACY_LAWS.items()
        ]
    
    def _log_compliance_check(self, request: Dict, result: Dict):
        """Log compliance check for audit."""
        self.compliance_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            "request_summary": {
                "requester_id": request.get("requester_id"),
                "purpose": request.get("purpose"),
                "sensitivity": request.get("data_sensitivity")
            },
            "result_summary": {
                "is_compliant": result["is_compliant"],
                "applicable_laws": result["applicable_laws"],
                "issues_count": len(result["compliance_issues"])
            }
        })
        
        # Keep only last 1000 entries
        if len(self.compliance_log) > 1000:
            self.compliance_log = self.compliance_log[-1000:]
    
    def get_compliance_report(self, limit: int = 50) -> Dict[str, Any]:
        """Generate compliance report."""
        recent = self.compliance_log[-limit:]
        
        compliant_count = sum(1 for r in recent if r["result_summary"]["is_compliant"])
        
        laws_applied = {}
        for r in recent:
            for law in r["result_summary"]["applicable_laws"]:
                laws_applied[law] = laws_applied.get(law, 0) + 1
        
        return {
            "total_checks": len(recent),
            "compliant_requests": compliant_count,
            "compliance_rate": round(compliant_count / len(recent) * 100, 2) if recent else 0,
            "laws_applied": laws_applied,
            "recent_checks": recent[-10:]
        }


# Singleton instance
legal_compliance_engine = LegalComplianceEngine()
