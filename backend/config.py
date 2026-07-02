import os
from dotenv import load_dotenv
from pathlib import Path
import re
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

    UPLOAD_URL: str = os.getenv("UPLOAD","./data/uploads")

    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma")
    COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "documents")
    EMBEDDING_MODQL: str = os.getenv("EMBEDDING_MODEL","BAAI/bge-small-zh-v1.5")

    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))
    
    MAX_HISTORY_ROUNDS: int = int(os.getenv("MAX_HISTORY_ROUNDS",10))

settings = Settings()

ENV = Path(".env")

def set_env(key: str,value: str,path: Path = ENV):
    if not path.exists():
        path.write_text(f"{key}={value}\n")
        return 
    
    lines = path.read_text().splitlines()
    patten = re.compile(rf"^\s*{re.escape(key)}\s*=")
    found = False
    for i,line in enumerate(lines):
        if patten.match(line):
            lines[i] = f"{key}={value}\n"
            found = True
            break
    if not found:
        lines.append(f"{key}={value}\n")
    path.write_text("\n".join(lines) + "\n")