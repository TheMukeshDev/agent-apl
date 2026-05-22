# SportSphere AI Backend Production Configuration

import os
from pathlib import Path
from dotenv import load_dotenv

# Load env variables from .env if present
ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    PORT: int = int(os.getenv("PORT", "8000"))
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    
    # CORS Origins - restrict in production. Fallback to local Vite server.
    # Accepts comma-separated list of origins.
    CORS_ORIGINS: list = [
        origin.strip() 
        for origin in os.getenv(
            "CORS_ORIGINS", 
            "http://localhost:5173,http://127.0.0.1:5173,https://sportsphere-ai.web.app"
        ).split(",") 
        if origin.strip()
    ]

settings = Settings()
