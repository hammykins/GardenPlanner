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
    """Simple grid endpoint for testing"""
    # Return mock grid data
    return {
        "garden_id": garden_id,
        "grid_size": size,
        "cells": [
            {"id": f"{i}-{j}", "x": i, "y": j, "planted": False}
            for i in range(10)
            for j in range(10)
        ]
    }
