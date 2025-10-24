from typing import Optional
from sqlalchemy import Integer, UniqueConstraint, Index, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, BIGINT
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.types import TIMESTAMP, Float
from .base import Base


class DistrictAggregate(Base):
    __tablename__ = "district_aggregates"
    __table_args__ = (
        UniqueConstraint("area_id", "period_start", "period_minutes", "daypart", name="uq_district_agg"),
        Index("idx_dagg_area_period", "area_id", "period_start"),
        Index("idx_dagg_daypart", "daypart"),
    )

    id = mapped_column(BIGINT, primary_key=True, autoincrement=True)

    district_id = mapped_column(
        "area_id",
        BIGINT,
        ForeignKey("areas.id", ondelete="CASCADE"),
        nullable=False,
    )
    period_start = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    period_minutes = mapped_column(Integer, nullable=False)

    daypart = mapped_column(String(32), nullable=True)

    device_count_avg = mapped_column(Float, nullable=True)
    device_count_peak = mapped_column(Float, nullable=True)

    data_transfer_bytes_sum = mapped_column(Float, nullable=True)
    data_transfer_bytes_avg = mapped_column(Float, nullable=True)

    presence_count_avg = mapped_column(Float, nullable=True)
    green_presence_ratio_avg = mapped_column(Float, nullable=True)
    digital_noise_score_avg = mapped_column(Float, nullable=True)
    social_accessibility_score_avg = mapped_column(Float, nullable=True)
    life_balance_score_avg = mapped_column(Float, nullable=True)
    safety_reports_count_sum = mapped_column(Float, nullable=True)

    observations = mapped_column(Integer, nullable=True)
    computed_at = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    metadata_json = mapped_column("metadata", JSONB, nullable=True)

    district = relationship("District", back_populates="aggregates")
