from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.garden_service import GardenService
from app.services.spatial_service import SpatialService
from app.models.garden import Garden
from app.models.zone import Zone

router = APIRouter()

@router.post("/gardens/", response_model=Garden)
async def create_garden(
    name: str,
    boundary_geojson: dict,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    garden_service = GardenService(db)
    return await garden_service.create_garden(current_user_id, name, boundary_geojson)

@router.get("/gardens/{garden_id}", response_model=Garden)
async def get_garden(
    garden_id: int,
    db: Session = Depends(get_db)
):
    garden_service = GardenService(db)
    garden = await garden_service.get_garden(garden_id)
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")
    return garden

@router.post("/gardens/{garden_id}/zones", response_model=Zone)
async def create_zone(
    garden_id: int,
    zone_data: dict,
    db: Session = Depends(get_db)
):
    garden_service = GardenService(db)
    return await garden_service.create_zone(garden_id, zone_data)

@router.get("/zones/{zone_id}/sunlight")
async def get_zone_sunlight(
    zone_id: int,
    date: datetime = None,
    db: Session = Depends(get_db)
):
    spatial_service = SpatialService(db)
    return await spatial_service.calculate_sunlight_exposure(zone_id, date)
