from typing import Dict, List, Optional
import aiohttp
from fastapi import HTTPException

class USDAService:
    """Service for USDA plant and growing zone data"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.plants_base_url = "https://plants.sc.egov.usda.gov/api/plants/v2"
        self.hardiness_base_url = "https://plants.sc.egov.usda.gov/api/hardiness"
    
    async def get_plant_data(self, scientific_name: str) -> Dict:
        """Get comprehensive plant data from USDA PLANTS Database"""
        url = f"{self.plants_base_url}/search"
        params = {
            "q": scientific_name,
            "pretty": "true"
        }
        
        if self.api_key:
            params["api_key"] = self.api_key
            
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="USDA plant lookup failed")
                
                data = await response.json()
                if not data.get("data"):
                    raise HTTPException(status_code=404, detail="Plant not found")
                
                return data["data"][0]
    
    async def get_hardiness_zone(self, zip_code: str) -> Dict:
        """Get USDA Plant Hardiness Zone data for a ZIP code"""
        url = f"{self.hardiness_base_url}/zones/by-zip/{zip_code}"
        params = {}
        
        if self.api_key:
            params["api_key"] = self.api_key
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Hardiness zone lookup failed")
                
                data = await response.json()
                return {
                    "zone": data["zone"],
                    "temperature_range": data["temperature_range"],
                    "last_frost_date": data.get("last_frost_date"),
                    "first_frost_date": data.get("first_frost_date")
                }
    
    async def get_native_plants(self, state: str) -> List[Dict]:
        """Get list of plants native to a US state"""
        url = f"{self.plants_base_url}/distribution/{state}"
        params = {
            "nativeStatus": "native",
            "pretty": "true"
        }
        
        if self.api_key:
            params["api_key"] = self.api_key
            
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail="Native plants lookup failed")
                
                data = await response.json()
                return data.get("data", [])
