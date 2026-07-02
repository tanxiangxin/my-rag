from openai import AsyncOpenAI
from backend.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Messages,Session
from langchain_community.embeddings import HuggingFaceEmbeddings
from backend.prompt import SYSTEM_PROMPT,ENSURE_PROMPT
from fastapi import HTTPException

async def get_summary(session_id: str,db: AsyncSession):
    session = await db.get(Session,session_id)
    if not session:
        raise HTTPException(status_code=404,detail="没有该会话")
    result = await db.execute(select(Messages).where(Messages.session_id == session_id))
    data = result.scalars().all()
    if len(data) < settings.MAX_HISTORY_ROUNDS * 2:
        return 
    
    if session.summary:
        return session.summary

    summary_data = data[:-(settings.MAX_HISTORY_ROUNDS * 2)]
    content = "\n".join(f"'role':{one.role},'content':{one.content}\n" for one in summary_data)
    client = get_client()
    answer = await client.chat.completions.create(
        model=settings.MODEL_ID,
        messages=[{"role":"user","content":ENSURE_PROMPT.format(text=content)}]
    )

    if not answer.choices:
        raise HTTPException(status_code=400,detail="提炼要点失败")
    
    summary = answer.choices[0].message.content
    session.summary = summary
    await db.commit()
    return summary


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
    summary = await get_summary(session_id,db)
    if summary:
        message.append({"role":"system","content":f"早期对话摘要：\n{summary}"})
    select_list = await db.execute(select(Messages).where(Messages.session_id == session_id))
    data = select_list.scalars().all()
    if data:
        if len(data) > settings.MAX_HISTORY_ROUNDS * 2:
            data = data[-(settings.MAX_HISTORY_ROUNDS * 2):]
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
