from sqlalchemy import String, Float, JSON, ForeignKey, TIMESTAMP, Integer
from sqlalchemy.dialects.postgresql import JSONB, BIGINT, ENUM
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.types import Float
from .base import Base
from .enums import DistrictType


class District(Base):
    __tablename__ = "districts"

    id = mapped_column(BIGINT, primary_key=True, autoincrement=True)
    name = mapped_column(String(200), nullable=False, index=True)
    code = mapped_column(String(100), nullable=False, unique=True)

    district_type = mapped_column(
        "district_type",
        ENUM(DistrictType, name="district_type", create_constraint=False),
        nullable=True,
    )

    social_life = relationship("SocialLife", back_populates="district", cascade="all, delete-orphan")
    district_rhythm = relationship("DistrictRhythm", back_populates="district", cascade="all, delete-orphan")
    green_places = relationship("GreenPlaces", back_populates="district", cascade="all, delete-orphan")
    digital_noise = relationship("DigitalNoise", back_populates="district", cascade="all, delete-orphan")
    social_availability = relationship("SocialAvailability", back_populates="district", cascade="all, delete-orphan")
    life_balance = relationship("LifeBalance", back_populates="district", cascade="all, delete-orphan")
    safety = relationship("Safety", back_populates="district", cascade="all, delete-orphan")
    aggregates = relationship("DistrictAggregate", back_populates="district", cascade="all, delete-orphan")
