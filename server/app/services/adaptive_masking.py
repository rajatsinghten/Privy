"""
Adaptive Masking Service - Risk-Based Data Anonymization.

Automatically swaps real data for synthetic or anonymized data 
based on the requester's risk level and data sensitivity.
"""

from datetime import datetime, date
from typing import Dict, Any, List, Optional
import hashlib
import random
import string
import re


class AdaptiveMaskingEngine:
    """
    Adaptive data masking that adjusts anonymization level based on:
    1. Requester's risk score
    2. Data sensitivity level
    3. Purpose of access
    4. Jurisdiction requirements
    """
    
    # Masking levels based on risk score thresholds
    MASKING_LEVELS = {
        "none": {"min_risk": 0.0, "max_risk": 0.2},      # Full data access
        "light": {"min_risk": 0.2, "max_risk": 0.4},     # Partial masking
        "moderate": {"min_risk": 0.4, "max_risk": 0.6},  # Significant masking
        "heavy": {"min_risk": 0.6, "max_risk": 0.8},     # Heavy anonymization
        "full": {"min_risk": 0.8, "max_risk": 1.0}       # Synthetic data only
    }
    
    # Field-specific masking strategies
    MASKING_STRATEGIES = {
        "email": ["hash", "domain_only", "synthetic", "redact"],
        "phone": ["partial", "hash", "synthetic", "redact"],
        "ssn": ["partial", "hash", "redact"],
        "name": ["initials", "pseudonym", "synthetic", "redact"],
        "address": ["city_only", "region_only", "synthetic", "redact"],
        "dob": ["year_only", "age_range", "synthetic", "redact"],
        "ip_address": ["subnet", "hash", "synthetic", "redact"],
        "credit_card": ["last_four", "hash", "redact"],
        "medical": ["category_only", "synthetic", "redact"],
        "financial": ["range", "synthetic", "redact"],
        "generic": ["partial", "hash", "synthetic", "redact"]
    }
    
    # Synthetic data generators
    SYNTHETIC_NAMES = [
        "Alex Johnson", "Jordan Smith", "Casey Williams", "Morgan Brown",
        "Riley Davis", "Quinn Miller", "Avery Wilson", "Cameron Moore"
    ]
    
    SYNTHETIC_DOMAINS = ["example.com", "test.org", "demo.net", "sample.io"]
    
    def __init__(self):
        self.masking_log: List[Dict] = []
    
    def determine_masking_level(self, risk_score: float) -> str:
        """Determine the masking level based on risk score."""
        for level, thresholds in self.MASKING_LEVELS.items():
            if thresholds["min_risk"] <= risk_score < thresholds["max_risk"]:
                return level
        return "full"
    
    def get_strategy_for_level(self, field_type: str, masking_level: str) -> str:
        """Get the appropriate masking strategy for a field type and level."""
        strategies = self.MASKING_STRATEGIES.get(field_type, self.MASKING_STRATEGIES["generic"])
        
        level_to_index = {
            "none": -1,  # No masking
            "light": 0,
            "moderate": 1,
            "heavy": 2,
            "full": 3
        }
        
        idx = level_to_index.get(masking_level, 3)
        
        if idx < 0:
            return "none"
        
        # Clamp index to available strategies
        idx = min(idx, len(strategies) - 1)
        return strategies[idx]
    
    def mask_data(
        self,
        data: Dict[str, Any],
        field_types: Dict[str, str],
        risk_score: float,
        requester_id: str,
        purpose: str
    ) -> Dict[str, Any]:
        """
        Apply adaptive masking to data based on risk score.
        
        Args:
            data: The original data dictionary
            field_types: Mapping of field names to their types (email, phone, etc.)
            risk_score: The calculated risk score (0-1)
            requester_id: Who is requesting the data
            purpose: Purpose of the data access
            
        Returns:
            Masked data dictionary
        """
        masking_level = self.determine_masking_level(risk_score)
        masked_data = {}
        masking_details = {}
        
        for field, value in data.items():
            field_type = field_types.get(field, "generic")
            strategy = self.get_strategy_for_level(field_type, masking_level)
            
            if strategy == "none":
                masked_data[field] = value
                masking_details[field] = {"strategy": "none", "original_preserved": True}
            else:
                masked_value = self._apply_masking(value, field_type, strategy)
                masked_data[field] = masked_value
                masking_details[field] = {
                    "strategy": strategy,
                    "field_type": field_type,
                    "original_preserved": False
                }
        
        # Log the masking operation
        self._log_masking(
            requester_id=requester_id,
            purpose=purpose,
            risk_score=risk_score,
            masking_level=masking_level,
            fields_masked=list(masking_details.keys()),
            strategies_used=masking_details
        )
        
        return {
            "data": masked_data,
            "masking_applied": {
                "level": masking_level,
                "risk_score": risk_score,
                "fields_processed": len(data),
                "details": masking_details
            }
        }
    
    def _apply_masking(self, value: Any, field_type: str, strategy: str) -> Any:
        """Apply a specific masking strategy to a value."""
        if value is None:
            return None
        
        value_str = str(value)
        
        # Strategy implementations
        if strategy == "redact":
            return "[REDACTED]"
        
        elif strategy == "hash":
            return self._hash_value(value_str)
        
        elif strategy == "partial":
            return self._partial_mask(value_str)
        
        elif strategy == "synthetic":
            return self._generate_synthetic(field_type)
        
        elif strategy == "domain_only":
            return self._extract_domain(value_str)
        
        elif strategy == "last_four":
            return self._last_n_chars(value_str, 4)
        
        elif strategy == "initials":
            return self._to_initials(value_str)
        
        elif strategy == "pseudonym":
            return self._generate_pseudonym(value_str)
        
        elif strategy == "city_only":
            return self._extract_city(value_str)
        
        elif strategy == "region_only":
            return "[Region Hidden]"
        
        elif strategy == "year_only":
            return self._extract_year(value_str)
        
        elif strategy == "age_range":
            return self._to_age_range(value_str)
        
        elif strategy == "subnet":
            return self._mask_ip(value_str)
        
        elif strategy == "category_only":
            return "[Category: Medical]"
        
        elif strategy == "range":
            return self._to_range(value_str)
        
        return "[MASKED]"
    
    def _hash_value(self, value: str) -> str:
        """Create a deterministic hash of the value."""
        hash_obj = hashlib.sha256(value.encode())
        return f"HASH_{hash_obj.hexdigest()[:12]}"
    
    def _partial_mask(self, value: str, visible_chars: int = 3) -> str:
        """Partially mask a value, showing only first few characters."""
        if len(value) <= visible_chars:
            return "*" * len(value)
        return value[:visible_chars] + "*" * (len(value) - visible_chars)
    
    def _generate_synthetic(self, field_type: str) -> str:
        """Generate synthetic data based on field type."""
        if field_type == "email":
            name = ''.join(random.choices(string.ascii_lowercase, k=8))
            domain = random.choice(self.SYNTHETIC_DOMAINS)
            return f"{name}@{domain}"
        
        elif field_type == "phone":
            return f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        
        elif field_type == "name":
            return random.choice(self.SYNTHETIC_NAMES)
        
        elif field_type == "ssn":
            return f"XXX-XX-{random.randint(1000, 9999)}"
        
        elif field_type == "address":
            return f"{random.randint(100, 999)} Synthetic Street, Demo City, ST 00000"
        
        elif field_type == "dob":
            return f"{random.randint(1950, 2000)}-01-01"
        
        elif field_type == "ip_address":
            return f"10.0.{random.randint(0, 255)}.{random.randint(0, 255)}"
        
        elif field_type == "credit_card":
            return "XXXX-XXXX-XXXX-0000"
        
        return f"[SYNTHETIC_{field_type.upper()}]"
    
    def _extract_domain(self, email: str) -> str:
        """Extract domain from email."""
        if "@" in email:
            return f"***@{email.split('@')[1]}"
        return "[MASKED_EMAIL]"
    
    def _last_n_chars(self, value: str, n: int) -> str:
        """Show only last N characters."""
        if len(value) <= n:
            return "*" * len(value)
        return "*" * (len(value) - n) + value[-n:]
    
    def _to_initials(self, name: str) -> str:
        """Convert name to initials."""
        parts = name.split()
        return ".".join([p[0].upper() for p in parts if p]) + "."
    
    def _generate_pseudonym(self, value: str) -> str:
        """Generate a consistent pseudonym."""
        hash_val = hashlib.md5(value.encode()).hexdigest()[:8]
        return f"User_{hash_val}"
    
    def _extract_city(self, address: str) -> str:
        """Extract just city indication."""
        return "[City Level Only]"
    
    def _extract_year(self, date_str: str) -> str:
        """Extract year from date."""
        match = re.search(r'\d{4}', date_str)
        if match:
            return match.group()
        return "[YEAR]"
    
    def _to_age_range(self, date_str: str) -> str:
        """Convert DOB to age range."""
        try:
            year = int(re.search(r'\d{4}', date_str).group())
            age = datetime.now().year - year
            
            if age < 18:
                return "Under 18"
            elif age < 30:
                return "18-29"
            elif age < 45:
                return "30-44"
            elif age < 60:
                return "45-59"
            else:
                return "60+"
        except:
            return "[AGE_RANGE]"
    
    def _mask_ip(self, ip: str) -> str:
        """Mask IP address to subnet level."""
        parts = ip.split(".")
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.0.0/16"
        return "[MASKED_IP]"
    
    def _to_range(self, value: str) -> str:
        """Convert numeric value to a range."""
        try:
            num = float(re.sub(r'[^\d.]', '', value))
            if num < 1000:
                return "$0-$1,000"
            elif num < 10000:
                return "$1,000-$10,000"
            elif num < 100000:
                return "$10,000-$100,000"
            else:
                return "$100,000+"
        except:
            return "[RANGE]"
    
    def _log_masking(self, **kwargs):
        """Log masking operation for audit."""
        self.masking_log.append({
            "timestamp": datetime.utcnow().isoformat(),
            **kwargs
        })
        
        # Keep only last 1000 entries
        if len(self.masking_log) > 1000:
            self.masking_log = self.masking_log[-1000:]
    
    def get_masking_stats(self) -> Dict[str, Any]:
        """Get masking statistics."""
        if not self.masking_log:
            return {"total_operations": 0}
        
        levels_count = {}
        for log in self.masking_log:
            level = log.get("masking_level", "unknown")
            levels_count[level] = levels_count.get(level, 0) + 1
        
        return {
            "total_operations": len(self.masking_log),
            "by_level": levels_count,
            "recent_operations": self.masking_log[-10:]
        }


# Singleton instance
adaptive_masking_engine = AdaptiveMaskingEngine()
