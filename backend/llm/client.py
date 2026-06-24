from openai import AsyncOpenAI
from backend.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.models import Messages
def get_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.API_KEY,
        base_url=settings.BASE_URL,
    )


async def get_response(request: str) -> str:
    client = get_client()
    response = await client.chat.completions.create(
        model=settings.MODEL_ID,
        messages=[{"role": "user", "content": request}],
    )
    return response.choices[0].message.content or ""

async def get_stream(session_id: str,request: str,db:AsyncSession):
    client = get_client()
    message = []
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
