import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)
    
    PROJECT_NAME: str = "AI Disaster Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-disaster-management-2026-antigravity")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Dual Database Support: SQLite default for zero-setup execution, PostgreSQL supported via env
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '../../disaster_management.db'))}".replace('\\', '/')
    )
    
    # Optional LLM key for AI Assistant
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")

settings = Settings()
