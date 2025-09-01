## Data Sources and External APIs

### Weather Data
- **OpenWeatherMap API**: Primary source for weather forecasts and historical data
  - Endpoint: `api.openweathermap.org/data/2.5/forecast`
  - Features: 5-day forecast, historical data, precipitation probability
  - Example integration in `weather_service.py`

### Plant Database Sources
1. **USDA Plants Database**
   - API: https://plants.sc.egov.usda.gov/api/
   - Comprehensive plant characteristics
   - Growing requirements
   - Native ranges

2. **Trefle.io**
   - Modern REST API for plants
   - Over 1M plants in database
   - Growth, edibility, and distribution data
   - Example endpoint: `https://trefle.io/api/v1/plants`

### Plant Images
1. **Free Sources**:
   - Wikimedia Commons API
   - USDA PLANTS Database images
   - Unsplash API (botanical photography)
   - Example integration in `plant_image_service.py`

2. **Creative Commons Sources**:
   - iNaturalist API (community plant photos)
   - Flickr Creative Commons API
   - PlantNet API (includes image recognition)

### Growing Zone Data
- **USDA Plant Hardiness Zone API**
  - ZIP code to zone mapping
  - Temperature ranges
  - Growing season length

### Example Data Integration
```python
# backend/app/services/data_integration.py
from typing import Dict, List
import aiohttp
import asyncio

async def fetch_plant_data(scientific_name: str) -> Dict:
    """Fetch plant data from multiple sources and merge"""
    async with aiohttp.ClientSession() as session:
        # Fetch from USDA
        usda_data = await fetch_usda_data(session, scientific_name)
        
        # Fetch from Trefle
        trefle_data = await fetch_trefle_data(session, scientific_name)
        
        # Merge data preferring USDA for scientific info
        # and Trefle for growing conditions
        return merge_plant_data(usda_data, trefle_data)

async def fetch_plant_images(plant_name: str, limit: int = 5) -> List[str]:
    """Fetch plant images from multiple free sources"""
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_wikimedia_images(session, plant_name),
            fetch_unsplash_images(session, plant_name),
            fetch_inaturalist_images(session, plant_name)
        ]
        
        results = await asyncio.gather(*tasks)
        return filter_and_deduplicate_images(results, limit)
```

## Environment Variables
```env
# .env example
# Weather API
OPENWEATHER_API_KEY=your_key_here
WEATHER_UPDATE_INTERVAL=3600

# Plant Data APIs
TREFLE_API_KEY=your_key_here
USDA_API_KEY=your_key_here

# Image APIs
UNSPLASH_ACCESS_KEY=your_key_here
FLICKR_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/garden_planner
```
