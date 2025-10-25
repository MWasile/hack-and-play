from typing import Optional
from sqlalchemy import Integer, UniqueConstraint, Index, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, BIGINT
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.types import TIMESTAMP, Float
from .base import Base


class DistrictAggregate(Base):
    __tablename__ = "district_aggregates"

    id = mapped_column(BIGINT, primary_key=True, autoincrement=True)
    district_id = mapped_column(
        "district_id",
        BIGINT,
        ForeignKey("districts.id", ondelete="CASCADE"),
        nullable=False,
    )

    daypart = mapped_column(String(32), nullable=True)
    score_0_100 = mapped_column(Float, nullable=True)
    unique_users = mapped_column(Integer, nullable=True)
    presence_count_avg = mapped_column(Float, nullable=True)
    green_presence_ratio_avg = mapped_column(Float, nullable=True)

    district = relationship("District", back_populates="aggregates")

