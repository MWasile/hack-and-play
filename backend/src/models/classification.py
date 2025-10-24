from sqlalchemy import CheckConstraint, Text, ForeignKey
from sqlalchemy.dialects.postgresql import ENUM, BIGINT
from sqlalchemy.orm import mapped_column, relationship
from sqlalchemy.types import TIMESTAMP, Numeric
from .base import Base
from .enums import DistrictType


class Classification(Base):
    __tablename__ = "classifications"
    __table_args__ = (
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="ck_class_confidence_range"),
    )

    id = mapped_column(BIGINT, primary_key=True, autoincrement=True)

    district_id = mapped_column(
        "area_id",
        BIGINT,
        ForeignKey("areas.id", ondelete="CASCADE"),
        nullable=False,
    )

    effective_from = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    effective_to = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    district_type = mapped_column(
        "area_type",
        ENUM(DistrictType, name="area_type", create_constraint=False),
        nullable=False,
    )
    confidence = mapped_column(Numeric(3, 2), nullable=False)
    rationale = mapped_column(Text, nullable=True)

    district = relationship("District", back_populates="classifications")
