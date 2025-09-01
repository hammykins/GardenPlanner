from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, Time, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class WateringSchedule(Base):
    __tablename__ = "watering_schedules"
    
    id = Column(Integer, primary_key=True)
    zone_id = Column(Integer, ForeignKey('zones.id'))
    irrigation_type = Column(String)
    base_frequency_days = Column(Integer)
    water_amount_ml = Column(Float)
    start_time = Column(Time)
    duration_minutes = Column(Integer)
    rain_sensitivity_mm = Column(Float)
    skip_if_rain_forecast = Column(Boolean, default=True)
    temperature_adjustment = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    zone = relationship('Zone', back_populates='watering_schedule')
    events = relationship('WateringEvent', back_populates='schedule')

class WateringEvent(Base):
    __tablename__ = "watering_events"
    
    id = Column(Integer, primary_key=True)
    schedule_id = Column(Integer, ForeignKey('watering_schedules.id'))
    planned_date = Column(DateTime)
    actual_date = Column(DateTime, nullable=True)
    status = Column(String)
    skip_reason = Column(String, nullable=True)
    water_amount_ml = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    schedule = relationship('WateringSchedule', back_populates='events')
