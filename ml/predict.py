import os
import pickle
import numpy as np
import pandas as pd

from feature_engineering import (
    FEATURE_COLUMNS,
    sanitize_input,
    calculate_priority_score,
    generate_risk_explanation
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')

_MODEL_CACHE = None

def load_model_artifact():
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE
        
    if not os.path.exists(MODEL_PATH):
        # Auto-train if model doesn't exist
        from train_model import train_and_save_model
        _MODEL_CACHE = train_and_save_model()
    else:
        with open(MODEL_PATH, 'rb') as f:
            _MODEL_CACHE = pickle.load(f)
            
    return _MODEL_CACHE

def evaluate_incident_risk(input_data: dict) -> dict:
    """
    Evaluates incident environmental and report data using the ML engine.
    
    Returns:
        dict containing:
            - risk_level: str ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
            - risk_score: float (0.0 to 100.0)
            - priority_score: float (0.0 to 100.0)
            - probabilities: dict of class probabilities
            - risk_explanation: list of contributing factor explanations
    """
    sanitized = sanitize_input(input_data)
    artifact = load_model_artifact()
    
    model = artifact['model']
    scaler = artifact['scaler']
    feature_cols = artifact['feature_columns']
    
    df_single = pd.DataFrame([sanitized])[feature_cols]
    scaled_data = scaler.transform(df_single)
    
    probs = model.predict_proba(scaled_data)[0]
    classes = list(model.classes_)
    
    prob_dict = {cls: float(probs[i]) for i, cls in enumerate(classes)}
    predicted_level = str(model.predict(scaled_data)[0])
    
    # Calculate numerical continuous risk score 0 - 100
    level_weights = {'LOW': 15.0, 'MEDIUM': 45.0, 'HIGH': 75.0, 'CRITICAL': 95.0}
    weighted_score = sum(prob_dict.get(cls, 0.0) * level_weights.get(cls, 20.0) for cls in classes)
    risk_score = round(float(np.clip(weighted_score, 0.0, 100.0)), 2)
    
    priority_score = calculate_priority_score(
        risk_score=risk_score,
        severity=sanitized['severity'],
        affected_population=sanitized['affected_population']
    )
    
    explanations = generate_risk_explanation(
        data=sanitized,
        risk_level=predicted_level,
        risk_score=risk_score
    )
    
    return {
        'risk_level': predicted_level,
        'risk_score': risk_score,
        'priority_score': priority_score,
        'probabilities': prob_dict,
        'risk_explanation': explanations,
        'sanitized_inputs': sanitized
    }

if __name__ == '__main__':
    # Test execution
    test_incident = {
        'rainfall': 220.0,
        'wind_speed': 85.0,
        'water_level': 4.2,
        'humidity': 92.0,
        'historical_indicator': 0.8,
        'severity': 4,
        'affected_population': 350
    }
    result = evaluate_incident_risk(test_incident)
    print("Test ML Risk Inference Result:")
    print("Risk Level:", result['risk_level'])
    print("Risk Score:", result['risk_score'])
    print("Priority Score:", result['priority_score'])
    print("Explanations:", result['risk_explanation'])
