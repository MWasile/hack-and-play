from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .district import District
from .base import Base


class SocialLife(Base):
    __tablename__ = "social_life"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    normalized_score = Column(Float, nullable=False)
    raw_score = Column(Float)
    rows = Column(Integer)

    district = relationship("District", back_populates="social_life")
