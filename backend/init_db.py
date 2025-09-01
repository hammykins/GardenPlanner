import asyncio
import os
from dotenv import load_dotenv
from app.database import create_tables, init_postgis, AsyncSessionLocal

async def init_db():
    """Initialize the database with required extensions and tables"""
    print("Initializing database...")
    
    # Get db session
    async with AsyncSessionLocal() as session:
        # Initialize PostGIS
        print("Enabling PostGIS extensions...")
        await init_postgis(session)
        
        # Create all tables
        print("Creating database tables...")
        await create_tables()
    
    print("Database initialization complete!")

if __name__ == "__main__":
    load_dotenv()  # Load environment variables
    asyncio.run(init_db())
