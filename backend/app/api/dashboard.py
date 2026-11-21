from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import Incident, RescueTeam, RescueAssignment, Shelter, Hospital, Alert
from app.schemas.schemas import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard Metrics & Analytics"])

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_incidents = db.query(Incident).count()
    active_incidents = db.query(Incident).filter(Incident.status != "Completed").count()
    critical_incidents = db.query(Incident).filter(Incident.risk_level == "CRITICAL", Incident.status != "Completed").count()
    high_risk_incidents = db.query(Incident).filter(Incident.risk_level.in_(["HIGH", "CRITICAL"]), Incident.status != "Completed").count()
    
    active_rescues = db.query(RescueAssignment).filter(RescueAssignment.status.in_(["Assigned", "En Route", "Arrived", "In Progress"])).count()
    total_teams = db.query(RescueTeam).count()
    available_teams = db.query(RescueTeam).filter(RescueTeam.current_status == "available").count()
    
    total_shelters = db.query(Shelter).count()
    total_available_capacity = db.query(func.sum(Shelter.available_capacity)).scalar() or 0
    
    total_hospitals = db.query(Hospital).count()
    total_available_beds = db.query(func.sum(Hospital.available_beds)).scalar() or 0
    
    active_alerts = db.query(Alert).filter(Alert.is_active == True).count()
    
    return DashboardSummary(
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        critical_incidents=critical_incidents,
        high_risk_incidents=high_risk_incidents,
        active_rescues=active_rescues,
        total_rescue_teams=total_teams,
        available_rescue_teams=available_teams,
        total_shelters=total_shelters,
        available_shelter_capacity=total_available_capacity,
        total_hospitals=total_hospitals,
        available_hospital_beds=total_available_beds,
        active_alerts=active_alerts
    )

@router.get("/analytics")
def get_analytics_data(db: Session = Depends(get_db)):
    # Incidents grouped by Disaster Type
    disaster_counts = db.query(
        Incident.disaster_type, func.count(Incident.id)
    ).group_by(Incident.disaster_type).all()
    by_disaster = [{"type": d_type, "count": count} for d_type, count in disaster_counts]

    # Incidents grouped by Risk Level
    risk_counts = db.query(
        Incident.risk_level, func.count(Incident.id)
    ).group_by(Incident.risk_level).all()
    by_risk = [{"level": r_level, "count": count} for r_level, count in risk_counts]

    # Incidents grouped by Status
    status_counts = db.query(
        Incident.status, func.count(Incident.id)
    ).group_by(Incident.status).all()
    by_status = [{"status": st, "count": count} for st, count in status_counts]

    # Shelter Occupancy Summary
    shelters = db.query(Shelter).all()
    shelter_occupancy = [
        {
            "name": s.name,
            "occupancy": s.current_occupancy,
            "capacity": s.capacity,
            "available": s.available_capacity
        } for s in shelters
    ]

    return {
        "by_disaster_type": by_disaster,
        "by_risk_level": by_risk,
        "by_status": by_status,
        "shelter_occupancy": shelter_occupancy
    }
