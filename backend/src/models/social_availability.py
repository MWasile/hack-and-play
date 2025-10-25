from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .district import District
from .base import Base


class SocialAvailability(Base):
    __tablename__ = "social_availability"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    social_availability_score = Column(Float, nullable=False)
    active_hours = Column(Integer)

    district = relationship("District", back_populates="social_availability")
