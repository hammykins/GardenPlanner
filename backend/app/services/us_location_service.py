from typing import Dict, Optional, Tuple
import aiohttp
from fastapi import HTTPException

class USLocationService:
    """Service for US-specific location and geocoding operations"""
    
    def __init__(self):
        self.census_geocoding_url = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress"
        self.usgs_elevation_url = "https://epqs.nationalmap.gov/v1/json"
    
    async def geocode_address(self, address: str) -> Dict:
        """Geocode a US address using Census Geocoding API"""
        params = {
            "address": address,
            "benchmark": "Public_AR_Current",
            "format": "json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.census_geocoding_url, params=params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Geocoding failed")
                
                data = await response.json()
                result = data.get("result", {}).get("addressMatches", [])
                
                if not result:
                    raise HTTPException(status_code=404, detail="Address not found")
                
                match = result[0]
                return {
                    "coordinates": {
                        "lat": match["coordinates"]["y"],
                        "lon": match["coordinates"]["x"]
                    },
                    "address": match["matchedAddress"],
                    "accuracy": match["tigerLine"]["side"]
                }
    
    async def get_elevation(self, lat: float, lon: float) -> float:
        """Get elevation from USGS Elevation Point Query Service"""
        params = {
            "x": lon,
            "y": lat,
            "units": "Meters",
            "output": "json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(self.usgs_elevation_url, params=params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Elevation lookup failed")
                
                data = await response.json()
                return float(data["value"])
