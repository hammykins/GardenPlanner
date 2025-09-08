from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from app.database import Base

class Feature(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=True)  # Make nullable for development
    garden_id = Column(Integer, nullable=True)  # Make nullable for development
    name = Column(String)
    boundary = Column(Text)  # GeoJSON string
    color = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
