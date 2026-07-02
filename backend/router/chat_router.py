from fastapi import APIRouter, Depends, Request, HTTPException
from backend.database import get_db, maker
from backend.models import Messages, Session
from backend.llm.client import get_stream,get_client
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sse_starlette import EventSourceResponse
from backend.prompt import REWRITE_PROMPT
from backend.config import settings
import uuid
import json

router = APIRouter(prefix="/chat", tags=["chat"])


async def ensure_session(session_id: str, db: AsyncSession) -> Session:
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if session is None:
        session = Session(id=session_id, name=f"会话 {session_id[:8]}")
        db.add(session)
        await db.commit()
    return session

@router.get("/stream")
async def get_stream_response(
    request: Request,
    question: str,
    session_id: str | None = None,
    kb_id: str | None = None
):
    if not session_id:
        session_id = uuid.uuid4().hex

    async def get_event():
        async with maker() as db:
            await ensure_session(session_id, db)

            user_message = Messages.new_user_message(session_id=session_id, question=question)
            db.add(user_message)
            await db.commit()

            session = await db.get(Session, session_id)
            if session and (session.name.startswith("新会话") or session.name.startswith("会话 ")):
                session.name = question[:50] + ("..." if len(question) > 50 else "")
                await db.commit()

            full_content = ""
            requery = await get_requery(question,session_id,db)
            async for token in get_stream(session_id,kb_id,requery,db):
                full_content += token
                if await request.is_disconnected():
                    return
                yield {"event": "token", "data": json.dumps({"type": "token", "content": token})}

            if full_content:
                db.add(Messages.new_assistant_message(session_id, full_content))
                await db.commit()
            yield {"event": "done", "data": json.dumps({"type": "done", "session_id": session_id})}

    return EventSourceResponse(get_event())


async def get_requery(query: str,session_id: str,db:Annotated[AsyncSession,Depends(get_db)]):
    result = await db.execute(select(Messages).where(Messages.session_id == session_id))
    data = result.scalars().all()
    if not data:
        return query
    chat_history = "\n".join(f"{item.role}:{item.content}"for item in data[-3:])
    content = REWRITE_PROMPT.format(chat_history=chat_history,question=query)
    client = get_client()
    answer = await client.chat.completions.create(
        model=settings.MODEL_ID,
        messages=[{"role":"user","content":content}]
    )
    if not answer.choices:
        raise HTTPException(status_code=400,detail="重写失败")
    return answer.choices[0].message.content
