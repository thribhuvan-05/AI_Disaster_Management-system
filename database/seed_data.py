import sys
import os

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.db.database import engine, SessionLocal, Base
from app.db.models import User, Incident, RescueTeam, RescueAssignment, Shelter, Hospital, Alert
from app.core.security import get_password_hash
from app.api.incidents import evaluate_incident_risk

def seed_database(force: bool = True):
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # If force is True, delete existing data to ensure clean state
        if force:
            print("Clearing old database records for fresh seed...")
            db.query(Incident).delete()
            db.query(RescueAssignment).delete()
            db.query(RescueTeam).delete()
            db.query(Shelter).delete()
            db.query(Hospital).delete()
            db.query(Alert).delete()
            db.query(User).delete()
            db.commit()
        elif db.query(User).first():
            print("Database already contains seed data. Skipping...")
            return

        print("Seeding demo users for all 4 roles...")
        citizen_user = User(
            email="citizen@disaster.org",
            password_hash=get_password_hash("password123"),
            full_name="Rajesh Kumar (Citizen)",
            role="citizen",
            phone="+91-9876500001"
        )
        admin_user = User(
            email="admin@disaster.org",
            password_hash=get_password_hash("admin123"),
            full_name="Dr. Anita Roy (System Admin)",
            role="admin",
            phone="+91-9876500002"
        )
        rescue_user = User(
            email="rescue@disaster.org",
            password_hash=get_password_hash("rescue123"),
            full_name="Commander Vikram (NDRF Lead)",
            role="rescue",
            phone="+91-9876500003"
        )
        coordinator_user = User(
            email="coordinator@disaster.org",
            password_hash=get_password_hash("coordinator123"),
            full_name="S. Mukerjee (Disaster Coordinator)",
            role="coordinator",
            phone="+91-9876500004"
        )

        db.add_all([citizen_user, admin_user, rescue_user, coordinator_user])
        db.commit()
        db.refresh(citizen_user)
        db.refresh(admin_user)
        db.refresh(rescue_user)
        db.refresh(coordinator_user)

        print("Seeding Rescue Teams...")
        team1 = RescueTeam(
            team_name="NDRF Alpha Team",
            leader_name="Capt. R. Sharma",
            contact_number="+91-9876543210",
            current_status="available",
            location_name="Kanchipuram Rescue Base",
            latitude=12.8342,
            longitude=79.7036,
            user_id=rescue_user.id
        )
        team2 = RescueTeam(
            team_name="SDRF Bravo Unit",
            leader_name="Commander K. Varma",
            contact_number="+91-9876543211",
            current_status="available",
            location_name="Chennai Metro Response Station",
            latitude=13.0827,
            longitude=80.2707
        )
        team3 = RescueTeam(
            team_name="Coastal Response Charlie",
            leader_name="Insp. S. Rao",
            contact_number="+91-9876543212",
            current_status="available",
            location_name="Visakhapatnam Port Operations",
            latitude=17.6868,
            longitude=83.2185
        )
        db.add_all([team1, team2, team3])
        db.commit()

        print("Seeding Emergency Shelters...")
        shelter1 = Shelter(
            name="Kanchipuram Community Relief Shelter",
            location_name="Kanchipuram",
            latitude=12.8342,
            longitude=79.7036,
            capacity=500,
            current_occupancy=150,
            available_capacity=350,
            status="active",
            contact_person="Ramesh Patel",
            contact_number="+91-9876511111"
        )
        shelter2 = Shelter(
            name="Chennai Central Flood Shelter",
            location_name="Chennai",
            latitude=13.0827,
            longitude=80.2707,
            capacity=1000,
            current_occupancy=400,
            available_capacity=600,
            status="active",
            contact_person="S. Ananthi",
            contact_number="+91-9876522222"
        )
        shelter3 = Shelter(
            name="Visakhapatnam Cyclone Haven",
            location_name="Visakhapatnam",
            latitude=17.6868,
            longitude=83.2185,
            capacity=800,
            current_occupancy=200,
            available_capacity=600,
            status="active",
            contact_person="M. Reddy",
            contact_number="+91-9876533333"
        )
        db.add_all([shelter1, shelter2, shelter3])
        db.commit()

        print("Seeding Hospitals & Medical Facilities...")
        hosp1 = Hospital(
            name="Kanchipuram District Government Hospital",
            location_name="Kanchipuram",
            latitude=12.8380,
            longitude=79.7010,
            facility_type="Trauma Center",
            emergency_capacity=150,
            current_patients=105,
            available_beds=45,
            contact_number="+91-9876544441",
            status="operational"
        )
        hosp2 = Hospital(
            name="Apollo Emergency Medical Center",
            location_name="Chennai",
            latitude=13.0600,
            longitude=80.2500,
            facility_type="Multi-Specialty Hospital",
            emergency_capacity=300,
            current_patients=190,
            available_beds=110,
            contact_number="+91-9876544442",
            status="operational"
        )
        hosp3 = Hospital(
            name="King George Hospital",
            location_name="Visakhapatnam",
            latitude=17.7020,
            longitude=83.3010,
            facility_type="General Hospital",
            emergency_capacity=250,
            current_patients=170,
            available_beds=80,
            contact_number="+91-9876544443",
            status="operational"
        )
        db.add_all([hosp1, hosp2, hosp3])
        db.commit()

        print("Seeding Active Alerts...")
        alert1 = Alert(
            title="CRITICAL FLOOD ALERT: Adyar River Basin",
            message="Heavy rainfall exceeding 200mm has triggered rapid water level rise. Citizens in low-lying zones of Kanchipuram and Adyar are advised to evacuate immediately to designated relief shelters.",
            severity="CRITICAL",
            disaster_type="Flood",
            location_name="Kanchipuram / Adyar",
            is_active=True,
            created_by=admin_user.id
        )
        alert2 = Alert(
            title="CYCLONE WARNING: Bay of Bengal Coastal Belt",
            message="Deep depression forming over Bay of Bengal expected to bring wind gusts up to 110 km/h along Tamil Nadu and AP coasts.",
            severity="HIGH",
            disaster_type="Cyclone",
            location_name="Chennai & Coastal Andhra",
            is_active=True,
            created_by=coordinator_user.id
        )
        db.add_all([alert1, alert2])
        db.commit()

        print("Seeding Demo Disaster Incidents & evaluating with AI Risk Engine...")
        inc1_params = {
            'rainfall': 220.0,
            'wind_speed': 45.0,
            'water_level': 4.2,
            'humidity': 92.0,
            'historical_indicator': 0.85,
            'severity': 4,
            'affected_population': 350
        }
        res1 = evaluate_incident_risk(inc1_params)
        
        inc1 = Incident(
            disaster_type="Flood",
            description="Severe inundation reported in Kanchipuram residential areas. Water level rising rapidly above danger mark near bridge.",
            latitude=12.8342,
            longitude=79.7036,
            location_name="Kanchipuram East Sector",
            severity=4,
            affected_population=350,
            rainfall=220.0,
            wind_speed=45.0,
            water_level=4.2,
            humidity=92.0,
            historical_indicator=0.85,
            reporter_id=citizen_user.id,
            status="Reported",
            risk_level=res1['risk_level'],
            risk_score=res1['risk_score'],
            priority_score=res1['priority_score']
        )
        inc1.risk_explanation = res1['risk_explanation']

        inc2_params = {
            'rainfall': 140.0,
            'wind_speed': 110.0,
            'water_level': 2.1,
            'humidity': 88.0,
            'historical_indicator': 0.60,
            'severity': 4,
            'affected_population': 500
        }
        res2 = evaluate_incident_risk(inc2_params)
        
        inc2 = Incident(
            disaster_type="Cyclone",
            description="High wind gusts causing power line collapse and roof damage near coastal harbour.",
            latitude=13.0827,
            longitude=80.2707,
            location_name="Chennai Marina Coastal Area",
            severity=4,
            affected_population=500,
            rainfall=140.0,
            wind_speed=110.0,
            water_level=2.1,
            humidity=88.0,
            historical_indicator=0.60,
            reporter_id=citizen_user.id,
            status="Reported",
            risk_level=res2['risk_level'],
            risk_score=res2['risk_score'],
            priority_score=res2['priority_score']
        )
        inc2.risk_explanation = res2['risk_explanation']

        db.add_all([inc1, inc2])
        db.commit()
        
        print("Database Seed Complete! Successfully populated Indian region synthetic demo dataset.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
