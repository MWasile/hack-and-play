from __future__ import annotations

from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings
import ssl

settings = get_settings()


class Base(DeclarativeBase):
    __allow_unmapped__ = True

ssl_ctx = ssl.create_default_context()
engine = create_async_engine(
    settings.DB.url_async,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    connect_args={"ssl": ssl_ctx},

)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session

get_db = get_session
