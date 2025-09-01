from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from typing import List

router = APIRouter()

@router.get("/gardens/{garden_id}/plants")
async def get_garden_plants(garden_id: int):
    """Get all plants in a garden"""
    # Return mock plants for now
    return [
        {
            "id": 1,
            "garden_id": garden_id,
            "cell_id": "5-5",
            "plant_name": "Tomato",
            "plant_type": "Vegetable",
            "color": "#ff6b6b"
        }
    ]

@router.post("/gardens/{garden_id}/plants")
async def create_plants_bulk(garden_id: int, plants: List[dict]):
    """Add multiple plants to a garden"""
    # For now, just return the plants with IDs added
    created_plants = []
    for i, plant in enumerate(plants):
        created_plants.append({
            "id": i + 1,
            "garden_id": garden_id,
            **plant
        })
    return created_plants

@router.delete("/gardens/{garden_id}/plants/{plant_id}")
async def delete_plant(garden_id: int, plant_id: int):
    """Delete a plant from the garden"""
    return {"message": "Plant deleted successfully"}