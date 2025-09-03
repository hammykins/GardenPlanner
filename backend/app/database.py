from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database configuration
# For local development: defaults to SQLite for simplicity
# For production: use PostgreSQL with PostGIS
# Set DATABASE_URL environment variable to override default

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:@127.0.0.1:5432/garden_planner"  # Use PostgreSQL with trust auth
)

# PostgreSQL connection string example:
# postgresql://postgres:password@localhost:5432/garden_planner

# Configure engine based on database type
if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
    print(f"🗄️  Using SQLite database: {DATABASE_URL}")
else:
    # PostgreSQL configuration (for production and spatial features)
    engine = create_engine(DATABASE_URL)
    print(f"🐘 Using PostgreSQL database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'localhost'}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI
def get_db():
    """Database dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables function
def create_tables():
    """Create all database tables"""
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

# Initialize PostGIS (if using PostgreSQL)
def init_postgis():
    """Initialize PostGIS extensions for PostgreSQL"""
    if not DATABASE_URL.startswith("postgresql"):
        print("⚠️  PostGIS initialization skipped (not using PostgreSQL)")
        return
    
    print("🌍 Initializing PostGIS extensions...")
    try:
        with engine.connect() as conn:
            # Enable PostGIS extensions
            conn.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
            conn.execute("CREATE EXTENSION IF NOT EXISTS postgis_topology;")
            conn.commit()
        print("✅ PostGIS extensions enabled!")
    except Exception as e:
        print(f"⚠️  PostGIS initialization failed: {e}")

# Database initialization function
def initialize_database():
    """Complete database initialization"""
    print("🚀 Initializing Garden Planner database...")
    
    # Initialize PostGIS if using PostgreSQL
    if DATABASE_URL.startswith("postgresql"):
        init_postgis()
    
    # Create all tables
    create_tables()
    
    print("🎉 Database initialization complete!")
