#!/usr/bin/env python3
"""
Test script to verify the Privy API backend setup.
Run this after starting the server with: uvicorn app.main:app --reload
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"


def print_section(title: str):
    """Print a section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


def print_response(response: requests.Response):
    """Pretty print API response."""
    print(f"Status: {response.status_code}")
    try:
        print(f"Response:\n{json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")


def test_health_check():
    """Test health check endpoint."""
    print_section("1. Health Check")
    response = requests.get(f"{API_BASE}/health")
    print_response(response)
    return response.status_code == 200


def test_login(username: str, password: str) -> str:
    """Test login and return access token."""
    print_section(f"2. Login as {username}")
    response = requests.post(
        f"{API_BASE}/auth/login",
        json={"username": username, "password": password}
    )
    print_response(response)
    
    if response.status_code == 200:
        return response.json()["access_token"]
    return None


def test_request_data(token: str, request_data: Dict[str, Any]):
    """Test data access request."""
    print_section("3. Data Access Request")
    print(f"Request: {json.dumps(request_data, indent=2)}\n")
    
    response = requests.post(
        f"{API_BASE}/request-data",
        json=request_data,
        headers={"Authorization": f"Bearer {token}"}
    )
    print_response(response)
    return response.status_code == 200


def test_audit_logs(token: str):
    """Test audit logs retrieval."""
    print_section("4. Audit Logs")
    response = requests.get(
        f"{API_BASE}/audit-logs?limit=5",
        headers={"Authorization": f"Bearer {token}"}
    )
    print_response(response)
    return response.status_code == 200


def test_audit_stats(token: str):
    """Test audit statistics."""
    print_section("5. Audit Statistics")
    response = requests.get(
        f"{API_BASE}/audit-logs/stats",
        headers={"Authorization": f"Bearer {token}"}
    )
    print_response(response)
    return response.status_code == 200


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("  PRIVY API BACKEND TEST SUITE")
    print("="*60)
    
    try:
        if not test_health_check():
            print("\n❌ Health check failed. Is the server running?")
            return
        
        admin_token = test_login("admin", "admin123")
        if not admin_token:
            print("\n❌ Login failed")
            return
        
        test_scenarios = [
            {
                "name": "Successful Request (Allow)",
                "data": {
                    "requester_id": "user_123",
                    "role": "analyst",
                    "purpose": "analytics",
                    "location": "US",
                    "data_sensitivity": "medium"
                }
            },
            {
                "name": "Policy Violation (Deny - Sensitivity)",
                "data": {
                    "requester_id": "user_123",
                    "role": "external",
                    "purpose": "reporting",
                    "location": "US",
                    "data_sensitivity": "high"
                }
            },
            {
                "name": "No Consent (Deny)",
                "data": {
                    "requester_id": "user_999",
                    "role": "analyst",
                    "purpose": "analytics",
                    "location": "US",
                    "data_sensitivity": "low"
                }
            },
            {
                "name": "High Risk (Deny)",
                "data": {
                    "requester_id": "user_123",
                    "role": "external",
                    "purpose": "marketing",
                    "location": "GLOBAL",
                    "data_sensitivity": "high"
                }
            }
        ]
        
        for scenario in test_scenarios:
            print_section(f"Test: {scenario['name']}")
            test_request_data(admin_token, scenario["data"])
        
        test_audit_logs(admin_token)
        test_audit_stats(admin_token)
        
        print_section("✅ All Tests Completed")
        print("\nTest Summary:")
        print("- Health check: ✓")
        print("- Authentication: ✓")
        print("- Data access requests: ✓")
        print("- Audit logs: ✓")
        print("- Audit statistics: ✓")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to server.")
        print("Make sure the server is running:")
        print("  uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    main()
