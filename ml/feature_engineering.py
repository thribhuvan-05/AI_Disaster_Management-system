import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    'rainfall',
    'wind_speed',
    'water_level',
    'humidity',
    'historical_indicator',
    'severity',
    'affected_population'
]

FEATURE_NAMES_MAP = {
    'rainfall': 'Heavy Rainfall (mm)',
    'wind_speed': 'High Wind Speed (km/h)',
    'water_level': 'Elevated Water Level (m)',
    'humidity': 'Relative Humidity (%)',
    'historical_indicator': 'Historical Vulnerability Index',
    'severity': 'Reported Disaster Severity (1-5)',
    'affected_population': 'Affected Population Count'
}

def sanitize_input(data: dict) -> dict:
    """Validate and sanitize numerical environmental inputs."""
    return {
        'rainfall': max(0.0, float(data.get('rainfall', 0.0))),
        'wind_speed': max(0.0, float(data.get('wind_speed', 0.0))),
        'water_level': max(0.0, float(data.get('water_level', 0.0))),
        'humidity': min(100.0, max(0.0, float(data.get('humidity', 50.0)))),
        'historical_indicator': min(1.0, max(0.0, float(data.get('historical_indicator', 0.1)))),
        'severity': min(5, max(1, int(data.get('severity', 1)))),
        'affected_population': max(0, int(data.get('affected_population', 0)))
    }

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Generate normalized operational indicators from raw inputs."""
    df_engineered = df.copy()
    
    # Normalized feature indicators (0 to ~1 scale)
    df_engineered['rainfall_intensity'] = df_engineered['rainfall'] / 250.0
    df_engineered['water_severity'] = df_engineered['water_level'] / 8.0
    df_engineered['wind_risk'] = df_engineered['wind_speed'] / 150.0
    df_engineered['population_exposure'] = np.log1p(df_engineered['affected_population']) / 10.0
    df_engineered['severity_scale'] = df_engineered['severity'] / 5.0

    # Composite environmental risk index
    df_engineered['combined_env_risk'] = (
        0.30 * df_engineered['rainfall_intensity'] +
        0.25 * df_engineered['water_severity'] +
        0.20 * df_engineered['wind_risk'] +
        0.15 * df_engineered['historical_indicator'] +
        0.10 * df_engineered['severity_scale']
    )
    
    return df_engineered

def calculate_priority_score(risk_score: float, severity: int, affected_population: int) -> float:
    """Calculate operational priority score (0 - 100)."""
    severity_factor = (severity / 5.0) * 100.0
    population_factor = min(100.0, (np.log1p(affected_population) / np.log1p(10000)) * 100.0)
    
    # Weighted priority
    priority = (0.50 * risk_score) + (0.30 * severity_factor) + (0.20 * population_factor)
    return round(float(np.clip(priority, 0.0, 100.0)), 2)

def generate_risk_explanation(data: dict, risk_level: str, risk_score: float) -> list:
    """Extract human-readable feature-based contributing explanations."""
    explanations = []
    
    rainfall = data.get('rainfall', 0)
    water_level = data.get('water_level', 0)
    wind_speed = data.get('wind_speed', 0)
    historical = data.get('historical_indicator', 0)
    affected_pop = data.get('affected_population', 0)
    severity = data.get('severity', 1)

    if rainfall > 150:
        explanations.append(f"Torrential rainfall recorded ({rainfall:.1f} mm), significantly heightening flood/inundation hazard.")
    elif rainfall > 80:
        explanations.append(f"Moderate to heavy rainfall recorded ({rainfall:.1f} mm).")

    if water_level > 3.0:
        explanations.append(f"Critical water level measurement ({water_level:.1f} m) approaching or exceeding danger marks.")
    elif water_level > 1.5:
        explanations.append(f"Elevated water level ({water_level:.1f} m) monitored in region.")

    if wind_speed > 90:
        explanations.append(f"Gale/storm-force wind speeds detected ({wind_speed:.1f} km/h) posing structural risk.")
    elif wind_speed > 50:
        explanations.append(f"Strong gusts ({wind_speed:.1f} km/h) reported.")

    if historical > 0.6:
        explanations.append(f"High historical vulnerability index ({historical:.2f}) indicates recurrent disaster zone.")

    if affected_pop > 200:
        explanations.append(f"High population exposure with {affected_pop} citizens directly affected in immediate radius.")

    if severity >= 4:
        explanations.append(f"High incident severity rating level {severity}/5 reported by ground observers.")

    if not explanations:
        explanations.append("Environmental parameters within normal operational baseline range.")

    return explanations
