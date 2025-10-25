from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.db import get_db
from src.models import (
    District,
    DistrictAggregate,
    SocialLife,
    DistrictRhythm,
    GreenPlaces,
    DigitalNoise,
    SocialAvailability,
    LifeBalance,
    Safety,
)
from src.schemas.district import (
    DistrictBaseItem,
    DistrictRead,
    DistrictDetailRead,
    DistrictListResponse,
    DistrictAggregateRead,
    SocialLifeRead,
    DistrictRhythmRead,
    GreenPlacesRead,
    DigitalNoiseRead,
    SocialAvailabilityRead,
    LifeBalanceRead,
    SafetyRead,
)

router = APIRouter(prefix="/districts", tags=["districts"])


@router.get("/base", response_model=List[DistrictBaseItem])
async def list_districts_base(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> List[DistrictBaseItem]:
    stmt = select(District).order_by(District.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/", response_model=DistrictListResponse)
async def list_districts(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
) -> DistrictListResponse:
    total = (await db.execute(select(func.count()).select_from(District))).scalar_one()
    stmt = (
        select(District)
        .order_by(District.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    rows = (await db.execute(stmt)).scalars().all()
    # FastAPI will serialize ORM instances using Pydantic (from_attributes=True)
    return DistrictListResponse(items=rows, total=total, page=page, size=size)


@router.get("/detailed", response_model=List[DistrictDetailRead])
async def list_districts_detailed(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
) -> List[DistrictDetailRead]:
    stmt = (
        select(District)
        .options(
            selectinload(District.social_life),
            selectinload(District.district_rhythm),
            selectinload(District.green_places),
            selectinload(District.digital_noise),
            selectinload(District.social_availability),
            selectinload(District.life_balance),
            selectinload(District.safety),
            selectinload(District.aggregates),
        )
        .order_by(District.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    rows = (await db.execute(stmt)).scalars().unique().all()
    return rows


# --- Per-related model lists (paged) ---
@router.get("/aggregates", response_model=List[DistrictAggregateRead])
async def list_district_aggregates(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[DistrictAggregateRead]:
    stmt = select(DistrictAggregate).order_by(DistrictAggregate.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/social_life", response_model=List[SocialLifeRead])
async def list_social_life(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[SocialLifeRead]:
    stmt = select(SocialLife).order_by(SocialLife.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/district_rhythm", response_model=List[DistrictRhythmRead])
async def list_district_rhythm(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[DistrictRhythmRead]:
    stmt = select(DistrictRhythm).order_by(DistrictRhythm.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/green_places", response_model=List[GreenPlacesRead])
async def list_green_places(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[GreenPlacesRead]:
    stmt = select(GreenPlaces).order_by(GreenPlaces.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/digital_noise", response_model=List[DigitalNoiseRead])
async def list_digital_noise(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[DigitalNoiseRead]:
    stmt = select(DigitalNoise).order_by(DigitalNoise.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/social_availability", response_model=List[SocialAvailabilityRead])
async def list_social_availability(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[SocialAvailabilityRead]:
    stmt = select(SocialAvailability).order_by(SocialAvailability.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/life_balance", response_model=List[LifeBalanceRead])
async def list_life_balance(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[LifeBalanceRead]:
    stmt = select(LifeBalance).order_by(LifeBalance.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows


@router.get("/safety", response_model=List[SafetyRead])
async def list_safety(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=5000),
    db: AsyncSession = Depends(get_db),
) -> List[SafetyRead]:
    stmt = select(Safety).order_by(Safety.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return rows

