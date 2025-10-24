from sqlalchemy import Integer, UniqueConstraint, Index, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, ENUM, BIGINT
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.types import TIMESTAMP, Float
from .base import Base
from .enums import Daypart


class MetricFact(Base):
    __tablename__ = "metric_facts"
    __table_args__ = (
        UniqueConstraint("area_id", "indicator_id", "ts", "bucket_minutes", name="uq_metric_key"),
        Index("idx_metric_area_indicator_ts", "area_id", "indicator_id", "ts"),
        Index("idx_metric_daypart", "daypart"),
    )

    id = mapped_column(BIGINT, primary_key=True, autoincrement=True)

    district_id = mapped_column(
        "area_id",
        BIGINT,
        ForeignKey("areas.id", ondelete="CASCADE"),
        nullable=False,
    )
    indicator_id = mapped_column(
        BIGINT,
        ForeignKey("indicator_definitions.id", ondelete="CASCADE"),
        nullable=False,
    )

    ts = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    bucket_minutes = mapped_column(Integer, nullable=False)

    daypart = mapped_column(ENUM(Daypart, name="daypart", create_constraint=False), nullable=True)

    value = mapped_column(Float, nullable=False)
    sample_size = mapped_column(Integer, nullable=True)

    metadata_json = mapped_column("metadata", JSONB, nullable=True)

    district = relationship("District", back_populates="metrics")
    indicator = relationship("IndicatorDefinition", back_populates="metrics")
