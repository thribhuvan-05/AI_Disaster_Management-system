from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api import (
    auth,
    incidents,
    risk,
    rescue,
    shelters,
    hospitals,
    alerts,
    dashboard,
    assistant,
    telemetry
)

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent AI Disaster Management System REST API Platform"
)

# CORS Configuration allowing frontend cross-origin calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under API_V1_STR
api_router_prefix = settings.API_V1_STR

app.include_router(auth.router, prefix=api_router_prefix)
app.include_router(incidents.router, prefix=api_router_prefix)
app.include_router(risk.router, prefix=api_router_prefix)
app.include_router(rescue.router, prefix=api_router_prefix)
app.include_router(shelters.router, prefix=api_router_prefix)
app.include_router(hospitals.router, prefix=api_router_prefix)
app.include_router(alerts.router, prefix=api_router_prefix)
app.include_router(dashboard.router, prefix=api_router_prefix)
app.include_router(assistant.router, prefix=api_router_prefix)
app.include_router(telemetry.router, prefix=api_router_prefix)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "docs": "/docs",
        "data_notice": "Controlled Prototype — Synthetic/Demo Data"
    }
