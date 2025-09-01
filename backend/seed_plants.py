import asyncio
import os
from dotenv import load_dotenv
from app.database import SessionLocal
from app.services.plant_net_service import seed_plant_images

async def main():
    load_dotenv()
    
    # Create database session
    async with SessionLocal() as session:
        # Path to our common plants JSON
        plants_file = os.path.join(
            os.path.dirname(__file__),
            'app/data/common_plants.json'
        )
        
        print("Starting to seed plant images...")
        await seed_plant_images(session, plants_file)
        print("Finished seeding plant images!")

if __name__ == "__main__":
    asyncio.run(main())
