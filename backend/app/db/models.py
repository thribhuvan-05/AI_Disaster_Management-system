import datetime
import json
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
)
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="citizen")  # citizen, admin, rescue, coordinator
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    incidents = relationship("Incident", back_populates="reporter")
    alerts = relationship("Alert", back_populates="creator")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    disaster_type = Column(String, nullable=False)  # Flood, Cyclone, Earthquake, Landslide, Wildfire
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String, nullable=False)
    severity = Column(Integer, nullable=False, default=1)  # 1 - 5
    affected_population = Column(Integer, nullable=False, default=0)
    
    # Environmental parameters
    rainfall = Column(Float, default=0.0)
    wind_speed = Column(Float, default=0.0)
    water_level = Column(Float, default=0.0)
    humidity = Column(Float, default=50.0)
    historical_indicator = Column(Float, default=0.1)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Status & AI Assessment outputs
    status = Column(String, default="Reported")  # Reported, Assigned, En Route, Arrived, In Progress, Completed
    risk_level = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    risk_score = Column(Float, default=50.0)
    priority_score = Column(Float, default=50.0)
    risk_explanation_json = Column(Text, default="[]")

    # Relationships
    reporter = relationship("User", back_populates="incidents")
    assignments = relationship("RescueAssignment", back_populates="incident")

    @property
    def risk_explanation(self):
        try:
            return json.loads(self.risk_explanation_json or "[]")
        except Exception:
            return []

    @risk_explanation.setter
    def risk_explanation(self, value):
        self.risk_explanation_json = json.dumps(value)


class RescueTeam(Base):
    __tablename__ = "rescue_teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False)
    leader_name = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    current_status = Column(String, default="available")  # available, dispatched, busy
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    assignments = relationship("RescueAssignment", back_populates="rescue_team")


class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, default=0)
    available_capacity = Column(Integer, nullable=False)
    status = Column(String, default="active")  # active, full, inactive
    contact_person = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)

    assignments = relationship("RescueAssignment", back_populates="target_shelter")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    facility_type = Column(String, default="General Hospital")  # General Hospital, Trauma Center, Mobile Clinic
    emergency_capacity = Column(Integer, nullable=False)
    current_patients = Column(Integer, default=0)
    available_beds = Column(Integer, nullable=False)
    contact_number = Column(String, nullable=True)
    status = Column(String, default="operational")  # operational, strained, critical


class RescueAssignment(Base):
    __tablename__ = "rescue_assignments"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    rescue_team_id = Column(Integer, ForeignKey("rescue_teams.id"), nullable=False)
    target_shelter_id = Column(Integer, ForeignKey("shelters.id"), nullable=True)
    
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    status = Column(String, default="Assigned")  # Assigned, En Route, Arrived, In Progress, Completed
    notes = Column(Text, nullable=True)

    # Relationships
    incident = relationship("Incident", back_populates="assignments")
    rescue_team = relationship("RescueTeam", back_populates="assignments")
    target_shelter = relationship("Shelter", back_populates="assignments")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    disaster_type = Column(String, nullable=True)
    location_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    creator = relationship("User", back_populates="alerts")
