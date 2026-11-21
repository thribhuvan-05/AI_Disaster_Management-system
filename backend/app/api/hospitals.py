from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Hospital, User
from app.schemas.schemas import HospitalCreate, HospitalResponse
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/hospitals", tags=["Hospitals & Emergency Facilities"])

@router.get("", response_model=List[HospitalResponse])
def get_hospitals(db: Session = Depends(get_db)):
    return db.query(Hospital).all()

@router.post("", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
def create_hospital(
    hospital_in: HospitalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "coordinator"]))
):
    hospital = Hospital(
        name=hospital_in.name,
        location_name=hospital_in.location_name,
        latitude=hospital_in.latitude,
        longitude=hospital_in.longitude,
        facility_type=hospital_in.facility_type,
        emergency_capacity=hospital_in.emergency_capacity,
        current_patients=0,
        available_beds=hospital_in.emergency_capacity,
        contact_number=hospital_in.contact_number,
        status="operational"
    )
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital
