import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score

from feature_engineering import FEATURE_COLUMNS, engineer_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

def generate_synthetic_dataset(num_samples: int = 1200, random_seed: int = 42) -> pd.DataFrame:
    """Generates realistic synthetic disaster & environmental dataset for Indian regions."""
    np.random.seed(random_seed)
    
    disaster_types = ['Flood', 'Cyclone', 'Earthquake', 'Landslide', 'Wildfire']
    data = []
    
    for _ in range(num_samples):
        disaster = np.random.choice(disaster_types, p=[0.35, 0.25, 0.15, 0.15, 0.10])
        
        # Base environmental distributions based on disaster type
        if disaster == 'Flood':
            rainfall = np.random.uniform(50, 350)
            wind_speed = np.random.uniform(10, 60)
            water_level = np.random.uniform(1.0, 6.5)
            humidity = np.random.uniform(70, 98)
            historical = np.random.uniform(0.3, 0.95)
            severity = np.random.choice([2, 3, 4, 5], p=[0.2, 0.4, 0.3, 0.1])
            affected_pop = int(np.random.exponential(scale=300) + 10)
        elif disaster == 'Cyclone':
            rainfall = np.random.uniform(80, 400)
            wind_speed = np.random.uniform(60, 180)
            water_level = np.random.uniform(0.5, 4.5)
            humidity = np.random.uniform(75, 100)
            historical = np.random.uniform(0.4, 0.9)
            severity = np.random.choice([3, 4, 5], p=[0.3, 0.4, 0.3])
            affected_pop = int(np.random.exponential(scale=500) + 50)
        elif disaster == 'Earthquake':
            rainfall = np.random.uniform(0, 50)
            wind_speed = np.random.uniform(5, 30)
            water_level = np.random.uniform(0.0, 1.0)
            humidity = np.random.uniform(30, 70)
            historical = np.random.uniform(0.1, 0.8)
            severity = np.random.choice([1, 2, 3, 4, 5], p=[0.1, 0.2, 0.4, 0.2, 0.1])
            affected_pop = int(np.random.exponential(scale=400) + 20)
        elif disaster == 'Landslide':
            rainfall = np.random.uniform(100, 300)
            wind_speed = np.random.uniform(15, 50)
            water_level = np.random.uniform(0.8, 3.5)
            humidity = np.random.uniform(65, 95)
            historical = np.random.uniform(0.5, 0.95)
            severity = np.random.choice([2, 3, 4, 5], p=[0.2, 0.3, 0.3, 0.2])
            affected_pop = int(np.random.exponential(scale=150) + 10)
        else: # Wildfire
            rainfall = np.random.uniform(0, 15)
            wind_speed = np.random.uniform(30, 90)
            water_level = np.random.uniform(0.0, 0.5)
            humidity = np.random.uniform(10, 35)
            historical = np.random.uniform(0.2, 0.7)
            severity = np.random.choice([2, 3, 4], p=[0.3, 0.5, 0.2])
            affected_pop = int(np.random.exponential(scale=100) + 5)
            
        row = {
            'disaster_type': disaster,
            'rainfall': round(rainfall, 2),
            'wind_speed': round(wind_speed, 2),
            'water_level': round(water_level, 2),
            'humidity': round(humidity, 2),
            'historical_indicator': round(historical, 2),
            'severity': severity,
            'affected_population': affected_pop
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    df_engineered = engineer_features(df)
    
    # Calculate target risk level based on rule-grounded composite index
    def calculate_target_risk(row):
        score = row['combined_env_risk']
        pop = row['affected_population']
        sev = row['severity']
        
        # Rule augmentations
        composite = score * 60 + (sev / 5.0) * 25 + min(15.0, pop / 50.0)
        
        if composite >= 68:
            return 'CRITICAL'
        elif composite >= 48:
            return 'HIGH'
        elif composite >= 28:
            return 'MEDIUM'
        else:
            return 'LOW'
            
    df['risk_level'] = df_engineered.apply(calculate_target_risk, axis=1)
    return df

def train_and_save_model():
    print("Generating synthetic disaster data...")
    df = generate_synthetic_dataset(num_samples=1500)
    
    X = df[FEATURE_COLUMNS]
    y = df['risk_level']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model Training Complete! Test Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    artifact = {
        'model': model,
        'scaler': scaler,
        'feature_columns': FEATURE_COLUMNS,
        'classes': list(model.classes_),
        'accuracy': acc
    }
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(artifact, f)
        
    print(f"Saved model artifact to: {MODEL_PATH}")
    return artifact

if __name__ == '__main__':
    train_and_save_model()
