from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import select
from backend.database import get_db,AsyncSession
from typing import Annotated
from backend.models import KnowledgeBase
from backend.service import vector_store
from backend.schema import KnowledgeResponse
router = APIRouter(prefix="/knowledge",tags=["knowledge"])

@router.post("")
async def insert_knowledge(
    name: str,
    description: str,
    db: Annotated[AsyncSession,Depends(get_db)]
):
    kb = KnowledgeBase(name=name,description=description)
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    vector_store.get_collection(kb.id)
    return KnowledgeResponse.model_validate(kb)

@router.get("")
async def knowledge_list(db: Annotated[AsyncSession,Depends(get_db)]):
    result = await db.execute(select(KnowledgeBase).order_by(KnowledgeBase.created_at.desc()))
    items = result.scalars().all()
    return [
        KnowledgeResponse.model_validate(item)
        for item in items
    ]

@router.get("/{kb_id}")
async def get_one_knowledge(kb_id: str,db: Annotated[AsyncSession,Depends(get_db)]):
    result = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404,detail="没有该知识库")
    return KnowledgeResponse.model_validate(item)

@router.delete("/{kb_id}")
async def delete_one(kb_id: str,db: Annotated[AsyncSession,Depends(get_db)]):
    result = await db.execute(select(KnowledgeBase).where(KnowledgeBase.id == kb_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404,detail="没有该知识库")
    vector_store.delete_collection(kb_id)
    await db.delete(item)
    await db.commit()
    return {"ok": True}
    