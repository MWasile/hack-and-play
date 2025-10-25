from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .district import District
from .base import Base


class DistrictRhythm(Base):
    __tablename__ = "district_rhythm"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    rhythm_score = Column(Float, nullable=False)
    peak_hour = Column(Integer)
    activity_amplitude = Column(Float)
    avg_activity = Column(Float)

    district = relationship("District", back_populates="district_rhythm")
