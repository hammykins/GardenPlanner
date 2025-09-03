from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Plant(Base):
    __tablename__ = "plants"
    
    id = Column(Integer, primary_key=True)
    garden_id = Column(Integer, ForeignKey('gardens.id'))
    zone_id = Column(Integer, ForeignKey('zones.id'))
    species_id = Column(Integer, ForeignKey('plant_species.id'))
    location = Column(Text)  # GeoJSON point for location data
    planted_date = Column(Date)
    current_height = Column(Float)
    current_spread = Column(Float)
    health_status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    garden = relationship('Garden', back_populates='plants')
    zone = relationship('Zone', back_populates='plants')
    species = relationship('PlantSpecies')

class PlantSpecies(Base):
    __tablename__ = "plant_species"
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    scientific_name = Column(String)
    sun_requirement = Column(String)
    water_requirement = Column(String)
    min_temp = Column(Float)
    max_temp = Column(Float)
    mature_height = Column(Float)
    mature_spread = Column(Float)
    spacing = Column(Float)
    growing_seasons = Column(JSON)
    days_to_harvest = Column(Integer)
    harvest_window_days = Column(Integer)
    companion_plants = Column(JSON)  # List of compatible plant IDs
