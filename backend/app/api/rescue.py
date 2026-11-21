from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import RescueTeam, RescueAssignment, Incident, User, Shelter
from app.schemas.schemas import (
    RescueTeamCreate, RescueTeamResponse,
    RescueAssignmentCreate, RescueAssignmentUpdate, RescueAssignmentResponse
)
from app.core.security import get_current_user, require_roles

router = APIRouter(tags=["Rescue Operations"])

# Rescue Teams Endpoints
@router.get("/rescue-teams", response_model=List[RescueTeamResponse])
def get_rescue_teams(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(RescueTeam)
    if status:
        query = query.filter(RescueTeam.current_status == status)
    return query.all()

@router.post("/rescue-teams", response_model=RescueTeamResponse, status_code=status.HTTP_201_CREATED)
def create_rescue_team(
    team_in: RescueTeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "coordinator"]))
):
    team = RescueTeam(**team_in.model_dump())
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

# Rescue Assignments Endpoints
@router.get("/rescue-assignments", response_model=List[RescueAssignmentResponse])
def get_rescue_assignments(
    rescue_team_id: Optional[int] = None,
    incident_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RescueAssignment)
    if rescue_team_id:
        query = query.filter(RescueAssignment.rescue_team_id == rescue_team_id)
    if incident_id:
        query = query.filter(RescueAssignment.incident_id == incident_id)
    return query.order_by(RescueAssignment.assigned_at.desc()).all()

@router.post("/rescue-assignments", response_model=RescueAssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_rescue_assignment(
    assign_in: RescueAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "coordinator"]))
):
    incident = db.query(Incident).filter(Incident.id == assign_in.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
        
    rescue_team = db.query(RescueTeam).filter(RescueTeam.id == assign_in.rescue_team_id).first()
    if not rescue_team:
        raise HTTPException(status_code=404, detail="Rescue team not found.")
        
    assignment = RescueAssignment(
        incident_id=assign_in.incident_id,
        rescue_team_id=assign_in.rescue_team_id,
        target_shelter_id=assign_in.target_shelter_id,
        notes=assign_in.notes,
        status="Assigned"
    )
    
    # Update Incident status & Rescue Team status
    incident.status = "Assigned"
    rescue_team.current_status = "dispatched"
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.put("/rescue-assignments/{assignment_id}", response_model=RescueAssignmentResponse)
def update_rescue_assignment_status(
    assignment_id: int,
    update_in: RescueAssignmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "rescue", "coordinator"]))
):
    assignment = db.query(RescueAssignment).filter(RescueAssignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found.")
        
    valid_statuses = ["Assigned", "En Route", "Arrived", "In Progress", "Completed"]
    if update_in.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    assignment.status = update_in.status
    if update_in.notes:
        assignment.notes = update_in.notes
        
    # Synchronize incident and rescue team status
    incident = db.query(Incident).filter(Incident.id == assignment.incident_id).first()
    rescue_team = db.query(RescueTeam).filter(RescueTeam.id == assignment.rescue_team_id).first()
    
    if incident:
        incident.status = update_in.status
        
    if update_in.status == "Completed":
        if rescue_team:
            rescue_team.current_status = "available"
        if incident:
            incident.status = "Completed"
    else:
        if rescue_team:
            rescue_team.current_status = "busy"
            
    db.commit()
    db.refresh(assignment)
    return assignment
