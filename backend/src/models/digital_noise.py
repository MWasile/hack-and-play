from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .district import District
from .base import Base


class DigitalNoise(Base):
    __tablename__ = "digital_noise"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    digital_noise_score = Column(Float, nullable=False)
    total_obs = Column(Integer)
    avg_tech_weight = Column(Float)
    noise_index_raw = Column(Float)
    unique_users = Column(Integer)

    district = relationship("District", back_populates="digital_noise")
