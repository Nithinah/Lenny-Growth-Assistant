from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load from project root .env if it exists
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@127.0.0.1:5433/lenny_assistant"
    LLM_PROVIDER: str = "ollama"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_CHAT_MODEL: str = "gemini-1.5-flash"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    class Config:
        env_file = "../../.env"
        extra = "ignore"

settings = Settings()

# Forced reload for Gemini provider again
