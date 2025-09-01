from datetime import datetime, timedelta
from typing import Dict, Optional
import requests
from sqlalchemy.orm import Session
from app.models.weather import WeatherData
from app.models.garden import Garden

class WeatherService:
    def __init__(self, db: Session):
        self.db = db
        # You would need to set up your preferred weather API
        self.api_key = "YOUR_WEATHER_API_KEY"
        self.base_url = "https://api.weatherservice.com/v1"

    async def get_forecast(
        self, 
        garden_id: int, 
        days: int = 7
    ) -> Dict[datetime.date, WeatherData]:
        """Get weather forecast for a garden"""
        garden = self.db.query(Garden).filter(Garden.id == garden_id).first()
        
        # Get garden center coordinates
        garden_shape = shape(garden.boundary)
        center = garden_shape.centroid
        lat, lon = center.y, center.x
        
        # Fetch forecast from weather API
        forecast = await self._fetch_weather_forecast(lat, lon, days)
        
        # Store forecast in database
        weather_data = {}
        for day_forecast in forecast:
            weather = WeatherData(
                garden_id=garden_id,
                date=day_forecast['date'],
                rainfall_mm=day_forecast['rainfall'],
                temperature_high_c=day_forecast['temp_high'],
                temperature_low_c=day_forecast['temp_low'],
                humidity=day_forecast['humidity'],
                wind_speed=day_forecast['wind_speed'],
                conditions=day_forecast['conditions'],
                forecast_date=datetime.now()
            )
            self.db.add(weather)
            weather_data[weather.date] = weather
        
        await self.db.commit()
        return weather_data

    async def _fetch_weather_forecast(
        self, 
        lat: float, 
        lon: float, 
        days: int
    ) -> list:
        """Fetch weather forecast from external API"""
        # This is a placeholder for actual API integration
        # You would implement this using your chosen weather API
        url = f"{self.base_url}/forecast"
        params = {
            "key": self.api_key,
            "lat": lat,
            "lon": lon,
            "days": days
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            return response.json()['forecast']
        except Exception as e:
            # Log error and return mock data for development
            print(f"Weather API error: {e}")
            return self._get_mock_forecast(days)
