from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .district import District
from .base import Base


class GreenPlaces(Base):
    __tablename__ = "green_places"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    green_life_score = Column(Float, nullable=False)
    total_obs = Column(Integer)
    green_obs = Column(Integer)
    unique_users = Column(Integer)
    green_ratio = Column(Float)

    district = relationship("District", back_populates="green_places")
