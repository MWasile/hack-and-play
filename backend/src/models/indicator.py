from sqlalchemy import String
from sqlalchemy.dialects.postgresql import BIGINT
from sqlalchemy.orm import mapped_column, relationship
from .base import Base


class IndicatorDefinition(Base):
    __tablename__ = "indicator_definitions"
    __table_args__ = {"extend_existing": True}

    id = mapped_column(BIGINT, primary_key=True, autoincrement=True)
    # Optional: keep minimal shape; add other columns later if needed
    # name = mapped_column(String(200), unique=True, nullable=False)

    metrics = relationship("MetricFact", back_populates="indicator")

