from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .district import District
from .base import Base


class LifeBalance(Base):
    __tablename__ = "life_balance"
    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    life_balance_score = Column(Float, nullable=False)
    presence_ratio = Column(Float)
    inverse_noise = Column(Float)
    life_balance_raw = Column(Float)
    total_obs = Column(Integer)
    unique_users = Column(Integer)
    avg_tech_weight = Column(Float)
    noise_index_raw = Column(Float)
    digital_noise_score = Column(Float)

    district = relationship("District", back_populates="life_balance")
