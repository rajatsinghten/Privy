#!/usr/bin/env python3
"""
Database Seed Script for Privy Demo
Creates demo users with Indian names and sample data.

Usage:
  python seed_db.py
"""

import sys
import os

# Add server directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, SessionLocal, Base
from app.models.audit_log import AuditLog
from datetime import datetime, timedelta
import random
import uuid


# Sample audit log entries for demo
SAMPLE_LOGS = [
    {"requester_id": "rajat", "requester_role": "admin", "purpose": "analytics", "location": "Bengaluru", "data_sensitivity": "medium", "decision": "ALLOW", "reason": "Admin access granted", "risk_score": 0.2},
    {"requester_id": "priya", "requester_role": "analyst", "purpose": "fraud_detection", "location": "Mumbai", "data_sensitivity": "high", "decision": "ALLOW", "reason": "Valid purpose for role", "risk_score": 0.35},
    {"requester_id": "arjun", "requester_role": "analyst", "purpose": "marketing", "location": "Delhi", "data_sensitivity": "high", "decision": "DENY", "reason": "Purpose not permitted for PII", "risk_score": 0.75},
    {"requester_id": "kavya", "requester_role": "external", "purpose": "research", "location": "Chennai", "data_sensitivity": "low", "decision": "ALLOW", "reason": "Anonymized data allowed", "risk_score": 0.3},
    {"requester_id": "vikram", "requester_role": "external", "purpose": "external_audit", "location": "Hyderabad", "data_sensitivity": "critical", "decision": "DENY", "reason": "External access to critical data blocked", "risk_score": 0.95},
    {"requester_id": "rajat", "requester_role": "admin", "purpose": "administration", "location": "Bengaluru", "data_sensitivity": "low", "decision": "ALLOW", "reason": "Admin operation", "risk_score": 0.1},
    {"requester_id": "priya", "requester_role": "analyst", "purpose": "reporting", "location": "Mumbai", "data_sensitivity": "medium", "decision": "ALLOW", "reason": "Aggregated data export", "risk_score": 0.25},
    {"requester_id": "arjun", "requester_role": "analyst", "purpose": "analytics", "location": "Delhi", "data_sensitivity": "medium", "decision": "ALLOW", "reason": "Purpose aligned with role", "risk_score": 0.3},
    {"requester_id": "kavya", "requester_role": "external", "purpose": "ai_training", "location": "Chennai", "data_sensitivity": "high", "decision": "DENY", "reason": "AI training requires consent", "risk_score": 0.85},
    {"requester_id": "vikram", "requester_role": "external", "purpose": "integration", "location": "Hyderabad", "data_sensitivity": "low", "decision": "ALLOW", "reason": "Public API access", "risk_score": 0.2},
]


def clear_database():
    """Drop all tables and recreate them."""
    print("Clearing database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database cleared and tables recreated")


def seed_audit_logs():
    """Seed the database with sample audit logs."""
    print("\nSeeding audit logs...")
    db = SessionLocal()
    
    try:
        for i, log in enumerate(SAMPLE_LOGS * 5):
            days_ago = random.randint(0, 30)
            hours_ago = random.randint(0, 23)
            timestamp = datetime.utcnow() - timedelta(days=days_ago, hours=hours_ago)
            
            audit = AuditLog(
                timestamp=timestamp,
                requester_id=log["requester_id"],
                requester_role=log["requester_role"],
                purpose=log["purpose"],
                location=log["location"],
                data_sensitivity=log["data_sensitivity"],
                decision=log["decision"],
                reason=log["reason"],
                risk_score=log["risk_score"] + random.uniform(-0.1, 0.1),
                request_metadata={"ip": f"192.168.{random.randint(1,255)}.{random.randint(1,255)}", "session": str(uuid.uuid4())[:8]}
            )
            db.add(audit)
        
        db.commit()
        print("Seeded 50 audit log entries")
    except Exception as e:
        print(f"Error seeding audit logs: {e}")
        db.rollback()
    finally:
        db.close()


def print_demo_credentials():
    """Print demo user credentials for easy reference."""
    print("\n" + "=" * 60)
    print("  DEMO USER CREDENTIALS")
    print("=" * 60)
    print("\n  Use these credentials to login to the Privy dashboard:\n")
    print(f"  {'Username':<12} {'Password':<15} {'Role':<10} {'Name'}")
    print(f"  {'-'*12} {'-'*15} {'-'*10} {'-'*20}")
    users = [
        ("rajat", "rajat123", "admin", "Rajat Sharma"),
        ("priya", "priya123", "analyst", "Priya Patel"),
        ("arjun", "arjun123", "analyst", "Arjun Mehta"),
        ("kavya", "kavya123", "external", "Kavya Krishnan"),
        ("vikram", "vikram123", "external", "Vikram Reddy"),
    ]
    for u, p, r, n in users:
        print(f"  {u:<12} {p:<15} {r:<10} {n}")
    print("\n" + "=" * 60)


def main():
    """Main function to seed the database."""
    print("\n" + "=" * 60)
    print("  PRIVY DATABASE SEED SCRIPT")
    print("=" * 60)
    
    clear_database()
    seed_audit_logs()
    print_demo_credentials()
    
    print("\nDatabase seeding complete!\n")


if __name__ == "__main__":
    main()
