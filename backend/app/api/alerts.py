from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Alert, User
from app.schemas.schemas import AlertCreate, AlertResponse
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/alerts", tags=["Disaster Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.is_active == True).order_by(Alert.created_at.desc()).all()

@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "coordinator"]))
):
    alert = Alert(
        title=alert_in.title,
        message=alert_in.message,
        severity=alert_in.severity,
        disaster_type=alert_in.disaster_type,
        location_name=alert_in.location_name,
        is_active=True,
        created_by=current_user.id
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
