from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
from src.models.enums import DistrictType


class ClassificationBase(BaseModel):
    district_id: int
    effective_from: datetime
    effective_to: Optional[datetime] = None
    district_type: DistrictType
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: Optional[str] = None

    @field_validator("effective_from", "effective_to")
    @classmethod
    def ensure_tz(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        if v.tzinfo is None or v.tzinfo.utcoffset(v) is None:
            raise ValueError("timestamps must be timezone-aware")
        return v

class ClassificationCreate(ClassificationBase):
    pass

class ClassificationUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    effective_from: Optional[datetime] = None
    effective_to: Optional[datetime] = None
    district_type: Optional[DistrictType] = None
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    rationale: Optional[str] = None

class ClassificationRead(ClassificationBase):
    id: int
