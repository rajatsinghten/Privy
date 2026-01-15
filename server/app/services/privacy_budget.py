"""
Privacy Budget (ε) Service - Differential Privacy Budget Management.

Implements a mathematical limit that prevents "re-identification attacks" 
by blocking excessive queries on specific users. Based on differential 
privacy principles.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from collections import defaultdict
import math
import hashlib


class PrivacyBudgetManager:
    """
    Manages privacy budgets (epsilon, ε) for differential privacy enforcement.
    
    Each user has a privacy budget that depletes with each query. Once exhausted,
    no more queries are allowed until the budget resets, preventing re-identification
    attacks through excessive querying.
    """
    
    # Default epsilon budget per user per time window
    DEFAULT_EPSILON_BUDGET = 1.0
    
    # Budget reset window (24 hours by default)
    BUDGET_RESET_HOURS = 24
    
    # Query costs based on sensitivity and aggregation level
    QUERY_EPSILON_COSTS = {
        "aggregate": {
            "low": 0.01,
            "medium": 0.05,
            "high": 0.1
        },
        "individual": {
            "low": 0.1,
            "medium": 0.25,
            "high": 0.5
        },
        "raw": {
            "low": 0.3,
            "medium": 0.5,
            "high": 1.0
        }
    }
    
    def __init__(self):
        # Privacy budget tracking per data subject
        # Structure: {subject_id: {budget_info}}
        self.budgets: Dict[str, Dict[str, Any]] = {}
        
        # Query history for audit
        self.query_history: Dict[str, List[Dict]] = defaultdict(list)
        
        # Blocked requesters (temporary ban for budget abuse)
        self.blocked_requesters: Dict[str, datetime] = {}
    
    def _get_or_create_budget(self, subject_id: str) -> Dict[str, Any]:
        """Get or initialize budget for a data subject."""
        if subject_id not in self.budgets:
            self.budgets[subject_id] = {
                "total_budget": self.DEFAULT_EPSILON_BUDGET,
                "remaining_budget": self.DEFAULT_EPSILON_BUDGET,
                "window_start": datetime.utcnow(),
                "queries_count": 0,
                "last_query": None,
                "alert_level": "normal"
            }
        
        # Check if budget should reset
        budget = self.budgets[subject_id]
        window_end = budget["window_start"] + timedelta(hours=self.BUDGET_RESET_HOURS)
        
        if datetime.utcnow() > window_end:
            # Reset budget for new window
            budget["remaining_budget"] = budget["total_budget"]
            budget["window_start"] = datetime.utcnow()
            budget["queries_count"] = 0
            budget["alert_level"] = "normal"
        
        return budget
    
    def calculate_query_cost(
        self,
        query_type: str,
        data_sensitivity: str,
        num_records: int = 1
    ) -> float:
        """
        Calculate the epsilon cost of a query.
        
        Args:
            query_type: Type of query (aggregate, individual, raw)
            data_sensitivity: Sensitivity level (low, medium, high)
            num_records: Number of records being queried
            
        Returns:
            Epsilon cost for this query
        """
        base_cost = self.QUERY_EPSILON_COSTS.get(
            query_type, {}
        ).get(data_sensitivity, 0.25)
        
        # Scale cost logarithmically with number of records
        if num_records > 1:
            scale_factor = 1 + (math.log(num_records) / 10)
            return base_cost * scale_factor
        
        return base_cost
    
    def check_and_consume_budget(
        self,
        subject_id: str,
        requester_id: str,
        query_type: str = "individual",
        data_sensitivity: str = "medium",
        num_records: int = 1,
        purpose: str = "analytics"
    ) -> Dict[str, Any]:
        """
        Check if query is allowed and consume budget if so.
        
        Args:
            subject_id: The data subject whose data is being queried
            requester_id: Who is making the query
            query_type: Type of query (aggregate, individual, raw)
            data_sensitivity: Sensitivity of the data
            num_records: Number of records
            purpose: Purpose of the query
            
        Returns:
            Decision with remaining budget info
        """
        # Check if requester is blocked
        if requester_id in self.blocked_requesters:
            block_until = self.blocked_requesters[requester_id]
            if datetime.utcnow() < block_until:
                return {
                    "allowed": False,
                    "reason": "Requester temporarily blocked for privacy budget abuse",
                    "blocked_until": block_until.isoformat(),
                    "budget_remaining": 0
                }
            else:
                del self.blocked_requesters[requester_id]
        
        budget = self._get_or_create_budget(subject_id)
        query_cost = self.calculate_query_cost(query_type, data_sensitivity, num_records)
        
        # Check if enough budget remains
        if budget["remaining_budget"] < query_cost:
            # Set alert level
            budget["alert_level"] = "exhausted"
            
            # Log the blocked query
            self._log_query(
                subject_id, requester_id, query_cost, 
                False, "Budget exhausted", purpose
            )
            
            # Calculate when budget resets
            reset_time = budget["window_start"] + timedelta(hours=self.BUDGET_RESET_HOURS)
            
            return {
                "allowed": False,
                "reason": f"Privacy budget exhausted for subject {subject_id}. " +
                         f"Required: {query_cost:.4f}ε, Available: {budget['remaining_budget']:.4f}ε",
                "budget_remaining": budget["remaining_budget"],
                "budget_resets_at": reset_time.isoformat(),
                "query_cost": query_cost,
                "alert_level": "exhausted"
            }
        
        # Consume budget
        budget["remaining_budget"] -= query_cost
        budget["queries_count"] += 1
        budget["last_query"] = datetime.utcnow()
        
        # Set alert levels
        budget_percentage = budget["remaining_budget"] / budget["total_budget"]
        if budget_percentage < 0.1:
            budget["alert_level"] = "critical"
        elif budget_percentage < 0.3:
            budget["alert_level"] = "warning"
        
        # Log successful query
        self._log_query(
            subject_id, requester_id, query_cost,
            True, "Budget consumed", purpose
        )
        
        return {
            "allowed": True,
            "reason": f"Query allowed. Budget consumed: {query_cost:.4f}ε",
            "budget_remaining": budget["remaining_budget"],
            "budget_total": budget["total_budget"],
            "budget_percentage": round(budget_percentage * 100, 2),
            "query_cost": query_cost,
            "queries_count": budget["queries_count"],
            "alert_level": budget["alert_level"],
            "window_resets_at": (
                budget["window_start"] + timedelta(hours=self.BUDGET_RESET_HOURS)
            ).isoformat()
        }
    
    def _log_query(
        self,
        subject_id: str,
        requester_id: str,
        cost: float,
        allowed: bool,
        reason: str,
        purpose: str
    ):
        """Log query for audit purposes."""
        self.query_history[subject_id].append({
            "timestamp": datetime.utcnow().isoformat(),
            "requester_id": requester_id,
            "cost": cost,
            "allowed": allowed,
            "reason": reason,
            "purpose": purpose
        })
        
        # Keep only last 1000 queries per subject
        if len(self.query_history[subject_id]) > 1000:
            self.query_history[subject_id] = self.query_history[subject_id][-1000:]
    
    def get_budget_status(self, subject_id: str) -> Dict[str, Any]:
        """Get current budget status for a subject."""
        budget = self._get_or_create_budget(subject_id)
        reset_time = budget["window_start"] + timedelta(hours=self.BUDGET_RESET_HOURS)
        
        return {
            "subject_id": subject_id,
            "total_budget": budget["total_budget"],
            "remaining_budget": round(budget["remaining_budget"], 4),
            "budget_percentage": round(
                (budget["remaining_budget"] / budget["total_budget"]) * 100, 2
            ),
            "queries_count": budget["queries_count"],
            "window_start": budget["window_start"].isoformat(),
            "window_resets_at": reset_time.isoformat(),
            "alert_level": budget["alert_level"],
            "last_query": budget["last_query"].isoformat() if budget["last_query"] else None
        }
    
    def set_custom_budget(
        self,
        subject_id: str,
        epsilon_budget: float,
        reset_hours: int = 24
    ) -> Dict[str, Any]:
        """Set a custom privacy budget for a subject (admin function)."""
        self.budgets[subject_id] = {
            "total_budget": epsilon_budget,
            "remaining_budget": epsilon_budget,
            "window_start": datetime.utcnow(),
            "queries_count": 0,
            "last_query": None,
            "alert_level": "normal",
            "custom_reset_hours": reset_hours
        }
        
        return {
            "subject_id": subject_id,
            "new_budget": epsilon_budget,
            "reset_hours": reset_hours,
            "status": "Budget updated"
        }
    
    def get_query_history(
        self,
        subject_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get query history for a subject."""
        history = self.query_history.get(subject_id, [])
        return history[-limit:]
    
    def block_requester(self, requester_id: str, hours: int = 1):
        """Temporarily block a requester for privacy abuse."""
        self.blocked_requesters[requester_id] = datetime.utcnow() + timedelta(hours=hours)
    
    def get_all_budgets_summary(self) -> List[Dict[str, Any]]:
        """Get summary of all privacy budgets (admin function)."""
        return [
            self.get_budget_status(subject_id)
            for subject_id in self.budgets.keys()
        ]


# Singleton instance
privacy_budget_manager = PrivacyBudgetManager()
