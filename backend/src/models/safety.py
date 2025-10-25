from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class Safety(Base):
    __tablename__ = "safety"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    incidents = Column(Integer, nullable=False)
    incident_norm = Column(Float, nullable=False)
    safety_index = Column(Float, nullable=False)
    safety_level = Column(String, nullable=False)

    district = relationship("District", back_populates="safety")
