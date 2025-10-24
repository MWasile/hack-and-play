from typing import Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from src.models.enums import DistrictType


class DistrictBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    code: str = Field(min_length=1, max_length=100)
    district_type: Optional[DistrictType] = None
    center: Optional[Tuple[float, float]] = Field(default=None, description="[lon, lat]")
    bounds_geojson: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class DistrictCreate(DistrictBase):
    pass

class DistrictUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    code: Optional[str] = Field(default=None, min_length=1, max_length=100)
    district_type: Optional[DistrictType] = None
    center: Optional[Tuple[float, float]] = Field(default=None, description="[lon, lat]")
    bounds_geojson: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class DistrictRead(DistrictBase):
    id: int
