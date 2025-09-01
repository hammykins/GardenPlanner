from datetime import datetime, timedelta
import geopandas as gpd
from shapely.geometry import shape, Point, Polygon
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.garden import Garden
from app.models.zone import Zone
from app.models.plant import Plant, PlantSpecies
from app.models.weather import WeatherData
from app.services.us_location_service import USLocationService
from app.services.usda_service import USDAService

class GardenService:
    def __init__(self):
        self.location_service = USLocationService()
        self.usda_service = USDAService()

    async def create_garden(self, db: AsyncSession, garden_data: dict) -> Garden:
        """Create a new garden with US location data"""
        # Get precise location data from Census Geocoding
        location_data = await self.location_service.geocode_address(garden_data['address'])
        
        # Convert boundary to PostGIS geometry
        boundary = shape(garden_data['boundary'])
        garden = Garden(
            name=garden_data['name'],
            boundary=boundary.wkt
        )
        
        # Get elevation from USGS
        elevation = await self.location_service.get_elevation(
            location_data["coordinates"]["lat"],
            location_data["coordinates"]["lon"]
        )
        garden.elevation = elevation
        
        # Get hardiness zone from ZIP code
        zip_code = garden_data['address'].split()[-1]  # Simple ZIP extraction
        try:
            hardiness_data = await self.usda_service.get_hardiness_zone(zip_code)
            garden.climate_zone = hardiness_data["zone"]
        except Exception as e:
            # Log the error but continue without hardiness zone
            print(f"Failed to get hardiness zone: {e}")
        
        # Add to database
        db.add(garden)
        await db.commit()
        await db.refresh(garden)
        return garden

    async def get_garden(self, db: AsyncSession, garden_id: int) -> Garden:
        """Get garden by ID"""
        result = await db.execute(
            select(Garden).filter(Garden.id == garden_id)
        )
        return result.scalar_one_or_none()

    async def get_gardens(self, db: AsyncSession) -> list[Garden]:
        """Get all gardens"""
        result = await db.execute(select(Garden))
        return result.scalars().all()

    async def create_zone(self, db: AsyncSession, garden_id: int, zone_data: dict) -> Zone:
        """Create a new zone in the garden with USDA soil data"""
        boundary = shape(zone_data['boundary'])
        garden = await self.get_garden(db, garden_id)
        
        # Create the zone with basic data
        zone = Zone(
            garden_id=garden_id,
            name=zone_data['name'],
            boundary=boundary.wkt,
            sun_exposure=zone_data.get('sun_exposure'),
            soil_ph=zone_data.get('soil_ph'),
            soil_moisture=zone_data.get('soil_moisture')
        )
        
        # If we have the garden's climate zone, get compatible plants
        if garden.climate_zone:
            try:
                # Get native plants for the zone
                native_plants = await self.usda_service.get_native_plants(garden.climate_zone[:2])  # Use state code from zone
                
                # Store this data for plant recommendations
                zone.recommended_plants = [p['id'] for p in native_plants[:10]]  # Store top 10 recommendations
            except Exception as e:
                print(f"Failed to get plant recommendations: {e}")
        
        db.add(zone)
        await db.commit()
        await db.refresh(zone)
        return zone

    async def add_plant(self, zone_id: int, plant_data: dict) -> Plant:
        """Add a new plant to a zone"""
        zone = self.db.query(Zone).filter(Zone.id == zone_id).first()
        location = shape(plant_data['location'])
        
        # Validate location is within zone
        if not self._is_point_in_zone(location, zone):
            raise ValueError("Plant location must be within the zone")
        
        plant = Plant(
            zone_id=zone_id,
            garden_id=zone.garden_id,
            species_id=plant_data['species_id'],
            location=location.wkt,
            planted_date=datetime.now().date()
        )
        self.db.add(plant)
        await self.db.commit()
        await self.db.refresh(plant)
        return plant

    def _is_point_in_zone(self, point: Point, zone: Zone) -> bool:
        """Check if a point is within a zone's boundary"""
        zone_shape = shape(zone.boundary)
        return zone_shape.contains(point)
