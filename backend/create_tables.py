#!/usr/bin/env python3
"""
Create database tables for the Garden Planner application.
This script creates all tables defined in the models.
"""

from app.database import engine, Base
from app.models import feature, user, garden, plant, zone, watering, weather, plant_image, planted_cell

def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    
    try:
        # Import all models to register them with Base
        Base.metadata.create_all(bind=engine)
        print("✅ Successfully created all database tables!")
        
        # List the tables that were created
        print("\nTables created:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise

if __name__ == "__main__":
    create_tables()
