from pydantic import BaseModel,Field,ConfigDict
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

class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    file_type: str
    file_size: int
    chunk_count: int
    created_at: datetime

class KnowledgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    doc_count: int
    chunk_count: int
    created_at: datetime