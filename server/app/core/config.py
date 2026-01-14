from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Privy"
    debug: bool = False
    
    # Security
    secret_key: str = "your-secret-key-change-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Database
    database_url: str = "postgresql://privy_user:privy_password@localhost:5432/privy_db"
    
    # Risk Engine
    risk_threshold: float = 0.7
    
    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
