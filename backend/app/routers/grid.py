from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.spatial_service import SpatialService
from shapely.geometry import shape

router = APIRouter()

@router.get("/gardens/{garden_id}/satellite")
async def get_garden_satellite_image(
    garden_id: int,
    zoom: int = Query(default=19, ge=15, le=19),
    db: Session = Depends(get_db)
):
    """Get satellite imagery for a garden area"""
    spatial_service = SpatialService(db)
    garden = await spatial_service.get_garden(garden_id)
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")
    
    # Get garden bounds
    garden_shape = shape(garden.boundary)
    bounds = garden_shape.bounds  # (minx, miny, maxx, maxy)
    
    return await spatial_service.get_satellite_imagery(bounds, zoom)

@router.get("/gardens/{garden_id}/grid")
async def get_garden_grid(
    garden_id: int,
    grid_size: float = Query(default=1.0, gt=0, description="Grid size in feet"),
    db: Session = Depends(get_db)
):
    """Get grid system for garden planning"""
    spatial_service = SpatialService(db)
    garden = await spatial_service.get_garden(garden_id)
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")
    
    garden_shape = shape(garden.boundary)
    return spatial_service.create_grid_system(garden_shape, grid_size)

@router.get("/gardens/{garden_id}/grid/{cell_id}")
async def get_grid_cell_info(
    garden_id: int,
    cell_id: int,
    db: Session = Depends(get_db)
):
    """Get information about a specific grid cell"""
    spatial_service = SpatialService(db)
    garden = await spatial_service.get_garden(garden_id)
    if not garden:
        raise HTTPException(status_code=404, detail="Garden not found")
    
    garden_shape = shape(garden.boundary)
    return spatial_service.get_cell_info(cell_id, garden_shape)
