from pydantic import BaseModel,Field
from typing import Annotated
from datetime import datetime

import uuid
class ChatRequest(BaseModel):
    session_id: str = uuid.uuid4().hex
    knowledge_id: str
    question: str

class MessageRequest(BaseModel):
    role: str
    requestion: str