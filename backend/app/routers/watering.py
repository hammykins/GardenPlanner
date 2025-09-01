from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.watering_service import WateringService
from app.models.watering import WateringSchedule, WateringEvent

router = APIRouter()

@router.post("/zones/{zone_id}/watering-schedule", response_model=WateringSchedule)
async def create_watering_schedule(
    zone_id: int,
    schedule_data: dict,
    db: Session = Depends(get_db)
):
    watering_service = WateringService(db)
    return await watering_service.create_schedule(zone_id, schedule_data)

@router.get("/schedules/{schedule_id}/events", response_model=List[WateringEvent])
async def get_watering_events(
    schedule_id: int,
    days: int = 7,
    db: Session = Depends(get_db)
):
    watering_service = WateringService(db)
    return await watering_service.get_next_events(schedule_id, days)

@router.post("/events/{event_id}/skip")
async def skip_watering_event(
    event_id: int,
    reason: str,
    db: Session = Depends(get_db)
):
    watering_service = WateringService(db)
    return await watering_service.skip_event(event_id, reason)
