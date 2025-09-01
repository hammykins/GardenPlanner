from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base

class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(Integer, primary_key=True)
    garden_id = Column(Integer, ForeignKey('gardens.id'))
    name = Column(String)
    boundary = Column(Geometry('POLYGON'))
    sun_exposure = Column(Float)
    soil_ph = Column(Float)
    soil_moisture = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    garden = relationship('Garden', back_populates='zones')
    plants = relationship('Plant', back_populates='zone')
    watering_schedule = relationship('WateringSchedule', back_populates='zone', uselist=False)
