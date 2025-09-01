from datetime import datetime
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, Date, String
from sqlalchemy.orm import relationship
from app.database import Base

class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True)
    garden_id = Column(Integer, ForeignKey('gardens.id'))
    date = Column(Date)
    rainfall_mm = Column(Float)
    temperature_high_c = Column(Float)
    temperature_low_c = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    conditions = Column(String)
    forecast_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    garden = relationship('Garden', back_populates='weather_data')
