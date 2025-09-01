from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.watering import WateringSchedule, WateringEvent
from app.models.weather import WeatherData
from app.services.weather_service import WeatherService

class WateringService:
    def __init__(self, db: Session):
        self.db = db
        self.weather_service = WeatherService(db)

    async def create_schedule(self, zone_id: int, schedule_data: dict) -> WateringSchedule:
        """Create a new watering schedule for a zone"""
        schedule = WateringSchedule(
            zone_id=zone_id,
            irrigation_type=schedule_data['irrigation_type'],
            base_frequency_days=schedule_data['frequency'],
            water_amount_ml=schedule_data['water_amount'],
            start_time=schedule_data['start_time'],
            duration_minutes=schedule_data['duration'],
            rain_sensitivity_mm=schedule_data.get('rain_sensitivity', 5.0),
            skip_if_rain_forecast=schedule_data.get('skip_if_rain', True),
            temperature_adjustment=schedule_data.get('temp_adjustment', {
                'high_temp': {'threshold': 30, 'increase_percent': 20},
                'low_temp': {'threshold': 10, 'decrease_percent': 20}
            })
        )
        self.db.add(schedule)
        await self.db.commit()
        await self.db.refresh(schedule)
        return schedule

    async def get_next_events(
        self, 
        schedule_id: int, 
        days: int = 7
    ) -> List[WateringEvent]:
        """Get upcoming watering events for a schedule"""
        schedule = self.db.query(WateringSchedule).filter(
            WateringSchedule.id == schedule_id
        ).first()
        
        # Get weather forecast
        weather = await self.weather_service.get_forecast(
            schedule.zone.garden_id,
            days=days
        )
        
        events = []
        current_date = datetime.now()
        
        for day in range(days):
            event_date = current_date + timedelta(days=day)
            
            # Check if we should water based on weather
            should_water = await self._should_water(
                schedule,
                event_date,
                weather.get(event_date.date())
            )
            
            if should_water:
                # Calculate adjusted water amount
                water_amount = self._adjust_water_amount(
                    schedule.water_amount_ml,
                    weather.get(event_date.date())
                )
                
                event = WateringEvent(
                    schedule_id=schedule_id,
                    planned_date=event_date,
                    status='planned',
                    water_amount_ml=water_amount
                )
                events.append(event)
        
        return events

    async def _should_water(
        self, 
        schedule: WateringSchedule, 
        date: datetime, 
        weather: Optional[WeatherData]
    ) -> bool:
        """Determine if watering should occur based on weather"""
        if not weather:
            return True
            
        # Check recent rainfall
        if weather.rainfall_mm >= schedule.rain_sensitivity_mm:
            return False
            
        # Check forecast
        if (schedule.skip_if_rain_forecast and 
            weather.conditions.lower() in ['rain', 'showers', 'thunderstorm']):
            return False
            
        return True

    def _adjust_water_amount(
        self, 
        base_amount: float, 
        weather: Optional[WeatherData]
    ) -> float:
        """Adjust water amount based on temperature"""
        if not weather:
            return base_amount
            
        adj = 1.0  # Default no adjustment
        
        if weather.temperature_high_c >= 30:  # Hot day
            adj *= 1.2  # Increase by 20%
        elif weather.temperature_high_c <= 10:  # Cool day
            adj *= 0.8  # Decrease by 20%
            
        return base_amount * adj
