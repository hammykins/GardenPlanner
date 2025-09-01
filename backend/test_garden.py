import asyncio
from dotenv import load_dotenv
import json
from app.database import AsyncSessionLocal
from app.services.garden_service import GardenService

async def test_garden_creation():
    """Test creating and retrieving a garden"""
    garden_service = GardenService()
    
    # Sample garden data
    test_garden = {
        "name": "Test Garden",
        "boundary": {
            "type": "Polygon",
            "coordinates": [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
        }
    }
    
    async with AsyncSessionLocal() as session:
        # Create garden
        print("Creating garden...")
        garden = await garden_service.create_garden(session, test_garden)
        print(f"Created garden with ID: {garden.id}")
        
        # Retrieve garden
        print("Retrieving garden...")
        retrieved = await garden_service.get_garden(session, garden.id)
        print(f"Retrieved garden: {retrieved.name}")
        
        # List all gardens
        print("Listing all gardens...")
        gardens = await garden_service.get_gardens(session)
        print(f"Found {len(gardens)} gardens")
        
        return garden.id

if __name__ == "__main__":
    load_dotenv()
    garden_id = asyncio.run(test_garden_creation())
