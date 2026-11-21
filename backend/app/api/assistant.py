import math
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Incident, RescueTeam, Shelter, Hospital, Alert
from app.schemas.schemas import AssistantQuery, AssistantResponse

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

def calculate_haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in kilometers between two geo coordinates."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

@router.post("/query", response_model=AssistantResponse)
def query_ai_assistant(query_in: AssistantQuery, db: Session = Depends(get_db)):
    q = query_in.question.lower().strip()
    
    # 1. Critical Incidents Query
    if "critical" in q or "high risk" in q or "severe" in q:
        critical_incidents = db.query(Incident).filter(
            Incident.risk_level.in_(["CRITICAL", "HIGH"]),
            Incident.status != "Completed"
        ).all()
        
        if not critical_incidents:
            return AssistantResponse(
                answer="There are currently no active CRITICAL or HIGH risk disaster incidents recorded in the system.",
                data_context={"count": 0},
                is_grounded=True
            )
            
        details = [
            f"• #{inc.id} {inc.disaster_type} at {inc.location_name} (Risk: {inc.risk_level}, Score: {inc.risk_score:.1f}, Priority: {inc.priority_score:.1f}, Status: {inc.status}, Affected: {inc.affected_population})"
            for inc in critical_incidents
        ]
        
        answer = f"Found {len(critical_incidents)} high-risk/critical disaster incident(s) currently active:\n" + "\n".join(details)
        return AssistantResponse(
            answer=answer,
            data_context={"incidents": [inc.id for inc in critical_incidents]},
            is_grounded=True
        )

    # 2. Shelters & Available Capacity Query
    elif "shelter" in q or "capacity" in q or "accommodation" in q:
        shelters = db.query(Shelter).all()
        available_shelters = [s for s in shelters if s.available_capacity > 0]
        
        if not available_shelters:
            return AssistantResponse(
                answer="All registered emergency shelters are currently at full capacity.",
                data_context={"available_count": 0},
                is_grounded=True
            )
            
        details = [
            f"• {s.name} ({s.location_name}): {s.available_capacity} beds available (Occupancy: {s.current_occupancy}/{s.capacity}, Status: {s.status})"
            for s in available_shelters
        ]
        
        total_avail = sum(s.available_capacity for s in available_shelters)
        answer = f"There are {len(available_shelters)} shelter(s) with available capacity (Total {total_avail} available beds):\n" + "\n".join(details)
        return AssistantResponse(
            answer=answer,
            data_context={"total_available": total_avail, "shelters_count": len(available_shelters)},
            is_grounded=True
        )

    # 3. Rescue Teams Availability Query
    elif "rescue team" in q or "team" in q or "responder" in q or "dispatched" in q:
        teams = db.query(RescueTeam).all()
        available = [t for t in teams if t.current_status == "available"]
        dispatched = [t for t in teams if t.current_status != "available"]
        
        details = [
            f"• {t.team_name} ({t.location_name}) - Status: {t.current_status.upper()} (Leader: {t.leader_name}, Contact: {t.contact_number})"
            for t in teams
        ]
        
        answer = f"System has {len(teams)} registered rescue teams ({len(available)} AVAILABLE, {len(dispatched)} DISPATCHED/BUSY):\n" + "\n".join(details)
        return AssistantResponse(
            answer=answer,
            data_context={"total_teams": len(teams), "available_teams": len(available)},
            is_grounded=True
        )

    # 4. Hospitals & Emergency Facilities Query
    elif "hospital" in q or "bed" in q or "medical" in q or "health" in q:
        hospitals = db.query(Hospital).all()
        details = [
            f"• {h.name} ({h.location_name}): {h.available_beds} beds available (Facility: {h.facility_type}, Emergency Cap: {h.emergency_capacity}, Status: {h.status})"
            for h in hospitals
        ]
        total_beds = sum(h.available_beds for h in hospitals)
        answer = f"There are {len(hospitals)} emergency medical facilities with {total_beds} total available beds:\n" + "\n".join(details)
        return AssistantResponse(
            answer=answer,
            data_context={"total_hospitals": len(hospitals), "total_available_beds": total_beds},
            is_grounded=True
        )

    # 5. Nearby / Closest Shelter Location Query
    elif "closest" in q or "near" in q:
        # Default center target location matching demo (Kanchipuram)
        target_lat, target_lon = 12.8342, 79.7036
        shelters = db.query(Shelter).all()
        
        with_dist = []
        for s in shelters:
            d = calculate_haversine(target_lat, target_lon, s.latitude, s.longitude)
            with_dist.append((d, s))
            
        with_dist.sort(key=lambda x: x[0])
        
        if with_dist:
            closest_d, closest_s = with_dist[0]
            answer = f"The closest emergency shelter to the reference region is '{closest_s.name}' in {closest_s.location_name}, located approximately {closest_d} km away with {closest_s.available_capacity} available beds (Total Capacity: {closest_s.capacity})."
        else:
            answer = "No shelters currently registered in proximity database."
            
        return AssistantResponse(answer=answer, is_grounded=True)

    # 6. General Operational Summary Fallback
    else:
        total_inc = db.query(Incident).count()
        total_shelters = db.query(Shelter).count()
        total_teams = db.query(RescueTeam).count()
        total_alerts = db.query(Alert).filter(Alert.is_active == True).count()
        
        answer = (
            f"I am the Data-Grounded AI Disaster Management Assistant. "
            f"Current system operational stats: {total_inc} reported incidents, {total_teams} rescue teams, "
            f"{total_shelters} emergency shelters, and {total_alerts} active disaster alerts. "
            f"You can ask me specific questions like 'Which shelters have available capacity?', 'Show critical incidents', or 'How many rescue teams are available?'"
        )
        return AssistantResponse(answer=answer, is_grounded=True)
