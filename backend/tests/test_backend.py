import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OPERATIONAL"

def test_standalone_ml_prediction():
    payload = {
        "rainfall": 210.0,
        "wind_speed": 40.0,
        "water_level": 4.0,
        "humidity": 90.0,
        "historical_indicator": 0.8,
        "severity": 4,
        "affected_population": 300
    }
    response = client.post("/api/v1/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert data["risk_score"] > 60
    assert len(data["risk_explanation"]) > 0

def test_auth_login_all_roles():
    roles_credentials = [
        ("citizen@disaster.org", "password123", "citizen"),
        ("admin@disaster.org", "admin123", "admin"),
        ("rescue@disaster.org", "rescue123", "rescue"),
        ("coordinator@disaster.org", "coordinator123", "coordinator")
    ]
    
    for email, pwd, expected_role in roles_credentials:
        res = client.post("/api/v1/auth/login", json={"email": email, "password": pwd})
        assert res.status_code == 200, f"Failed login for {email}"
        token_data = res.json()
        assert "access_token" in token_data
        assert token_data["user"]["role"] == expected_role

def test_citizen_incident_reporting_workflow():
    # Login citizen
    login_res = client.post("/api/v1/auth/login", json={"email": "citizen@disaster.org", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    incident_payload = {
        "disaster_type": "Flood",
        "description": "Flash flooding near Tirupati highway bridge.",
        "latitude": 13.6288,
        "longitude": 79.4192,
        "location_name": "Tirupati Highway Sector",
        "severity": 4,
        "affected_population": 250,
        "rainfall": 180.0,
        "wind_speed": 35.0,
        "water_level": 3.8,
        "humidity": 85.0,
        "historical_indicator": 0.7
    }
    
    post_res = client.post("/api/v1/incidents", json=incident_payload, headers=headers)
    assert post_res.status_code == 201
    inc_data = post_res.json()
    assert inc_data["id"] is not None
    assert inc_data["risk_level"] in ["HIGH", "CRITICAL"]
    assert inc_data["status"] == "Reported"

def test_admin_rescue_dispatch_and_stepper():
    # Login admin
    admin_res = client.post("/api/v1/auth/login", json={"email": "admin@disaster.org", "password": "admin123"})
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Get incidents & teams
    inc_res = client.get("/api/v1/incidents")
    incidents = inc_res.json()
    assert len(incidents) > 0
    target_inc = incidents[0]
    
    teams_res = client.get("/api/v1/rescue-teams")
    teams = teams_res.json()
    assert len(teams) > 0
    target_team = teams[0]
    
    # Dispatch team
    assign_payload = {
        "incident_id": target_inc["id"],
        "rescue_team_id": target_team["id"],
        "notes": "Emergency NDRF deployment"
    }
    assign_res = client.post("/api/v1/rescue-assignments", json=assign_payload, headers=admin_headers)
    assert assign_res.status_code == 201
    assignment = assign_res.json()
    assert assignment["status"] == "Assigned"
    
    # Rescue team advances status: Assigned -> En Route -> Arrived -> In Progress -> Completed
    rescue_res = client.post("/api/v1/auth/login", json={"email": "rescue@disaster.org", "password": "rescue123"})
    rescue_token = rescue_res.json()["access_token"]
    rescue_headers = {"Authorization": f"Bearer {rescue_token}"}
    
    for new_status in ["En Route", "Arrived", "In Progress", "Completed"]:
        up_res = client.put(
            f"/api/v1/rescue-assignments/{assignment['id']}",
            json={"status": new_status, "notes": f"Team status updated to {new_status}"},
            headers=rescue_headers
        )
        assert up_res.status_code == 200
        assert up_res.json()["status"] == new_status

def test_shelter_capacity_allocation():
    admin_res = client.post("/api/v1/auth/login", json={"email": "admin@disaster.org", "password": "admin123"})
    headers = {"Authorization": f"Bearer {admin_res.json()['access_token']}"}
    
    shelters_res = client.get("/api/v1/shelters")
    shelters = shelters_res.json()
    assert len(shelters) > 0
    target_shelter = shelters[0]
    initial_avail = target_shelter["available_capacity"]
    
    alloc_res = client.post(
        f"/api/v1/shelters/{target_shelter['id']}/allocate",
        json={"people_count": 50},
        headers=headers
    )
    assert alloc_res.status_code == 200
    updated_shelter = alloc_res.json()
    assert updated_shelter["available_capacity"] == initial_avail - 50

def test_data_grounded_ai_assistant():
    query_payload = {"question": "Which shelters have available capacity?"}
    res = client.post("/api/v1/assistant/query", json=query_payload)
    assert res.status_code == 200
    data = res.json()
    assert "shelter" in data["answer"].lower()
    assert data["is_grounded"] is True
