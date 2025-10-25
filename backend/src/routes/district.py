from __future__ import annotations
import httpx
import re

from typing import List, Optional

from fastapi import APIRouter, Depends, Query, HTTPException, Path, Body
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
from src.helpers import find_district_by_name


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
    return DistrictListResponse(items=rows, total=total, page=page, size=size)


@router.get("/detailed", response_model=List[DistrictDetailRead])
async def list_districts_detailed(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=200),
    id: Optional[int] = Query(None, ge=1, description="Filter by district id"),
    db: AsyncSession = Depends(get_db),
) -> List[DistrictDetailRead]:
    base = (
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
    )
    if id is not None:
        stmt = base.where(District.id == id).order_by(District.id.desc())
    else:
        stmt = base.order_by(District.id.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().unique().all()
    return rows


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


@router.get("/{id}/detail", response_model=DistrictDetailRead)
async def get_district_detail_by_id(
    _id: int = Path(..., ge=1),
    db: AsyncSession = Depends(get_db),
) -> DistrictDetailRead:
    stmt = (
        select(District)
        .where(District.id == _id)
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
    )
    row = (await db.execute(stmt)).scalars().unique().one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="District not found")
    return row


@router.post("/by_address", response_model=DistrictBaseItem)
async def get_district_by_address_post(
    address: str = Body(
        ...,
        embed=True,
        min_length=3,
        description="Street and number, e.g. 'Marszałkowska 140'",
    ),
    db: AsyncSession = Depends(get_db),
) -> DistrictBaseItem:
    params = {
        "format": "jsonv2",
        "addressdetails": 1,
        "limit": 1,
        "q": f"{address}, Warszawa, Polska",
        "countrycodes": "pl",
    }
    headers = {"User-Agent": "warsaw-districts/1.0 (contact@example.com)"}
    try:
        async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
            resp = await client.get("https://nominatim.openstreetmap.org/search", params=params)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Geocoding error: {e}") from e

    if not data or "address" not in data[0]:
        raise HTTPException(status_code=404, detail="Address not found in Warsaw")

    addr = data[0]["address"]
    district_name = (
        addr.get("city_district")
        or addr.get("suburb")
        or addr.get("borough")
        or addr.get("quarter")
        or addr.get("neighbourhood")
    )
    if not district_name:
        raise HTTPException(status_code=404, detail="District could not be determined")

    row = await find_district_by_name(db, district_name)
    if not row:
        raise HTTPException(status_code=404, detail=f"District '{district_name}' not found in database")

    stmt = (
        select(District)
        .where(District.id == row.id)
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
    )
    detailed = (await db.execute(stmt)).scalars().unique().one_or_none()
    if detailed is None:
        raise HTTPException(status_code=404, detail="District not found")

    return detailed
