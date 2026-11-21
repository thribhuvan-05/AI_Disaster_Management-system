# Database Schema & Entity Relationships — AI Disaster Management System

## 1. Database Overview
The database uses normalized relational structures with foreign key constraints, primary keys, timestamps, and indexes. It supports both **SQLite** (default zero-setup connection `sqlite:///./disaster_management.db`) and **PostgreSQL** (`postgresql://postgres:password@localhost:5432/disaster_db`).

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ INCIDENTS : reports
    USERS ||--o{ ALERTS : creates
    INCIDENTS ||--o{ RESCUE_ASSIGNMENTS : triggers
    RESCUE_TEAMS ||--o{ RESCUE_ASSIGNMENTS : assigned_to
    SHELTERS ||--o{ RESCUE_ASSIGNMENTS : target_shelter

    USERS {
        int id PK
        string email
        string password_hash
        string full_name
        string role
        string phone
        timestamp created_at
    }

    INCIDENTS {
        int id PK
        string disaster_type
        string description
        float latitude
        float longitude
        string location_name
        int severity
        int affected_population
        float rainfall
        float wind_speed
        float water_level
        float humidity
        float historical_indicator
        string status
        string risk_level
        float risk_score
        float priority_score
        text risk_explanation_json
    }

    RESCUE_TEAMS {
        int id PK
        string team_name
        string leader_name
        string contact_number
        string current_status
        string location_name
        float latitude
        float longitude
    }

    RESCUE_ASSIGNMENTS {
        int id PK
        int incident_id FK
        int rescue_team_id FK
        int target_shelter_id FK
        string status
        text notes
        timestamp assigned_at
        timestamp updated_at
    }

    SHELTERS {
        int id PK
        string name
        string location_name
        float latitude
        float longitude
        int capacity
        int current_occupancy
        int available_capacity
        string status
    }

    HOSPITALS {
        int id PK
        string name
        string location_name
        float latitude
        float longitude
        string facility_type
        int emergency_capacity
        int current_patients
        int available_beds
        string status
    }

    ALERTS {
        int id PK
        string title
        text message
        string severity
        string disaster_type
        string location_name
        boolean is_active
        timestamp created_at
    }
```
