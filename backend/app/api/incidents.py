import sys
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Incident, User
from app.schemas.schemas import IncidentCreate, IncidentResponse, IncidentUpdateStatus
from app.core.security import get_current_user, require_roles

# Add parent ml folder to path for import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml")))
from predict import evaluate_incident_risk

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate coordinates
    if not (-90 <= incident_in.latitude <= 90) or not (-180 <= incident_in.longitude <= 180):
        raise HTTPException(status_code=400, detail="Invalid geographic coordinates.")

    # Process ML Risk Engine Evaluation
    eval_input = {
        'rainfall': incident_in.rainfall,
        'wind_speed': incident_in.wind_speed,
        'water_level': incident_in.water_level,
        'humidity': incident_in.humidity,
        'historical_indicator': incident_in.historical_indicator,
        'severity': incident_in.severity,
        'affected_population': incident_in.affected_population
    }
    
    risk_res = evaluate_incident_risk(eval_input)
    
    new_incident = Incident(
        disaster_type=incident_in.disaster_type,
        description=incident_in.description,
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        location_name=incident_in.location_name,
        severity=incident_in.severity,
        affected_population=incident_in.affected_population,
        rainfall=incident_in.rainfall,
        wind_speed=incident_in.wind_speed,
        water_level=incident_in.water_level,
        humidity=incident_in.humidity,
        historical_indicator=incident_in.historical_indicator,
        reporter_id=current_user.id,
        status="Reported",
        risk_level=risk_res['risk_level'],
        risk_score=risk_res['risk_score'],
        priority_score=risk_res['priority_score']
    )
    new_incident.risk_explanation = risk_res['risk_explanation']
    
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return new_incident

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    disaster_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Incident)
    if disaster_type:
        query = query.filter(Incident.disaster_type == disaster_type)
    if risk_level:
        query = query.filter(Incident.risk_level == risk_level)
    if status:
        query = query.filter(Incident.status == status)
    
    incidents = query.order_by(Incident.priority_score.desc(), Incident.timestamp.desc()).all()
    return incidents

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_by_id(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return incident

@router.put("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(
    incident_id: int,
    status_in: IncidentUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "rescue", "coordinator"]))
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    
    incident.status = status_in.status
    db.commit()
    db.refresh(incident)
    return incident
