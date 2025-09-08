from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db

router = APIRouter()

class GridResizeRequest(BaseModel):
    rows: int
    cols: int

@router.get("/gardens/{garden_id}")
async def get_garden(garden_id: int):
    """Simple garden endpoint for testing"""
    # Return mock data for now
    return {
        "id": garden_id,
        "name": f"Garden {garden_id}",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[
                [-74.006, 40.7128],
                [-74.005, 40.7128], 
                [-74.005, 40.7138],
                [-74.006, 40.7138],
                [-74.006, 40.7128]
            ]]
        },
        "zones": []
    }

@router.get("/gardens/{garden_id}/grid")
async def get_garden_grid(garden_id: int, size: int = 2):
    """Simple grid endpoint for testing"""
    # Create a simple 4x4 grid within the garden boundary
    base_lat = 40.7128
    base_lng = -74.006
    cell_size = 0.0001  # Approximately 10 meters
    rows = 4
    cols = 4
    
    grid_cells = []
    cell_id = 0
    
    for row in range(rows):
        for col in range(cols):
            # Calculate cell corners
            lat_start = base_lat + (row * cell_size)
            lat_end = base_lat + ((row + 1) * cell_size)
            lng_start = base_lng + (col * cell_size)
            lng_end = base_lng + ((col + 1) * cell_size)
            
            # Create GeoJSON polygon for the cell
            cell = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [lng_start, lat_start],
                        [lng_end, lat_start],
                        [lng_end, lat_end],
                        [lng_start, lat_end],
                        [lng_start, lat_start]
                    ]]
                }
            }
            grid_cells.append(cell)
            cell_id += 1
    
    return {
        "grid_cells": grid_cells,
        "cell_size_feet": 3.0,
        "total_cells": len(grid_cells),
        "dimensions": {
            "width_feet": 12,
            "height_feet": 12
        }
    }

@router.put("/gardens/{garden_id}/grid/resize")
async def resize_garden_grid(garden_id: int, resize_data: GridResizeRequest):
    """Resize the garden grid"""
    # Mock implementation - in practice this would regenerate the grid
    return {
        "garden_id": garden_id,
        "message": f"Grid resized to {resize_data.rows}x{resize_data.cols}",
        "new_dimensions": {
            "rows": resize_data.rows,
            "cols": resize_data.cols
        }
    }
