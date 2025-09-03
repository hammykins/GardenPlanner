#!/usr/bin/env python3
"""
Database initialization script for Garden Planner
Run this to create all database tables and test the connection
"""

import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.database import initialize_database, engine, DATABASE_URL

def main():
    """Initialize the database and test connection"""
    print("🌱 Garden Planner Database Setup")
    print("=" * 40)
    
    try:
        # Test database connection
        print(f"📍 Database URL: {DATABASE_URL}")
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute("SELECT 1").fetchone()
            print("✅ Database connection successful!")
        
        # Initialize database
        initialize_database()
        
        # Import models to ensure they're registered
        print("📋 Importing database models...")
        from app.models import garden, plant, user, zone, watering, weather
        print("✅ All models imported successfully!")
        
        print("\n🎉 Database setup complete!")
        print("\nNext steps:")
        print("1. Start the backend server:")
        print("   uvicorn app.main:app --reload")
        print("2. Visit API docs: http://localhost:8000/docs")
        
    except Exception as e:
        print(f"❌ Error during database setup: {e}")
        print("\nTroubleshooting:")
        if "No such file or directory" in str(e):
            print("- SQLite: Check write permissions in backend directory")
        elif "connection" in str(e).lower():
            print("- PostgreSQL: Ensure service is running")
            print("- Check DATABASE_URL environment variable")
        sys.exit(1)

if __name__ == "__main__":
    main()
