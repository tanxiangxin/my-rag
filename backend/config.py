import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "RAG QA API")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DATA_URL: str = os.getenv("DATA_URL","sqlite+aiosqlite:///./chat.db")

    API_KEY: str = os.getenv("API_KEY", "")
    BASE_URL: str = os.getenv("BASE_URL","")
    MODEL_ID: str = os.getenv("MODEL_ID", "deepseek-v4-flash")

    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "documents")

settings = Settings()
