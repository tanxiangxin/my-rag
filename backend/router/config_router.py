from fastapi import APIRouter
from backend.config import settings,set_env
import os
router = APIRouter(prefix="/config",tags=["config"])


@router.get("/ai")
def get_ai_config():
    return {
        "API_KEY":settings.API_KEY,
        "BASE_URL":settings.BASE_URL,
        "MODEL_ID":settings.MODEL_ID
    }

@router.put("/ai")
def update_ai(data: dict):
    field_map = {
        "api_key": "API_KEY",
        "base_url": "BASE_URL",
        "model_id": "MODEL_ID",
    }

    for json_key, env_key in field_map.items():
        if json_key in field_map and data[json_key]:
            value = data[json_key].strip()
            set_env(env_key,value)
            os.environ[env_key] = value
            setattr(settings,env_key,value)
    return {"ok":True}

    