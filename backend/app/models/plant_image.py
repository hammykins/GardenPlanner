from sqlalchemy import Column, Integer, String, LargeBinary, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class PlantImage(Base):
    __tablename__ = "plant_images"
    
    id = Column(Integer, primary_key=True)
    plant_species_id = Column(Integer, ForeignKey('plant_species.id'))
    file_path = Column(String)        # Path to image file
    content_type = Column(String)     # e.g., 'image/jpeg'
    is_primary = Column(Boolean, default=False)  # Main display image
    source = Column(String)           # e.g., 'plantnet'
    copyright_info = Column(String)   # Attribution if required
    file_size_bytes = Column(Integer) # Size of the image file
    
    # Relationship
    plant_species = relationship('PlantSpecies', back_populates='images')
