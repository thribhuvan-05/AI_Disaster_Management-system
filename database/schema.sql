-- AI Disaster Management System - Database DDL Schema
-- Supported on PostgreSQL and SQLite

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'citizen',
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    disaster_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    severity INT NOT NULL DEFAULT 1,
    affected_population INT NOT NULL DEFAULT 0,
    rainfall DOUBLE PRECISION DEFAULT 0.0,
    wind_speed DOUBLE PRECISION DEFAULT 0.0,
    water_level DOUBLE PRECISION DEFAULT 0.0,
    humidity DOUBLE PRECISION DEFAULT 50.0,
    historical_indicator DOUBLE PRECISION DEFAULT 0.1,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Reported',
    risk_level VARCHAR(50) DEFAULT 'MEDIUM',
    risk_score DOUBLE PRECISION DEFAULT 50.0,
    priority_score DOUBLE PRECISION DEFAULT 50.0,
    risk_explanation_json TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS rescue_teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    leader_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(100) NOT NULL,
    current_status VARCHAR(50) DEFAULT 'available',
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shelters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    available_capacity INT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    contact_person VARCHAR(255),
    contact_number VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    facility_type VARCHAR(100) DEFAULT 'General Hospital',
    emergency_capacity INT NOT NULL,
    current_patients INT DEFAULT 0,
    available_beds INT NOT NULL,
    contact_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'operational'
);

CREATE TABLE IF NOT EXISTS rescue_assignments (
    id SERIAL PRIMARY KEY,
    incident_id INT REFERENCES incidents(id) ON DELETE CASCADE,
    rescue_team_id INT REFERENCES rescue_teams(id) ON DELETE CASCADE,
    target_shelter_id INT REFERENCES shelters(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Assigned',
    notes TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(50) DEFAULT 'HIGH',
    disaster_type VARCHAR(100),
    location_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id) ON DELETE SET NULL
);
