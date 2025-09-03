# Spatial Database Setup Guide

This guide covers setting up PostGIS spatial database capabilities for the Garden Planner application.

## Overview

The Garden Planner uses spatial database features to:
- Store garden boundaries and zones as geometric shapes
- Calculate plant spacing and zone overlaps
- Perform sunlight analysis based on coordinates
- Process satellite imagery and terrain data
- Handle address geocoding and coordinate transformations

## Database Options

### SQLite (Development)
- **Default for local development**
- No spatial extensions (basic geometry only)
- Suitable for: Basic polygon storage, simple distance calculations
- Database file: `backend/garden_planner.db`

### PostgreSQL + PostGIS (Production)
- **Full spatial database capabilities**
- PostGIS extension provides advanced spatial functions
- Suitable for: Advanced spatial analysis, geographic coordinate systems, complex spatial queries

## PostGIS Setup

### 1. Install PostgreSQL with PostGIS
```powershell
# Install PostgreSQL
winget install PostgreSQL.PostgreSQL.17

# Run setup script
.\setup_postgresql.ps1
```

### 2. Manual PostGIS Setup
If the script doesn't work, set up manually:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE garden_planner;

-- Connect to the database
\c garden_planner;

-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Verify installation
SELECT PostGIS_Full_Version();
```

### 3. Configure Application
Set the database URL to use PostgreSQL:
```powershell
$env:DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/garden_planner"
```

## Spatial Data Models

### Garden Boundaries
```python
# Stored as POLYGON geometry
garden.boundary = Column(Geometry('POLYGON'))

# Example queries:
# - Find gardens within area: ST_Within(garden.boundary, search_area)
# - Calculate garden area: ST_Area(garden.boundary::geography)
# - Find garden center: ST_Centroid(garden.boundary)
```

### Plant Locations
```python
# Stored as POINT geometry
plant.location = Column(Geometry('POINT'))

# Example queries:
# - Plants within zone: ST_Contains(zone.boundary, plant.location)
# - Distance between plants: ST_Distance(plant1.location, plant2.location)
# - Nearest neighbors: ORDER BY ST_Distance(plant.location, target_point)
```

### Zone Management
```python
# Stored as POLYGON geometry
zone.boundary = Column(Geometry('POLYGON'))

# Example queries:
# - Zone area: ST_Area(zone.boundary::geography)
# - Zone overlap: ST_Overlaps(zone1.boundary, zone2.boundary)
# - Points in zone: ST_Contains(zone.boundary, point)
```

## Spatial Indexes

PostGIS automatically creates spatial indexes (GIST) for geometry columns:
```sql
-- Index is created automatically, but can be created manually:
CREATE INDEX idx_gardens_boundary ON gardens USING GIST (boundary);
CREATE INDEX idx_plants_location ON plants USING GIST (location);
CREATE INDEX idx_zones_boundary ON zones USING GIST (boundary);
```

## Coordinate Systems

### Default: WGS84 (SRID 4326)
- Used for: GPS coordinates, latitude/longitude
- Storage: All geometry columns use SRID 4326
- Conversion: Use `ST_Transform()` for other coordinate systems

### Local Projections
For accurate measurements, convert to local UTM:
```python
# In Python/GeoPandas
garden_gdf = garden_gdf.to_crs(garden_gdf.estimate_utm_crs())

# In SQL
SELECT ST_Transform(boundary, 32633) FROM gardens;  -- UTM Zone 33N
```

## Common Spatial Queries

### Area Calculations
```sql
-- Garden area in square meters
SELECT ST_Area(boundary::geography) as area_sqm FROM gardens;

-- Zone area in square feet
SELECT ST_Area(ST_Transform(boundary, 2163)::geography) * 10.764 as area_sqft 
FROM zones;
```

### Distance and Proximity
```sql
-- Find plants within 5 meters of a point
SELECT * FROM plants 
WHERE ST_DWithin(location::geography, ST_Point(-122.4194, 37.7749)::geography, 5);

-- Closest plant to a location
SELECT *, ST_Distance(location::geography, target_point::geography) as distance
FROM plants 
ORDER BY location <-> target_point
LIMIT 1;
```

### Containment and Overlap
```sql
-- Plants within a specific zone
SELECT p.* FROM plants p
JOIN zones z ON ST_Contains(z.boundary, p.location)
WHERE z.id = :zone_id;

-- Overlapping zones
SELECT z1.id, z2.id FROM zones z1, zones z2
WHERE z1.id < z2.id AND ST_Overlaps(z1.boundary, z2.boundary);
```

## Integration with GeoPandas

The application uses GeoPandas for spatial data processing:

```python
import geopandas as gpd
from sqlalchemy import create_engine

# Read spatial data from database
engine = create_engine(DATABASE_URL)
garden_gdf = gpd.read_postgis(
    "SELECT * FROM gardens", 
    con=engine, 
    geom_col='boundary'
)

# Perform spatial operations
garden_gdf['area_sqm'] = garden_gdf.geometry.area
garden_gdf['centroid'] = garden_gdf.geometry.centroid

# Write back to database
garden_gdf.to_postgis(
    'gardens_processed', 
    con=engine, 
    if_exists='replace'
)
```

## Troubleshooting

### PostGIS Not Found
```sql
-- Check if PostGIS is installed
SELECT name, default_version, installed_version 
FROM pg_available_extensions 
WHERE name LIKE 'postgis%';

-- Install if missing
CREATE EXTENSION postgis;
```

### Geometry Errors
```sql
-- Check geometry validity
SELECT ST_IsValid(boundary), ST_IsValidReason(boundary) 
FROM gardens WHERE NOT ST_IsValid(boundary);

-- Fix invalid geometries
UPDATE gardens SET boundary = ST_MakeValid(boundary) 
WHERE NOT ST_IsValid(boundary);
```

### Performance Issues
```sql
-- Check if spatial indexes exist
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('gardens', 'zones', 'plants') 
AND indexname LIKE '%gist%';

-- Create missing indexes
CREATE INDEX CONCURRENTLY idx_plants_location 
ON plants USING GIST (location);
```

## Future Enhancements

### Planned Spatial Features
1. **Satellite Imagery Integration**: Process satellite images for automatic garden detection
2. **Terrain Analysis**: Elevation-based drainage and slope calculations  
3. **Shadow Modeling**: 3D shadow analysis for optimal plant placement
4. **Weather Spatial Data**: Integrate weather station data with spatial interpolation
5. **Soil Analysis Integration**: Connect with soil survey spatial data

### Performance Optimizations
1. **Spatial Clustering**: Cluster related spatial data for faster queries
2. **Materialized Views**: Pre-calculate common spatial aggregations
3. **Spatial Partitioning**: Partition large tables by geographic regions