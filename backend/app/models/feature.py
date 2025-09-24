from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Feature(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    garden_id = Column(Integer, ForeignKey('gardens.id'))
    name = Column(String)
    boundary = Column(Text)  # GeoJSON string
    color = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User')
    garden = relationship('Garden')
