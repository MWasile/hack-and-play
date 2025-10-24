from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from src.models.enums import Daypart


class MetricBase(BaseModel):
    district_id: int
    indicator_id: int
    ts: datetime = Field(description="Start of the aggregation bucket, timezone-aware")
    bucket_minutes: int = Field(gt=0)
    daypart: Optional[Daypart] = None
    value: float
    sample_size: Optional[int] = Field(default=None, ge=0)
    metadata: Optional[Dict[str, Any]] = None

    @classmethod
    def ensure_timezone(cls, v: datetime) -> datetime:
        if v.tzinfo is None or v.tzinfo.utcoffset(v) is None:
            raise ValueError("ts must be timezone-aware (e.g., UTC)")
        return v

class MetricCreate(MetricBase):
    pass

class MetricUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ts: Optional[datetime] = None
    bucket_minutes: Optional[int] = Field(default=None, gt=0)
    daypart: Optional[Daypart] = None
    value: Optional[float] = None
    sample_size: Optional[int] = Field(default=None, ge=0)
    metadata: Optional[Dict[str, Any]] = None

class MetricRead(MetricBase):
    id: int
