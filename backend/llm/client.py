from openai import AsyncOpenAI
from backend.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Messages
from langchain_community.embeddings import HuggingFaceEmbeddings
from backend.prompt import SYSTEM_PROMPT
def get_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.API_KEY,
        base_url=settings.BASE_URL,
    )

async def get_stream(session_id: str,kb_id: str | None,request: str,db:AsyncSession):
    from backend.service.vector_store import similarity_search
    client = get_client()
    message = []
    if kb_id:
        rag_data = similarity_search(kb_id,request)
        context_str = "\n\n---\n\n".join(
        doc.page_content for doc in rag_data) 
        message.append({"role":"system","content":SYSTEM_PROMPT.format(context=context_str)})
    select_list = await db.execute(select(Messages).where(Messages.session_id == session_id))
    data = select_list.scalars().all()
    if data:
        for item in data:
            message.append({"role":item.role,"content":item.content})
    message.append({"role":"user","content":request})
    result = await client.chat.completions.create(
        model=settings.MODEL_ID,
        messages=message,
        stream=True
    )
    async for chunk in result:
        delta = chunk.choices[0].delta if chunk.choices else None
        if delta and delta.content:
            yield delta.content
    

_embedding_client = None
def get_embedding_client():
    global _embedding_client
    if _embedding_client is None:
        _embedding_client = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODQL)
    return _embedding_client
