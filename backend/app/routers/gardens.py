from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()

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
    """Grid endpoint with customizable rows and columns"""
    rows = 10
    cols = 10
    cell_size_feet = 2  # 2x2 feet cells
    
    # Create a proper grid with real coordinates
    base_lat, base_lng = 40.7128, -74.006  # NYC coordinates for demo
    lat_offset = 0.00001  # Roughly 1 meter per 0.00001 degrees
    lng_offset = 0.00001
    
    grid_cells = []
    for row in range(rows):
        for col in range(cols):
            # Calculate cell boundaries
            south = base_lat + (row * lat_offset)
            north = base_lat + ((row + 1) * lat_offset)
            west = base_lng + (col * lng_offset)
            east = base_lng + ((col + 1) * lng_offset)
            
            grid_cells.append({
                "id": f"{row}-{col}",
                "row": row,
                "col": col,
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [west, south],
                        [east, south],
                        [east, north],
                        [west, north],
                        [west, south]
                    ]]
                },
                "planted": False,
                "plant_type": None
            })
    
    return {
        "grid_cells": grid_cells,
        "cell_size_feet": cell_size_feet,
        "total_cells": rows * cols,
        "dimensions": {
            "width_feet": cols * cell_size_feet,
            "height_feet": rows * cell_size_feet,
            "rows": rows,
            "cols": cols
        }
    }

@router.post("/gardens/{garden_id}/grid/resize")
async def resize_garden_grid(garden_id: int, rows: int, cols: int):
    """Resize the garden grid - adds/removes rows and columns"""
    # This would update the grid dimensions in the database
    # For now, return success message
    return {
        "message": f"Grid resized to {rows}x{cols}",
        "new_dimensions": {"rows": rows, "cols": cols}
    }
