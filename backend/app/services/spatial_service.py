import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import aiohttp
import mercantile
import rasterio
from rasterio.warp import transform_bounds, calculate_default_transform
from rasterio.features import geometry_mask
from pysolar.solar import get_altitude_azimuth
from shapely.geometry import shape, box, Polygon, Point
from shapely.ops import transform
import geopandas as gpd
from sqlalchemy.orm import Session
from app.models.garden import Garden
from app.models.zone import Zone

class SpatialService:
    def __init__(self, db: Session):
        self.db = db
        self.usgs_imagery_url = "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage"
        self.grid_size_feet = 1  # Default 1 foot grid squares

    async def calculate_sunlight_exposure(self, zone_id: int, date: datetime = None) -> dict:
        """Calculate sunlight exposure for a zone throughout the day"""
        if date is None:
            date = datetime.now()

        zone = self.db.query(Zone).join(Garden).filter(Zone.id == zone_id).first()
        garden = zone.garden
        
        # Get zone center coordinates
        zone_shape = shape(zone.boundary)
        center = zone_shape.centroid
        lat, lon = center.y, center.x
        
        # Calculate sun positions throughout the day
        hours = np.arange(6, 20)  # 6 AM to 8 PM
        sun_positions = []
        
        for hour in hours:
            time = date.replace(hour=hour)
            altitude, azimuth = get_altitude_azimuth(lat, lon, time)
            sun_positions.append({
                'hour': hour,
                'altitude': altitude,
                'azimuth': azimuth
            })
        
        # Calculate effective sun hours considering obstacles
        total_sun_hours = self._calculate_effective_sunlight(zone_shape, sun_positions)
        
        return {
            'date': date.date(),
            'total_sun_hours': total_sun_hours,
            'hourly_data': sun_positions
        }

    def _calculate_effective_sunlight(self, zone_shape, sun_positions):
        """Calculate effective sunlight hours considering obstacles and shade"""
        # This would include more complex calculations considering:
        # - Surrounding structures
        # - Trees and other obstacles
        # - Seasonal variations
        # For now, returning a simplified calculation
        return len([pos for pos in sun_positions if pos['altitude'] > 0])

    async def get_satellite_imagery(self, bounds: Tuple[float, float, float, float], zoom: int = 19) -> Dict:
        """
        Fetch high-resolution NAIP imagery from USGS for the given bounds
        bounds: (min_lon, min_lat, max_lon, max_lat)
        zoom: zoom level (19 is highest for most detailed view)
        """
        params = {
            "bbox": f"{bounds[0]},{bounds[1]},{bounds[2]},{bounds[3]}",
            "bboxSR": 4326,
            "size": "2048,2048",
            "imageSR": 3857,
            "format": "png",
            "f": "image"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.usgs_imagery_url, params=params) as response:
                if response.status != 200:
                    raise Exception("Failed to fetch satellite imagery")
                
                image_data = await response.read()
                return {
                    "image": image_data,
                    "bounds": bounds,
                    "resolution": self._calculate_resolution(bounds, zoom)
                }

    def create_grid_system(self, boundary: Polygon, grid_size_feet: float = None) -> Dict:
        """
        Create a grid system within the given boundary
        Returns grid cells and their real-world dimensions
        """
        if grid_size_feet:
            self.grid_size_feet = grid_size_feet
            
        # Convert boundary to local UTM projection for accurate measurements
        boundary_gdf = gpd.GeoDataFrame(geometry=[boundary], crs="EPSG:4326")
        utm_crs = self._get_utm_crs(boundary.centroid.y, boundary.centroid.x)
        boundary_utm = boundary_gdf.to_crs(utm_crs)
        
        # Get boundary extent in feet
        minx, miny, maxx, maxy = boundary_utm.total_bounds
        
        # Create grid cells
        grid_cells = []
        x_coords = np.arange(minx, maxx, self.grid_size_feet * 0.3048)  # Convert feet to meters
        y_coords = np.arange(miny, maxy, self.grid_size_feet * 0.3048)
        
        for x in x_coords:
            for y in y_coords:
                cell = box(x, y, x + self.grid_size_feet * 0.3048, y + self.grid_size_feet * 0.3048)
                if cell.intersects(boundary_utm.geometry.iloc[0]):
                    grid_cells.append(cell)
        
        # Convert grid cells back to WGS84
        grid_gdf = gpd.GeoDataFrame(geometry=grid_cells, crs=utm_crs)
        grid_wgs84 = grid_gdf.to_crs("EPSG:4326")
        
        return {
            "grid_cells": [cell.__geo_interface__ for cell in grid_wgs84.geometry],
            "cell_size_feet": self.grid_size_feet,
            "total_cells": len(grid_cells),
            "dimensions": {
                "width_feet": int((maxx - minx) / 0.3048),
                "height_feet": int((maxy - miny) / 0.3048)
            }
        }

    def _calculate_resolution(self, bounds: Tuple[float, float, float, float], zoom: int) -> float:
        """Calculate ground resolution (feet per pixel) at given zoom level"""
        lat = (bounds[1] + bounds[3]) / 2  # Center latitude
        resolution = 156543.03 * np.cos(np.radians(lat)) / (2 ** zoom)  # meters per pixel
        return resolution * 3.28084  # Convert to feet per pixel

    def _get_utm_crs(self, lat: float, lon: float) -> str:
        """Get the appropriate UTM CRS for given coordinates"""
        zone_number = int((lon + 180) / 6) + 1
        zone_letter = 'N' if lat >= 0 else 'S'
        return f"EPSG:326{zone_number:02d}"  # Northern hemisphere UTM zones

    def get_cell_at_coordinates(self, lat: float, lon: float, boundary: Polygon) -> int:
        """Get the grid cell ID at given coordinates"""
        point = Point(lon, lat)
        grid_system = self.create_grid_system(boundary)
        
        for idx, cell in enumerate(grid_system["grid_cells"]):
            if shape(cell).contains(point):
                return idx
        return None
