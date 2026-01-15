"""
Self-Destructing Token Service - AI Task-Scoped Tokens that expire after use.

These tokens are designed for AI/ML pipeline access where data should only be
accessible for the duration of a single task execution.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import JWTError, jwt
import secrets
import hashlib
from app.core.config import get_settings

settings = get_settings()


class SelfDestructingTokenManager:
    """
    Manages self-destructing tokens that expire after:
    1. Single use (one-time tokens)
    2. Task completion signal
    3. Maximum TTL (time-to-live)
    """
    
    def __init__(self):
        # In-memory store for active tokens (use Redis in production)
        self.active_tokens: Dict[str, Dict[str, Any]] = {}
        # Revoked tokens (blacklist)
        self.revoked_tokens: set = set()
        
    def generate_task_token(
        self,
        user_id: str,
        task_id: str,
        task_type: str,
        max_ttl_seconds: int = 300,  # 5 minutes default
        max_uses: int = 1,
        data_scope: list = None
    ) -> Dict[str, Any]:
        """
        Generate a self-destructing token for an AI task.
        
        Args:
            user_id: The user requesting the token
            task_id: Unique identifier for the AI task
            task_type: Type of AI task (inference, training, analysis)
            max_ttl_seconds: Maximum time-to-live in seconds
            max_uses: Maximum number of uses (default: 1 for single-use)
            data_scope: List of data fields this token can access
        
        Returns:
            Token details including the JWT and metadata
        """
        token_id = secrets.token_urlsafe(32)
        issued_at = datetime.utcnow()
        expires_at = issued_at + timedelta(seconds=max_ttl_seconds)
        
        # Create JWT payload
        payload = {
            "token_id": token_id,
            "user_id": user_id,
            "task_id": task_id,
            "task_type": task_type,
            "data_scope": data_scope or ["*"],
            "iat": issued_at,
            "exp": expires_at,
            "max_uses": max_uses,
            "self_destruct": True
        }
        
        # Generate the JWT
        token = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)
        
        # Store token metadata for tracking
        self.active_tokens[token_id] = {
            "user_id": user_id,
            "task_id": task_id,
            "task_type": task_type,
            "issued_at": issued_at,
            "expires_at": expires_at,
            "max_uses": max_uses,
            "current_uses": 0,
            "data_scope": data_scope or ["*"],
            "status": "active",
            "access_log": []
        }
        
        return {
            "token": token,
            "token_id": token_id,
            "task_id": task_id,
            "expires_at": expires_at.isoformat(),
            "max_ttl_seconds": max_ttl_seconds,
            "max_uses": max_uses,
            "data_scope": data_scope or ["*"],
            "self_destruct_policy": {
                "on_expiry": True,
                "on_max_uses": True,
                "on_task_complete": True
            }
        }
    
    def validate_and_consume(self, token: str) -> Dict[str, Any]:
        """
        Validate a self-destructing token and consume one use.
        
        Returns:
            Validation result with remaining uses or destruction status
        """
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            token_id = payload.get("token_id")
            
            # Check if token is revoked
            if token_id in self.revoked_tokens:
                return {
                    "valid": False,
                    "reason": "Token has been destroyed (revoked)",
                    "destroyed": True
                }
            
            # Check if token exists in active store
            if token_id not in self.active_tokens:
                return {
                    "valid": False,
                    "reason": "Token not found or already destroyed",
                    "destroyed": True
                }
            
            token_data = self.active_tokens[token_id]
            
            # Check expiry
            if datetime.utcnow() > token_data["expires_at"]:
                self._destroy_token(token_id, "TTL expired")
                return {
                    "valid": False,
                    "reason": "Token self-destructed (TTL expired)",
                    "destroyed": True
                }
            
            # Check usage count
            if token_data["current_uses"] >= token_data["max_uses"]:
                self._destroy_token(token_id, "Max uses reached")
                return {
                    "valid": False,
                    "reason": "Token self-destructed (max uses reached)",
                    "destroyed": True
                }
            
            # Consume one use
            token_data["current_uses"] += 1
            token_data["access_log"].append({
                "timestamp": datetime.utcnow().isoformat(),
                "action": "data_access",
                "remaining_uses": token_data["max_uses"] - token_data["current_uses"]
            })
            
            remaining_uses = token_data["max_uses"] - token_data["current_uses"]
            
            # Auto-destroy if this was the last use
            if remaining_uses == 0:
                self._destroy_token(token_id, "All uses consumed")
                return {
                    "valid": True,
                    "reason": "Token consumed and self-destructed",
                    "destroyed": True,
                    "data_scope": payload.get("data_scope"),
                    "task_id": payload.get("task_id")
                }
            
            return {
                "valid": True,
                "reason": f"Token valid. {remaining_uses} uses remaining.",
                "destroyed": False,
                "remaining_uses": remaining_uses,
                "data_scope": payload.get("data_scope"),
                "task_id": payload.get("task_id"),
                "user_id": payload.get("user_id")
            }
            
        except JWTError as e:
            return {
                "valid": False,
                "reason": f"Invalid token: {str(e)}",
                "destroyed": False
            }
    
    def complete_task(self, task_id: str) -> Dict[str, Any]:
        """
        Signal task completion - destroys all tokens associated with the task.
        
        Args:
            task_id: The task that has completed
            
        Returns:
            Destruction summary
        """
        destroyed_tokens = []
        
        for token_id, token_data in list(self.active_tokens.items()):
            if token_data.get("task_id") == task_id:
                self._destroy_token(token_id, f"Task {task_id} completed")
                destroyed_tokens.append(token_id)
        
        return {
            "task_id": task_id,
            "tokens_destroyed": len(destroyed_tokens),
            "destruction_reason": "task_completion",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _destroy_token(self, token_id: str, reason: str):
        """Internal method to destroy a token."""
        if token_id in self.active_tokens:
            token_data = self.active_tokens[token_id]
            token_data["status"] = "destroyed"
            token_data["destroyed_at"] = datetime.utcnow()
            token_data["destruction_reason"] = reason
            
            # Move to revoked list
            self.revoked_tokens.add(token_id)
            
            # Remove from active (keep for audit if needed)
            del self.active_tokens[token_id]
    
    def get_token_status(self, token_id: str) -> Dict[str, Any]:
        """Get the current status of a token."""
        if token_id in self.revoked_tokens:
            return {"status": "destroyed", "token_id": token_id}
        
        if token_id in self.active_tokens:
            data = self.active_tokens[token_id]
            return {
                "status": data["status"],
                "token_id": token_id,
                "remaining_uses": data["max_uses"] - data["current_uses"],
                "expires_at": data["expires_at"].isoformat(),
                "task_id": data["task_id"]
            }
        
        return {"status": "not_found", "token_id": token_id}
    
    def get_active_tokens_for_user(self, user_id: str) -> list:
        """Get all active tokens for a user."""
        return [
            {
                "token_id": tid,
                "task_id": data["task_id"],
                "remaining_uses": data["max_uses"] - data["current_uses"],
                "expires_at": data["expires_at"].isoformat()
            }
            for tid, data in self.active_tokens.items()
            if data["user_id"] == user_id
        ]


# Singleton instance
self_destructing_token_manager = SelfDestructingTokenManager()
