from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db

router = APIRouter()

@router.get("/plants")
async def get_plants():
    """Get all available plants"""
    # Mock response for now
    return [
        {"id": 1, "name": "Tomato", "type": "vegetable"},
        {"id": 2, "name": "Rose", "type": "flower"},
        {"id": 3, "name": "Basil", "type": "herb"}
    ]

@router.get("/gardens/{garden_id}/plants")
async def get_garden_plants(garden_id: int):
    """Get plants in a specific garden"""
    # Mock response for now
    return []

@router.post("/gardens/{garden_id}/plants")
async def create_plant(garden_id: int):
    """Add a plant to a garden"""
    # Mock response for now
    return {"message": "Plant added"}
