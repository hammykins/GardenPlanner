from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Time, Boolean, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base

# For SQLite development, we'll use TEXT for geometry data instead of PostGIS types
# In production with PostgreSQL, these would be Geometry types

class Garden(Base):
    __tablename__ = "gardens"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    boundary = Column(Text)  # GeoJSON string for SQLite, Geometry('POLYGON') for PostgreSQL
    elevation = Column(Float)
    soil_type = Column(String)
    climate_zone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    zones = relationship('Zone', back_populates='garden')
    plants = relationship('Plant', back_populates='garden')
    weather_data = relationship('WeatherData', back_populates='garden')
