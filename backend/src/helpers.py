import re
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from src.models.district import District



_PL_MAP = str.maketrans({
    "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ó": "o", "ś": "s", "ż": "z", "ź": "z",
    "Ą": "a", "Ć": "c", "Ę": "e", "Ł": "l", "Ń": "n", "Ó": "o", "Ś": "s", "Ż": "z", "Ź": "z",
})

def normalize_pl(text: str) -> str:
    """Lowercase, trim, collapse spaces, and strip Polish diacritics."""
    t = text.strip().translate(_PL_MAP).lower()
    t = re.sub(r"\s+", " ", t)
    t = t.replace("-", " ")
    return t


def to_code(text: str) -> str:
    """ASCII code used in DB: no diacritics, no spaces/hyphens, lowercase."""
    t = text.strip().translate(_PL_MAP).lower()
    t = re.sub(r"[ \-]+", "", t)
    return t

async def find_district_by_name(db: AsyncSession, name: str) -> Optional[District]:
    code = to_code(name)
    stmt_code = select(District).where(func.lower(District.code) == code)
    row = (await db.execute(stmt_code)).scalars().first()
    if row:
        return row

    stmt = select(District).where(func.lower(District.name) == func.lower(name))
    row = (await db.execute(stmt)).scalars().first()
    if row:
        return row

    stmt2 = select(District).where(District.name.ilike(f"{name}%"))
    row = (await db.execute(stmt2)).scalars().first()
    if row:
        return row

    target = normalize_pl(name)
    all_rows = (await db.execute(select(District))).scalars().all()

    for r in all_rows:
        norm = normalize_pl(r.name)
        if norm == target or norm.startswith(target):
            return r

    for r in all_rows:
        if to_code(r.name) == code or to_code(r.name).startswith(code):
            return r

    return None
