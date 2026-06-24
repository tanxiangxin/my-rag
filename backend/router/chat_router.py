from fastapi import APIRouter, Depends, Request, HTTPException
from backend.database import get_db, maker
from backend.models import Messages, Session
from backend.llm.client import get_response, get_stream
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sse_starlette import EventSourceResponse
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


@router.get("/create")
async def get_answer(
    question: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    session_id: str | None = None
) -> str:
    if not session_id:
        session_id = uuid.uuid4().hex
    await ensure_session(session_id, db)

    user_message = Messages.new_user_message(session_id=session_id, question=question)
    db.add(user_message)

    answer = await get_response(question)
    if answer:
        answer_message = Messages.new_assistant_message(session_id=session_id, answer=answer)
        db.add(answer_message)
        await db.commit()
    return answer


@router.get("/stream")
async def get_stream_response(
    request: Request,
    question: str,
    session_id: str | None = None,
):
    if not session_id:
        session_id = uuid.uuid4().hex

    async def get_event():
        async with maker() as db:
            await ensure_session(session_id, db)

            user_message = Messages.new_user_message(session_id=session_id, question=question)
            db.add(user_message)
            await db.commit()

            full_content = ""
            async for token in get_stream(session_id, question, db):
                full_content += token
                if await request.is_disconnected():
                    return
                yield {"event": "token", "data": json.dumps({"type": "token", "content": token})}

            if full_content:
                db.add(Messages.new_assistant_message(session_id, full_content))
                await db.commit()
            yield {"event": "done", "data": json.dumps({"type": "done", "session_id": session_id})}

    return EventSourceResponse(get_event())
