import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# Authentication & User Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = Field(default="citizen")  # citizen, admin, rescue, coordinator
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    created_at: datetime.datetime


# Incident Schemas
class IncidentCreate(BaseModel):
    disaster_type: str  # Flood, Cyclone, Earthquake, Landslide, Wildfire
    description: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    location_name: str
    severity: int = Field(..., ge=1, le=5)
    affected_population: int = Field(..., ge=0)
    
    rainfall: float = Field(default=0.0, ge=0)
    wind_speed: float = Field(default=0.0, ge=0)
    water_level: float = Field(default=0.0, ge=0)
    humidity: float = Field(default=50.0, ge=0, le=100)
    historical_indicator: float = Field(default=0.1, ge=0, le=1)

class IncidentUpdateStatus(BaseModel):
    status: str
    notes: Optional[str] = None

class IncidentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    disaster_type: str
    description: str
    latitude: float
    longitude: float
    location_name: str
    severity: int
    affected_population: int
    rainfall: float
    wind_speed: float
    water_level: float
    humidity: float
    historical_indicator: float
    timestamp: datetime.datetime
    reporter_id: Optional[int] = None
    status: str
    risk_level: str
    risk_score: float
    priority_score: float
    risk_explanation: List[str]


# Rescue Team Schemas
class RescueTeamCreate(BaseModel):
    team_name: str
    leader_name: str
    contact_number: str
    location_name: str
    latitude: float
    longitude: float
    user_id: Optional[int] = None

class RescueTeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    team_name: str
    leader_name: str
    contact_number: str
    current_status: str
    location_name: str
    latitude: float
    longitude: float


# Rescue Assignment Schemas
class RescueAssignmentCreate(BaseModel):
    incident_id: int
    rescue_team_id: int
    target_shelter_id: Optional[int] = None
    notes: Optional[str] = None

class RescueAssignmentUpdate(BaseModel):
    status: str  # Assigned, En Route, Arrived, In Progress, Completed
    notes: Optional[str] = None

class RescueAssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    incident_id: int
    rescue_team_id: int
    target_shelter_id: Optional[int] = None
    assigned_at: datetime.datetime
    updated_at: datetime.datetime
    status: str
    notes: Optional[str] = None
    
    incident: Optional[IncidentResponse] = None
    rescue_team: Optional[RescueTeamResponse] = None


# Shelter Schemas
class ShelterCreate(BaseModel):
    name: str
    location_name: str
    latitude: float
    longitude: float
    capacity: int
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None

class ShelterAllocate(BaseModel):
    people_count: int

class ShelterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    location_name: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    available_capacity: int
    status: str
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None


# Hospital Schemas
class HospitalCreate(BaseModel):
    name: str
    location_name: str
    latitude: float
    longitude: float
    facility_type: str = "General Hospital"
    emergency_capacity: int
    contact_number: Optional[str] = None

class HospitalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    location_name: str
    latitude: float
    longitude: float
    facility_type: str
    emergency_capacity: int
    current_patients: int
    available_beds: int
    contact_number: Optional[str] = None
    status: str


# Alert Schemas
class AlertCreate(BaseModel):
    title: str
    message: str
    severity: str = "HIGH"  # LOW, MEDIUM, HIGH, CRITICAL
    disaster_type: Optional[str] = None
    location_name: Optional[str] = None

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    title: str
    message: str
    severity: str
    disaster_type: Optional[str] = None
    location_name: Optional[str] = None
    is_active: bool
    created_at: datetime.datetime


# Assistant & Dashboard Schemas
class AssistantQuery(BaseModel):
    question: str

class AssistantResponse(BaseModel):
    answer: str
    data_context: Optional[Dict[str, Any]] = None
    is_grounded: bool = True

class DashboardSummary(BaseModel):
    total_incidents: int
    active_incidents: int
    critical_incidents: int
    high_risk_incidents: int
    active_rescues: int
    total_rescue_teams: int
    available_rescue_teams: int
    total_shelters: int
    available_shelter_capacity: int
    total_hospitals: int
    available_hospital_beds: int
    active_alerts: int
