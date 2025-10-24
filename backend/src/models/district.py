from sqlalchemy import String
from sqlalchemy.dialects.postgresql import JSONB, ENUM, BIGINT
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.types import Float
from .base import Base
from .enums import DistrictType


class District(Base):
    __tablename__ = "areas"

    id = mapped_column(BIGINT, primary_key=True, autoincrement=True)
    name = mapped_column(String(200), nullable=False, index=True)
    code = mapped_column(String(100), nullable=False, unique=True)

    district_type = mapped_column(
        "area_type",
        ENUM(DistrictType, name="area_type", create_constraint=False),
        nullable=True,
    )

    center_lon = mapped_column(Float, nullable=True)
    center_lat = mapped_column(Float, nullable=True)
    bounds_geojson = mapped_column(JSONB, nullable=True)
    metadata_json = mapped_column("metadata", JSONB, nullable=True)

    metrics = relationship("MetricFact", back_populates="district", cascade="all, delete-orphan")
    classifications = relationship("Classification", back_populates="district", cascade="all, delete-orphan")
    aggregates = relationship("DistrictAggregate", back_populates="district", cascade="all, delete-orphan")
