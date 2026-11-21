import sys
import os
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../ml")))
from predict import evaluate_incident_risk

router = APIRouter(prefix="/risk", tags=["AI Risk Engine"])

class RiskEvaluateRequest(BaseModel):
    rainfall: float = Field(default=0.0, ge=0)
    wind_speed: float = Field(default=0.0, ge=0)
    water_level: float = Field(default=0.0, ge=0)
    humidity: float = Field(default=50.0, ge=0, le=100)
    historical_indicator: float = Field(default=0.1, ge=0, le=1)
    severity: int = Field(default=1, ge=1, le=5)
    affected_population: int = Field(default=0, ge=0)

@router.post("/predict")
def predict_risk(request: RiskEvaluateRequest):
    data_dict = request.model_dump()
    result = evaluate_incident_risk(data_dict)
    return result
