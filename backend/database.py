from sqlalchemy.ext.asyncio import AsyncSession,async_sessionmaker,create_async_engine
from sqlalchemy.orm import declarative_base
from backend.config import settings


engine = create_async_engine(
    settings.DATA_URL,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600,
    echo=settings.DEBUG,
)

maker = async_sessionmaker(
    engine,class_=AsyncSession,expire_on_commit=False
)

base = declarative_base()

async def get_db():
    async with maker() as session:
        try:
            yield session
        finally:
            await session.close()