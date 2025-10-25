from __future__ import annotations

from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from .config import get_settings
import ssl
import os

settings = get_settings()


class Base(DeclarativeBase):
    __allow_unmapped__ = True

# Enable SSL only if explicitly requested via environment (DB_SSL=1/true/yes)
_USE_SSL = os.getenv("DB_SSL", "0").lower() in {"1", "true", "yes"}
_connect_args = {}
if _USE_SSL:
    ssl_ctx = ssl.create_default_context()
    _connect_args = {"ssl": ssl_ctx}

engine = create_async_engine(
    settings.DB.url_async,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    connect_args=_connect_args,
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
