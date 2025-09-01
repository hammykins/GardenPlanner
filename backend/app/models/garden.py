from datetime import datetime, date
from geoalchemy2 import Geometry
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Time, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Garden(Base):
    __tablename__ = "gardens"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    boundary = Column(Geometry('POLYGON'))
    elevation = Column(Float)
    soil_type = Column(String)
    climate_zone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    zones = relationship('Zone', back_populates='garden')
    plants = relationship('Plant', back_populates='garden')
    weather_data = relationship('WeatherData', back_populates='garden')
