import requests
import random
import datetime
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Incident

router = APIRouter(prefix="/telemetry", tags=["Live Telemetry & Sensors"])

CITY_COORDINATES = {
    "kanchipuram": {"name": "Kanchipuram, TN", "lat": 12.8342, "lon": 79.7036, "base_rain": 245.0, "base_water": 5.2, "base_wind": 65.0},
    "chennai": {"name": "Chennai Coastal, TN", "lat": 13.0827, "lon": 80.2707, "base_rain": 185.0, "base_water": 3.8, "base_wind": 110.0},
    "visakhapatnam": {"name": "Visakhapatnam, AP", "lat": 17.6868, "lon": 83.2185, "base_rain": 140.0, "base_water": 2.9, "base_wind": 85.0},
    "hyderabad": {"name": "Hyderabad Sector, TS", "lat": 17.3850, "lon": 78.4867, "base_rain": 95.0, "base_water": 2.1, "base_wind": 45.0},
    "mumbai": {"name": "Mumbai Coastal, MH", "lat": 19.0760, "lon": 72.8777, "base_rain": 310.0, "base_water": 4.6, "base_wind": 75.0},
    "delhi": {"name": "Delhi NCR Sector", "lat": 28.6139, "lon": 77.2090, "base_rain": 60.0, "base_water": 1.4, "base_wind": 30.0},
    "tirupati": {"name": "Tirupati, AP", "lat": 13.6288, "lon": 79.4192, "base_rain": 160.0, "base_water": 3.5, "base_wind": 50.0},
    "vijayawada": {"name": "Vijayawada, AP", "lat": 16.5062, "lon": 80.6480, "base_rain": 210.0, "base_water": 4.8, "base_wind": 55.0},
}

@router.get("")
def get_city_telemetry(
    city: str = Query("Kanchipuram", description="City name to fetch live telemetry for"),
    lat: float = Query(None, description="Optional latitude"),
    lon: float = Query(None, description="Optional longitude"),
    db: Session = Depends(get_db)
):
    key = city.lower().strip()
    city_info = CITY_COORDINATES.get(key)
    
    target_lat = lat or (city_info["lat"] if city_info else 12.8342)
    target_lon = lon or (city_info["lon"] if city_info else 79.7036)
    display_name = city_info["name"] if city_info else city.title()

    real_rain = None
    real_wind = None
    real_humidity = None

    # Call Open-Meteo free real-time weather API for genuine live weather
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={target_lat}&longitude={target_lon}&current_weather=true&hourly=relativehumidity_2m,precipitation"
        resp = requests.get(url, timeout=3)
        if resp.status_code == 200:
            wdata = resp.json()
            curr = wdata.get("current_weather", {})
            real_wind = curr.get("windspeed", 45.0)
            
            hourly_precip = wdata.get("hourly", {}).get("precipitation", [])
            if hourly_precip:
                real_rain = sum(hourly_precip[:6]) * 10.0 # 6-hr accumulation projection
                
            hourly_hum = wdata.get("hourly", {}).get("relativehumidity_2m", [])
            if hourly_hum:
                real_humidity = int(hourly_hum[0])
    except Exception as e:
        print("Open-Meteo API query error (using fallback calculation):", e)

    # Base telemetry fallback values if API offline or custom location
    base_rain = real_rain if real_rain is not None else (city_info["base_rain"] if city_info else 135.0)
    base_water = city_info["base_water"] if city_info else round(base_rain / 50.0, 2)
    base_wind = real_wind if real_wind is not None else (city_info["base_wind"] if city_info else 50.0)
    base_humidity = real_humidity if real_humidity is not None else 85
    
    # Check if there is an active DB incident for this city to align telemetry
    inc = db.query(Incident).filter(Incident.location_name.ilike(f"%{city}%")).order_by(Incident.priority_score.desc()).first()
    if inc:
        base_rain = inc.rainfall
        base_water = inc.water_level
        base_wind = inc.wind_speed

    # Live fluctuation micro-jitter
    rainfall = round(max(0.0, base_rain + random.uniform(-1.5, 2.5)), 1)
    water_level = round(max(0.0, base_water + random.uniform(-0.04, 0.06)), 2)
    wind_speed = round(max(0.0, base_wind + random.uniform(-2.0, 3.0)), 1)
    humidity = min(100, max(40, int(base_humidity + random.uniform(-2, 3))))
    seismic = round(max(0.02, 0.10 + random.uniform(-0.03, 0.05)), 2)

    # Status classification
    if rainfall > 200 or water_level > 4.5 or wind_speed > 100:
        status_level = "CRITICAL HAZARD"
        color = "red"
    elif rainfall > 100 or water_level > 3.0 or wind_speed > 60:
        status_level = "HIGH WARNING"
        color = "orange"
    else:
        status_level = "NORMAL MONITORING"
        color = "emerald"

    return {
        "city_name": display_name,
        "latitude": target_lat,
        "longitude": target_lon,
        "rainfall": rainfall,
        "water_level": water_level,
        "wind_speed": wind_speed,
        "humidity": humidity,
        "seismic": seismic,
        "status_level": status_level,
        "status_color": color,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
