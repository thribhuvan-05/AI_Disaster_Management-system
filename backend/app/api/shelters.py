from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Shelter, User
from app.schemas.schemas import ShelterCreate, ShelterResponse, ShelterAllocate
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/shelters", tags=["Shelters"])

@router.get("", response_model=List[ShelterResponse])
def get_shelters(db: Session = Depends(get_db)):
    return db.query(Shelter).all()

@router.post("", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_in: ShelterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "coordinator"]))
):
    shelter = Shelter(
        name=shelter_in.name,
        location_name=shelter_in.location_name,
        latitude=shelter_in.latitude,
        longitude=shelter_in.longitude,
        capacity=shelter_in.capacity,
        current_occupancy=0,
        available_capacity=shelter_in.capacity,
        status="active",
        contact_person=shelter_in.contact_person,
        contact_number=shelter_in.contact_number
    )
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return shelter

@router.post("/{shelter_id}/allocate", response_model=ShelterResponse)
def allocate_shelter_capacity(
    shelter_id: int,
    alloc_in: ShelterAllocate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "rescue", "coordinator"]))
):
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found.")
        
    if alloc_in.people_count <= 0:
        raise HTTPException(status_code=400, detail="Allocation count must be positive.")
        
    if alloc_in.people_count > shelter.available_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot allocate {alloc_in.people_count} people. Remaining shelter capacity is only {shelter.available_capacity}."
        )
        
    shelter.current_occupancy += alloc_in.people_count
    shelter.available_capacity = max(0, shelter.capacity - shelter.current_occupancy)
    
    if shelter.available_capacity == 0:
        shelter.status = "full"
    else:
        shelter.status = "active"
        
    db.commit()
    db.refresh(shelter)
    return shelter
