from __future__ import annotations

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

from src.models.enums import DistrictType


class DistrictBaseItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class DistrictAggregateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    daypart: Optional[str] = None
    score_0_100: Optional[float] = None
    unique_users: Optional[int] = None
    presence_count_avg: Optional[float] = None
    green_presence_ratio_avg: Optional[float] = None


class SocialLifeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    normalized_score: float
    raw_score: Optional[float] = None
    rows: Optional[int] = None


class DistrictRhythmRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    rhythm_score: float
    peak_hour: Optional[int] = None
    activity_amplitude: Optional[float] = None
    avg_activity: Optional[float] = None


class GreenPlacesRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    green_life_score: float
    total_obs: Optional[int] = None
    green_obs: Optional[int] = None
    unique_users: Optional[int] = None
    green_ratio: Optional[float] = None


class DigitalNoiseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    digital_noise_score: float
    total_obs: Optional[int] = None
    avg_tech_weight: Optional[float] = None
    noise_index_raw: Optional[float] = None
    unique_users: Optional[int] = None


class SocialAvailabilityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    social_availability_score: float
    active_hours: Optional[int] = None


class LifeBalanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    life_balance_score: float
    presence_ratio: Optional[float] = None
    inverse_noise: Optional[float] = None
    life_balance_raw: Optional[float] = None
    total_obs: Optional[int] = None
    unique_users: Optional[int] = None
    avg_tech_weight: Optional[float] = None
    noise_index_raw: Optional[float] = None
    digital_noise_score: Optional[float] = None


class SafetyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    district_id: int
    incidents: int
    incident_norm: float
    safety_index: float
    safety_level: str


class DistrictRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    district_type: Optional[DistrictType] = None


class DistrictDetailRead(DistrictRead):
    social_life: Optional[List[SocialLifeRead]] = None
    district_rhythm: Optional[List[DistrictRhythmRead]] = None
    green_places: Optional[List[GreenPlacesRead]] = None
    digital_noise: Optional[List[DigitalNoiseRead]] = None
    social_availability: Optional[List[SocialAvailabilityRead]] = None
    life_balance: Optional[List[LifeBalanceRead]] = None
    safety: Optional[List[SafetyRead]] = None
    aggregates: Optional[List[DistrictAggregateRead]] = None


class DistrictListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    items: List[DistrictRead]
    total: int
    page: int
    size: int

