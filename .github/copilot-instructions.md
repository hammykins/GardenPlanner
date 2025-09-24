# Copilot Instructions

## PowerShell Environment
You are in a PowerShell environment. When providing terminal commands:
- Do NOT use `&&` to chain commands (not supported in PowerShell)
- Use semicolon (`;`) to separate commands on a single line
- Example: `cd path; command1; command2`

## VS Code Terminal Management
VS Code has known issues with terminal automation in this workspace:
- Opening new terminals instead of using existing ones
- Directory context not persisting between commands
- Multiple terminal windows appearing unexpectedly

**Critical Terminal Management Rules**:
1. **ALWAYS close existing terminals before starting new ones**: Use Ctrl+C or close terminal tabs to stop running processes
2. **Wait for ports to be freed**: Give processes time to release ports before restarting
3. **Never start servers when same service is already running**: Check for existing processes first
4. **Close terminals properly**: Use `taskkill /F /IM node.exe` if needed to free up Node.js processes
5. **Restart servers when making configuration changes**: Hot reload doesn't always pick up API URL changes

**Server Restart Protocol**:
1. **Stop existing server**: Ctrl+C in terminal or close terminal tab
2. **Verify port is free**: Wait 2-3 seconds for port release
3. **Start fresh server**: Use new terminal with clean environment
4. **Verify correct port**: Ensure frontend uses 5173, backend uses 8000

## Port Management Strategy
**Frontend Port Requirements**:
- **ALWAYS use port 5173**: The default Vite development port
- **If port 5173 is in use**: Close all terminals first to free up the port using proper terminal closure
- **Terminal cleanup process**:
  1. Use Ctrl+C in any running frontend terminals
  2. Close terminal tabs/windows completely
  3. Use `taskkill /F /IM node.exe` if ports remain occupied
  4. Start fresh with `npm run dev` to ensure port 5173 is used
- **Why port 5173 matters**: 
  - CORS configuration expects this port
  - Consistent development environment
  - Avoids port configuration mismatches
  - API calls are configured for this specific setup

**Configuration Update Protocol**:
When updating API URLs or configuration:
1. **Stop all servers first**: Close terminals completely, don't just restart
2. **Verify changes are saved**: Check file contents after editing
3. **Clear any caches**: Full server restart ensures changes take effect
4. **Start servers in correct order**: Backend first (port 8000), then frontend (port 5173)

**Solution**: Use manual server startup commands:
```powershell
# Terminal 1 - Backend (from project root)
cd backend; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend (from project root)  
cd frontend; npm run dev
```

**If Vite tries to use a different port (like 5174)**:
1. Stop the Vite server (Ctrl+C)
2. Close the terminal tab completely
3. Kill any remaining Node.js processes if needed
4. Open fresh terminal and restart with `npm run dev` to claim port 5173

# Garden Yard Planner - AI Assistant Instructions

## Current Project Status (Updated September 2025)
This is a web-based garden and yard planning application currently in active development. The project has a working FastAPI backend, React frontend with interactive grid system, and uses SQLite for development (with PostgreSQL planned for production).

### Current Architecture
- **Backend** (`/backend/`): Python FastAPI with SQLAlchemy ORM, currently using SQLite database
- **Frontend** (`/frontend/`): React + TypeScript with Vite, featuring Mapbox GL JS with drawing tools and interactive grid system
- **Database**: SQLite for development, PostgreSQL + PostGIS planned for production spatial features
- **State Management**: Zustand store with localStorage persistence

### Key Working Features
1. **Interactive Grid System**: 
   - Separate polygon boundary drawing for yard outline
   - Independent grid overlay with insert/delete row/column controls
   - Real-time grid dimension display and persistence
   
2. **Address Search & Mapping**: 
   - Address search with automatic map centering
   - Satellite/street view toggle
   - High-resolution zoom (up to level 22)
   
3. **Smart State Management**: 
   - Reset function that preserves location while clearing garden data
   - Persistent storage across browser sessions
   - Centralized Zustand store for all garden state

### Current Development Environment
- **Path Configuration**: Both Node.js and Python paths configured in Windows PATH
- **Python**: 3.12.x using `python.exe` command to bypass Microsoft Store alias
- **Node.js**: v22.x with npm v10.x for frontend package management
- **Development Servers**: Backend on port 8000, Frontend on port 5173

## Current Database Schemas (Working Implementation)

### Basic Models (Currently Implemented)
```python
# backend/app/models/ - Current working models
# These are basic models, spatial features will be added later with PostGIS

class Garden(Base):
    __tablename__ = "gardens"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    boundary_data = Column(Text)  # JSON string of polygon coordinates
    
class Plant(Base):
    __tablename__ = "plants"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    species = Column(String)
    
# Additional models exist but are not fully implemented yet
```

## Current API Endpoints (Working)

### Garden Management
```python
# backend/app/routers/ - Current working endpoints with /api prefix
GET /api/gardens/{garden_id}
POST /api/gardens/
PUT /api/gardens/{garden_id}
DELETE /api/gardens/{garden_id}

GET /api/plants/
POST /api/plants/

# All endpoints return mock data currently for frontend development
```

## Current Frontend Components (Working Implementation)

### Grid System Components
```typescript
// frontend/src/components/garden/InteractiveGrid.tsx
interface InteractiveGridProps {
  isGridVisible: boolean;
  rows: number;
  cols: number;
}

// Generates grid cells within boundary polygon
// Uses dashed lines for visual clarity
// Controlled by garden store state

// frontend/src/components/garden/GridControls.tsx  
// Provides intuitive UI controls:
// - Toggle: "📐 Add Grid" / "🎯 Grid Active"
// - "Insert Row/Column" and "Delete Row/Column" buttons
// - Real-time grid dimensions display
```

### State Management (Current Implementation)
```typescript
// frontend/src/stores/gardenStore.ts - Zustand store
interface GardenState {
  // Location and boundary
  address: string | null;
  center: [number, number] | null; 
  boundary: number[][] | null;
  
  // Grid system
  isGridVisible: boolean;
  gridRows: number;
  gridCols: number;
  
  // Actions
  setAddress: (address: string, lat: number, lng: number) => void;
  setBoundary: (boundary: number[][]) => void;
  clearAllData: () => void; // Preserves address/center
  setGridVisible: (visible: boolean) => void;
  insertRow: () => void;
  deleteRow: () => void;
  insertColumn: () => void;
  deleteColumn: () => void;
}
```

## Current Development Patterns

### File Organization (Current Structure)
```
backend/
  ├── app/
  │   ├── main.py              # FastAPI app with /api/* endpoints
  │   ├── database.py          # SQLite configuration
  │   ├── models/              # SQLAlchemy models
  │   └── routers/             # API endpoints
frontend/
  ├── src/
  │   ├── components/garden/   # Garden-specific React components
  │   ├── stores/             # Zustand state management
  │   ├── hooks/              # Custom React hooks
  │   └── api/                # API client functions
```

### Current Workflow (What Actually Works)
1. **Backend Start**: `cd backend && .\venv\Scripts\Activate.ps1 && python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
2. **Frontend Start**: `cd frontend && npm run dev`
3. **Access**: Frontend at http://localhost:5173, Backend at http://localhost:8000
4. **Features**: Address search, boundary drawing, grid system with controls

## Advanced Features (Planned/Future Implementation)

### Spatial Analysis (PostGIS Integration Planned)
from sqlalchemy import Column, Integer, String, Float, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Plant(Base):
    __tablename__ = "plants"
    
    id = Column(Integer, primary_key=True)
    garden_id = Column(Integer, ForeignKey('gardens.id'))
    zone_id = Column(Integer, ForeignKey('zones.id'))
    species_id = Column(Integer, ForeignKey('plant_species.id'))
    location = Column(Geometry('POINT'))
    planted_date = Column(Date)
    
    # Growth tracking
    current_height = Column(Float)
    current_spread = Column(Float)
    health_status = Column(String)
    
    # Relationships
    garden = relationship('Garden', back_populates='plants')
    zone = relationship('Zone', back_populates='plants')
    species = relationship('PlantSpecies')

class PlantSpecies(Base):
    __tablename__ = "plant_species"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    scientific_name = Column(String)
    
    # Growth requirements
    sun_requirement = Column(String)  # full, partial, shade
    water_requirement = Column(String)
    min_temp = Column(Float)
    max_temp = Column(Float)
    
    # Spacing requirements
    mature_height = Column(Float)
    mature_spread = Column(Float)
    spacing = Column(Float)
    
    # Seasonal data
    growing_seasons = Column(JSON)  # Contains climate zone specific data
    days_to_harvest = Column(Integer)
    harvest_window_days = Column(Integer)  # How many days to harvest once ready

class WateringSchedule(Base):
    __tablename__ = "watering_schedules"
    
    id = Column(Integer, primary_key=True)
    zone_id = Column(Integer, ForeignKey('zones.id'))
    irrigation_type = Column(String)  # drip, sprinkler, hose, etc
    base_frequency_days = Column(Integer)  # Base watering frequency
    water_amount_ml = Column(Float)  # Amount of water per session
    start_time = Column(Time)  # Time to start watering
    duration_minutes = Column(Integer)
    rain_sensitivity_mm = Column(Float)  # mm of rain that counts as watering
    
    # Weather adjustments
    skip_if_rain_forecast = Column(Boolean, default=True)
    temperature_adjustment = Column(JSON)  # Adjust water amount based on temp
    
    zone = relationship('Zone', back_populates='watering_schedule')

class WateringEvent(Base):
    __tablename__ = "watering_events"
    
    id = Column(Integer, primary_key=True)
    schedule_id = Column(Integer, ForeignKey('watering_schedules.id'))
    planned_date = Column(DateTime)
    actual_date = Column(DateTime, nullable=True)
    status = Column(String)  # planned, completed, skipped
    skip_reason = Column(String, nullable=True)  # rain, manual, etc
    water_amount_ml = Column(Float)  # Actual amount used
    
    schedule = relationship('WateringSchedule')

class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True)
    garden_id = Column(Integer, ForeignKey('gardens.id'))
    date = Column(Date)
    rainfall_mm = Column(Float)
    temperature_high_c = Column(Float)
    temperature_low_c = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    conditions = Column(String)
    forecast_date = Column(DateTime)  # When this forecast was made
    
    garden = relationship('Garden')
```

## API Endpoints

### Garden Management
```python
# backend/app/routers/gardens.py
from fastapi import APIRouter, Depends, HTTPException
from shapely.geometry import shape
from geoalchemy2.shape import from_shape
from app.services import garden_service, spatial_service

router = APIRouter()

@router.post("/gardens/")
async def create_garden(
    garden_data: GardenCreate,
    current_user: User = Depends(get_current_user)
):
    # Convert GeoJSON to PostGIS geometry
    boundary = shape(garden_data.boundary)
    garden = Garden(
        name=garden_data.name,
        user_id=current_user.id,
        boundary=from_shape(boundary, srid=4326)
    )
    
    # Process satellite imagery for the garden area
    imagery = await spatial_service.process_satellite_image(
        boundary.bounds
    )
    
    # Analyze terrain and environmental factors
    analysis = spatial_service.analyze_terrain(imagery, boundary)
    garden.elevation = analysis.elevation
    garden.soil_type = analysis.soil_type
    
    return await garden_service.create_garden(garden)

@router.get("/gardens/{garden_id}/sunlight")
async def get_garden_sunlight(
    garden_id: int,
    date: datetime = Query(default=None)
):
    garden = await garden_service.get_garden(garden_id)
    return await spatial_service.calculate_sunlight_exposure(garden, date)
```

### Planting and Zoning
```python
# backend/app/routers/planting.py
@router.post("/gardens/{garden_id}/zones")
async def create_planting_zone(
    garden_id: int,
    zone_data: ZoneCreate
):
    garden = await garden_service.get_garden(garden_id)
    
    # Validate zone placement
    if not spatial_service.validate_zone_placement(garden, zone_data.boundary):
        raise HTTPException(400, "Invalid zone placement")
    
    # Calculate environmental factors
    sun_exposure = await spatial_service.calculate_zone_sunlight(
        garden, zone_data.boundary
    )
    
    zone = Zone(
        garden_id=garden_id,
        boundary=from_shape(shape(zone_data.boundary), srid=4326),
        sun_exposure=sun_exposure
    )
    
    return await garden_service.create_zone(zone)

@router.post("/zones/{zone_id}/plants")
async def add_plant(
    zone_id: int,
    plant_data: PlantCreate
):
    zone = await garden_service.get_zone(zone_id)
    
    # Validate plant spacing
    if not spatial_service.validate_plant_spacing(
        zone, plant_data.location, plant_data.species_id
    ):
        raise HTTPException(400, "Invalid plant spacing")
    
    # Check environmental compatibility
    compatibility = await garden_service.check_plant_compatibility(
        zone, plant_data.species_id
    )
    if not compatibility.suitable:
        raise HTTPException(400, f"Unsuitable conditions: {compatibility.reasons}")
    
    return await garden_service.add_plant(plant_data)
```

### Watering Management
```python
# backend/app/routers/watering.py
@router.post("/zones/{zone_id}/watering-schedule")
async def create_watering_schedule(
    zone_id: int,
    schedule_data: WateringScheduleCreate
):
    zone = await garden_service.get_zone(zone_id)
    
    # Calculate optimal watering time based on plants
    optimal_water = await garden_service.calculate_optimal_watering(
        zone, schedule_data.irrigation_type
    )
    
    schedule = WateringSchedule(
        zone_id=zone_id,
        irrigation_type=schedule_data.irrigation_type,
        base_frequency_days=optimal_water.frequency,
        water_amount_ml=optimal_water.amount,
        start_time=schedule_data.start_time,
        duration_minutes=optimal_water.duration
    )
    
    return await garden_service.create_watering_schedule(schedule)

@router.get("/schedules/{schedule_id}/next-events")
async def get_watering_events(
    schedule_id: int,
    days: int = Query(default=7)
):
    schedule = await garden_service.get_watering_schedule(schedule_id)
    weather = await weather_service.get_forecast(schedule.zone.garden)
    
    # Adjust schedule based on weather
    events = await garden_service.generate_watering_events(
        schedule, weather, days
    )
    
    return events

### Weather Integration
```python
# backend/app/routers/weather.py
@router.get("/gardens/{garden_id}/weather")
async def get_garden_weather(
    garden_id: int,
    days: int = Query(default=7)
):
    garden = await garden_service.get_garden(garden_id)
    
    # Get current conditions and forecast
    weather_data = await weather_service.get_garden_weather(
        garden.boundary.centroid,
        days=days
    )
    
    # Calculate impact on watering schedules
    watering_adjustments = await garden_service.calculate_weather_impacts(
        garden, weather_data
    )
    
    return {
        "current": weather_data.current,
        "forecast": weather_data.forecast,
        "watering_adjustments": watering_adjustments
    }

### Harvest Planning
```python
# backend/app/routers/harvesting.py
@router.get("/gardens/{garden_id}/harvest-schedule")
async def get_harvest_schedule(
    garden_id: int,
    start_date: date = Query(default=None),
    end_date: date = Query(default=None)
):
    garden = await garden_service.get_garden(garden_id)
    plants = await garden_service.get_garden_plants(garden_id)
    
    # Calculate expected harvest dates
    harvest_windows = []
    for plant in plants:
        if plant.planted_date:
            est_harvest_date = plant.planted_date + \
                             timedelta(days=plant.species.days_to_harvest)
            harvest_windows.append({
                "plant_id": plant.id,
                "plant_name": plant.species.name,
                "estimated_date": est_harvest_date,
                "harvest_window_start": est_harvest_date,
                "harvest_window_end": est_harvest_date + \
                    timedelta(days=plant.species.harvest_window_days),
                "location": plant.location
            })
    
    return sorted(harvest_windows, key=lambda x: x["estimated_date"])
```

## Frontend Components

### Garden Map Component
```typescript
// frontend/src/components/GardenMap.tsx
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useGardenStore } from '../stores/gardenStore';

interface GardenMapProps {
  garden: Garden;
  onZoneSelect: (zone: Zone) => void;
}

export const GardenMap: React.FC<GardenMapProps> = ({ garden, onZoneSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: garden.center,
        zoom: 18
      });
      
      // Add garden boundary
      map.current.addLayer({
        id: 'garden-boundary',
        type: 'fill',
        source: {
          type: 'geojson',
          data: garden.boundary
        },
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.3
        }
      });
      
      // Add planting zones
      garden.zones.forEach(zone => {
        map.current?.addLayer({
          id: `zone-${zone.id}`,
          type: 'fill',
          source: {
            type: 'geojson',
            data: zone.boundary
          },
          paint: {
            'fill-color': zone.sunExposure > 6 ? '#fb4' : '#48b',
            'fill-opacity': 0.5
          }
        });
      });
    }
  }, [garden]);
  
  return <div ref={mapContainer} style={{ height: '600px' }} />;
};

### Sunlight Analysis Component
```typescript
// frontend/src/components/SunlightAnalysis.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { useSunlightData } from '../hooks/useSunlightData';

interface SunlightAnalysisProps {
  zoneId: number;
  date: Date;
}

export const SunlightAnalysis: React.FC<SunlightAnalysisProps> = ({
  zoneId,
  date
}) => {
  const { data, isLoading } = useSunlightData(zoneId, date);
  
  if (isLoading) return <div>Loading...</div>;
  
  const chartData = {
    labels: data.hours,
    datasets: [{
      label: 'Sunlight Exposure',
      data: data.exposure,
      fill: false,
      borderColor: 'rgb(255, 165, 0)',
      tension: 0.1
    }]
  };
  
  return (
    <div>
      <h3>Daily Sunlight Analysis</h3>
      <Line data={chartData} />
      <div className="stats">
        <div>Total Sun Hours: {data.totalHours}</div>
        <div>Peak Intensity: {data.peakIntensity} (at {data.peakTime})</div>
        <div>Recommended Plants: {data.recommendations.join(', ')}</div>
      </div>
    </div>
  );
};

### Planting Calendar Component
```typescript
// frontend/src/components/PlantingCalendar.tsx
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useGardenStore } from '../stores/gardenStore';

const localizer = momentLocalizer(moment);

interface PlantingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  plantId?: number;
  type: 'planting' | 'harvest' | 'maintenance';
}

export const PlantingCalendar: React.FC = () => {
  const { garden, plants } = useGardenStore();
  
  const events: PlantingEvent[] = plants.flatMap(plant => [
    {
      id: `plant-${plant.id}`,
      title: `Plant ${plant.species.name}`,
      start: plant.plantingDate,
      end: plant.plantingDate,
      plantId: plant.id,
      type: 'planting'
    },
    {
      id: `harvest-${plant.id}`,
      title: `Harvest ${plant.species.name}`,
      start: plant.harvestDate,
      end: plant.harvestDate,
      plantId: plant.id,
      type: 'harvest'
    },
    ...plant.maintenanceDates.map(date => ({
      id: `maintenance-${plant.id}-${date.getTime()}`,
      title: `Maintain ${plant.species.name}`,
      start: date,
      end: date,
      plantId: plant.id,
      type: 'maintenance'
    }))
  ]);
  
  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        eventPropGetter={event => ({
          className: `event-${event.type}`
        })}
      />
    </div>
  );
};
```

### Zone Editor Component
```typescript
// frontend/src/components/ZoneEditor.tsx
import React, { useState } from 'react';
import { MapboxDraw } from '@mapbox/mapbox-gl-draw';
import { useZoneEditor } from '../hooks/useZoneEditor';

interface ZoneEditorProps {
  garden: Garden;
  onZoneCreate: (zone: Zone) => void;
}

export const ZoneEditor: React.FC<ZoneEditorProps> = ({
  garden,
  onZoneCreate
}) => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const { draw, updateZone } = useZoneEditor(garden);

  const handleZoneUpdate = async (geometry: any) => {
    const zoneData = {
      ...selectedZone,
      boundary: geometry
    };
    
    try {
      const updatedZone = await updateZone(zoneData);
      setSelectedZone(updatedZone);
    } catch (error) {
      console.error('Failed to update zone:', error);
    }
  };

  return (
    <div className="zone-editor">
      <div className="zone-tools">
        <button onClick={() => draw.changeMode('draw_polygon')}>
          Draw Zone
        </button>
        {selectedZone && (
          <div className="zone-properties">
            <input
              type="text"
              value={selectedZone.name}
              onChange={(e) => setSelectedZone({
                ...selectedZone,
                name: e.target.value
              })}
            />
            <select
              value={selectedZone.irrigationType}
              onChange={(e) => setSelectedZone({
                ...selectedZone,
                irrigationType: e.target.value
              })}
            >
              <option value="drip">Drip Irrigation</option>
              <option value="sprinkler">Sprinkler</option>
              <option value="hose">Manual Hose</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

### Plant Selection Component
```typescript
// frontend/src/components/PlantSelector.tsx
import React from 'react';
import { usePlantCatalog } from '../hooks/usePlantCatalog';
import { Plant } from '../types';

interface PlantSelectorProps {
  zone: Zone;
  onPlantSelect: (plant: Plant) => void;
}

export const PlantSelector: React.FC<PlantSelectorProps> = ({
  zone,
  onPlantSelect
}) => {
  const { plants, isLoading } = usePlantCatalog({
    sunExposure: zone.sunExposure,
    soilType: zone.soilType,
    climateZone: zone.garden.climateZone
  });

  return (
    <div className="plant-selector">
      <div className="filters">
        <input
          type="text"
          placeholder="Search plants..."
          onChange={(e) => /* implement search */}
        />
        <select onChange={(e) => /* filter by category */}>
          <option value="">All Categories</option>
          <option value="vegetables">Vegetables</option>
          <option value="herbs">Herbs</option>
          <option value="flowers">Flowers</option>
        </select>
      </div>
      
      <div className="plant-grid">
        {plants.map(plant => (
          <div
            key={plant.id}
            className="plant-card"
            onClick={() => onPlantSelect(plant)}
          >
            <img src={plant.image} alt={plant.name} />
            <h4>{plant.name}</h4>
            <div className="plant-info">
              <span>🌞 {plant.sunRequirement}</span>
              <span>💧 {plant.waterRequirement}</span>
              <span>📏 {plant.spacing}cm spacing</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

### Watering Schedule Component
```typescript
// frontend/src/components/WateringSchedule.tsx
import React from 'react';
import { useWateringSchedule } from '../hooks/useWateringSchedule';
import { WeatherForecast } from './WeatherForecast';

interface WateringScheduleProps {
  zone: Zone;
}

export const WateringSchedule: React.FC<WateringScheduleProps> = ({ zone }) => {
  const {
    schedule,
    nextEvents,
    updateSchedule,
    skipWatering
  } = useWateringSchedule(zone);

  const { weather } = useWeatherForecast(zone.garden);

  return (
    <div className="watering-schedule">
      <div className="schedule-config">
        <h3>Watering Configuration</h3>
        <div className="config-form">
          <select
            value={schedule.irrigationType}
            onChange={(e) => updateSchedule({
              ...schedule,
              irrigationType: e.target.value
            })}
          >
            <option value="drip">Drip Irrigation</option>
            <option value="sprinkler">Sprinkler</option>
            <option value="hose">Manual Hose</option>
          </select>
          
          <div className="time-picker">
            <label>Start Time:</label>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => updateSchedule({
                ...schedule,
                startTime: e.target.value
              })}
            />
          </div>
          
          <div className="water-amount">
            <label>Water Amount (ml):</label>
            <input
              type="number"
              value={schedule.waterAmountMl}
              onChange={(e) => updateSchedule({
                ...schedule,
                waterAmountMl: parseInt(e.target.value)
              })}
            />
          </div>
        </div>
      </div>
      
      <div className="upcoming-events">
        <h3>Upcoming Watering Events</h3>
        <WeatherForecast weather={weather} />
        
        {nextEvents.map(event => (
          <div
            key={event.id}
            className={`event ${event.status}`}
          >
            <div className="event-date">
              {formatDate(event.plannedDate)}
            </div>
            <div className="event-details">
              <span>{event.waterAmountMl}ml</span>
              {event.status === 'skipped' && (
                <span className="skip-reason">
                  {event.skipReason}
                </span>
              )}
            </div>
            {event.status === 'planned' && (
              <button onClick={() => skipWatering(event.id)}>
                Skip
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```e handling business logic and data persistence
- **Frontend** (`/frontend/`): React-based UI for garden/yard visualization and planning
- **Database**: PostgreSQL for storing user data, garden layouts, and plant information
- All services are containerized and orchestrated via Docker Compose

## Key Development Workflows

### Environment Setup
```bash
# Start all services in development mode
docker-compose up

# Rebuild containers after dependency changes
docker-compose up --build
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Database Management
Database persistence is handled through volume mapping:
```yaml
db:
  volumes:
    - ./data/postgres:/var/lib/postgresql/data
```

The database uses PostGIS for spatial operations:
- PostGIS extensions are automatically enabled
- Spatial data types (geometry, geography) available
- Supports advanced GIS queries and operations
- Integrates with GeoPandas through SQLAlchemy

Example spatial data model:
```python
# backend/app/models/garden.py
from geoalchemy2 import Geometry
from sqlalchemy import Column, Integer, String
from app.database import Base

class Garden(Base):
    __tablename__ = "gardens"
    
    id = Column(Integer, primary_key=True)
    name = Column(String)
    boundary = Column(Geometry('POLYGON'))  # Store garden boundary
    zones = Column(Geometry('MULTIPOLYGON'))  # Store planting zones
    
    # Query example: Find gardens within 5km of a point
    @classmethod
    def find_nearby(cls, lat, lon, radius_km=5):
        point = f'POINT({lon} {lat})'
        return select(cls).filter(
            func.ST_DWithin(
                cls.boundary,
                func.ST_SetSRID(func.ST_GeomFromText(point), 4326),
                radius_km * 1000
            )
        )
```

Example spatial operations with GeoPandas:
```python
# backend/app/services/spatial_service.py
import geopandas as gpd
from shapely.geometry import Polygon

def process_garden_layout(boundary_coords):
    # Create a GeoDataFrame from boundary coordinates
    garden = gpd.GeoDataFrame({
        'geometry': [Polygon(boundary_coords)],
        'name': ['Main Garden']
    }, crs='EPSG:4326')
    
    # Calculate area and buffer for planting zones
    garden['area_sqm'] = garden.geometry.area
    garden['planting_zone'] = garden.geometry.buffer(-1.0)  # 1m buffer inward
    
    return garden

def export_to_database(gdf, engine):
    # Export GeoDataFrame directly to PostGIS
    gdf.to_postgis(
        name='gardens',
        con=engine,
        if_exists='append',
        index=False
    )
```

Common SQL Operations:
```sql
-- Create spatial index
CREATE INDEX idx_gardens_boundary 
ON gardens USING GIST (boundary);

-- Find overlapping gardens
SELECT a.id, b.id
FROM gardens a, gardens b
WHERE a.id < b.id 
AND ST_Overlaps(a.boundary, b.boundary);

-- Calculate garden area in square meters
SELECT id, name, 
ST_Area(boundary::geography) as area_sqm
FROM gardens;

-- Find all plants within a garden boundary
SELECT p.* 
FROM plants p
JOIN gardens g ON ST_Contains(g.boundary, p.location)
WHERE g.id = :garden_id;
```

Database Migrations Example:
```python
# backend/app/migrations/versions/xxxx_add_spatial_columns.py
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

def upgrade():
    # Enable PostGIS if not enabled
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    
    # Add spatial columns
    op.add_column('gardens', 
        sa.Column('boundary', Geometry('POLYGON', srid=4326))
    )
    
    # Create spatial index
    op.execute(
        'CREATE INDEX idx_gardens_boundary ON gardens USING GIST (boundary)'
    )

def downgrade():
    op.drop_column('gardens', 'boundary')
```

## Specialized Garden Planning Features

### Sunlight Analysis
```python
# backend/app/services/sunlight_service.py
import numpy as np
from datetime import datetime
from pysolar.solar import get_altitude_azimuth

def calculate_sunlight_exposure(garden_gdf, date=datetime.now()):
    """Calculate sunlight exposure for garden zones throughout the day"""
    # Get garden location
    garden_center = garden_gdf.geometry.centroid.iloc[0]
    lat, lon = garden_center.y, garden_center.x
    
    # Calculate sun positions throughout the day
    hours = np.arange(6, 20)  # 6 AM to 8 PM
    sun_positions = [
        get_altitude_azimuth(lat, lon, date.replace(hour=h))
        for h in hours
    ]
    
    # Create sun exposure heatmap
    garden_gdf['sun_hours'] = garden_gdf.geometry.apply(
        lambda geom: calculate_shade_impact(geom, sun_positions)
    )
    
    return garden_gdf

def calculate_shade_impact(geometry, sun_positions):
    """Calculate how many hours of direct sunlight a zone gets"""
    # Implementation would account for:
    # - Garden orientation
    # - Surrounding structure heights
    # - Seasonal sun path
    pass
```

### Zone Planning
```python
# backend/app/services/zone_service.py
from shapely.geometry import Point, Polygon
from shapely.ops import unary_union

def plan_planting_zones(garden_gdf, plants_df):
    """Create optimal planting zones based on plant requirements"""
    # Convert plant spacing to buffer sizes
    plants_df['buffer'] = plants_df['spacing_cm'] / 100.0
    
    # Create zones with proper spacing
    zones = []
    for _, plant in plants_df.iterrows():
        # Create plant location
        plant_point = Point(plant.location)
        # Create buffer for required spacing
        plant_zone = plant_point.buffer(plant['buffer'])
        zones.append(plant_zone)
    
    # Merge overlapping zones
    planting_zones = unary_union(zones)
    
    return planting_zones

def validate_plant_placement(garden_gdf, plant_locations):
    """Validate if plants have adequate spacing"""
    return all(
        check_plant_spacing(loc, plant_locations, min_spacing=1.0)
        for loc in plant_locations
    )
```

### Seasonal Planning
```python
# backend/app/services/seasonal_service.py
from datetime import datetime
import pandas as pd
from geopy.geocoders import Nominatim

def get_growing_season(location, plant_type):
    """Determine optimal growing season based on location"""
    # Get climate zone from coordinates
    geolocator = Nominatim(user_agent="garden_planner")
    location = geolocator.geocode(location)
    
    # Calculate growing season based on:
    # - First/last frost dates
    # - Temperature ranges
    # - Precipitation patterns
    climate_data = get_climate_data(location.latitude, location.longitude)
    
    return {
        'planting_date': calculate_planting_date(climate_data, plant_type),
        'harvest_date': calculate_harvest_date(climate_data, plant_type),
        'watering_schedule': generate_watering_schedule(climate_data)
    }

def generate_planting_calendar(garden_gdf, plants_df):
    """Generate yearly planting/harvest calendar"""
    # Implementation would include:
    # - Crop rotation planning
    # - Companion planting
    # - Seasonal transitions
    pass
```

### Satellite Imagery Processing
```python
# backend/app/services/imagery_service.py
import rasterio
import geopandas as gpd
from rasterio.warp import transform_bounds
from shapely.geometry import box

def process_satellite_image(address):
    """Get and process satellite imagery for an address"""
    # Get coordinates from address
    geolocator = Nominatim(user_agent="garden_planner")
    location = geolocator.geocode(address)
    
    # Define imagery bounds (example using 100x100m area)
    bounds = transform_bounds(
        'EPSG:4326', 'EPSG:3857',  # Transform to Web Mercator
        location.longitude - 0.001,
        location.latitude - 0.001,
        location.longitude + 0.001,
        location.latitude + 0.001
    )
    
    # Create garden boundary from user-drawn polygon
    def create_garden_from_polygon(user_polygon):
        garden_gdf = gpd.GeoDataFrame(
            geometry=[user_polygon],
            crs='EPSG:4326'
        )
        
        # Reproject to local projection for accurate measurements
        garden_gdf = garden_gdf.to_crs(
            garden_gdf.estimate_utm_crs()
        )
        
        return garden_gdf

def analyze_terrain(garden_gdf):
    """Analyze terrain for slope, drainage, etc."""
    # Implementation would include:
    # - Slope calculation
    # - Drainage patterns
    # - Sun exposure based on elevation
    # - Identification of existing features
    pass
```

Each of these features uses spatial analysis capabilities to provide intelligent garden planning assistance. The examples show how to:
- Calculate sun exposure based on location and time
- Create and validate planting zones with proper spacing
- Generate location-specific planting calendars
- Process satellite imagery for garden planning

## Project-Specific Patterns

### API Structure
Backend APIs should follow this structure:
- Route definitions in `backend/app/routers/`
- Business logic in `backend/app/services/`
- Data models in `backend/app/models/`

### Cross-Service Communication
- Frontend communicates with backend via REST API
- CORS is configured to allow requests from frontend (port 3000)
- Environment variables handle service URLs:
  - Backend: `DATABASE_URL=postgresql://postgres:postgres@db:5432/garden_planner`
  - Frontend: `REACT_APP_API_URL=http://localhost:8000`

### Dependencies
Key backend libraries:
- FastAPI for API framework (industry standard for modern Python APIs)
- SQLAlchemy for database ORM (industry standard)
- GeoPandas for geographical data processing (built on Shapely/Pandas)
- PostGIS extension for PostgreSQL (for spatial database features)
- Pillow/NumPy for image processing (industry standards)

Additional considerations:
- GeoPandas provides integrated support for:
  - Reading/writing spatial data formats
  - Spatial operations and analysis
  - Integration with PostGIS
  - Visualization capabilities

## Integration Points
1. **Satellite Imagery**: (Planned) Integration for retrieving yard layouts
2. **Database**: PostgreSQL for persistent storage
3. **Frontend-Backend**: REST API communication over HTTP

## File Organization
```
backend/
  ├── app/              # Main application code
  │   ├── main.py      # FastAPI application entry
  │   ├── models/      # Database models
  │   ├── routers/     # API routes
  │   └── services/    # Business logic
frontend/              # React application (planned)
data/                  # Persistent data storage
```

## Common Tasks
1. Adding new API endpoints:
   - Create route in `backend/app/routers/`
   - Implement service logic in `backend/app/services/`
   - Update API documentation using FastAPI decorators

2. Database changes:
   - Update models in `backend/app/models/`
   - Apply changes through SQLAlchemy

## Data Sources and External APIs

### Weather Data
- **OpenWeatherMap API**: Primary source for weather forecasts and historical data
  - Endpoint: `api.openweathermap.org/data/2.5/forecast`
  - Features: 5-day forecast, historical data, precipitation probability
  - Example integration in `weather_service.py`

### Plant Database Sources
1. **USDA Plants Database**
   - API: https://plants.sc.egov.usda.gov/api/
   - Comprehensive plant characteristics
   - Growing requirements
   - Native ranges

2. **Trefle.io**
   - Modern REST API for plants
   - Over 1M plants in database
   - Growth, edibility, and distribution data
   - Example endpoint: `https://trefle.io/api/v1/plants`

### Plant Images
1. **Free Sources**:
   - Wikimedia Commons API
   - USDA PLANTS Database images
   - Unsplash API (botanical photography)
   - Example integration in `plant_image_service.py`

2. **Creative Commons Sources**:
   - iNaturalist API (community plant photos)
   - Flickr Creative Commons API
   - PlantNet API (includes image recognition)

### Growing Zone Data
- **USDA Plant Hardiness Zone API**
  - ZIP code to zone mapping
  - Temperature ranges
  - Growing season length

### Example Data Integration
```python
# backend/app/services/data_integration.py
from typing import Dict, List
import aiohttp
import asyncio

async def fetch_plant_data(scientific_name: str) -> Dict:
    """Fetch plant data from multiple sources and merge"""
    async with aiohttp.ClientSession() as session:
        # Fetch from USDA
        usda_data = await fetch_usda_data(session, scientific_name)
        
        # Fetch from Trefle
        trefle_data = await fetch_trefle_data(session, scientific_name)
        
        # Merge data preferring USDA for scientific info
        # and Trefle for growing conditions
        return merge_plant_data(usda_data, trefle_data)

async def fetch_plant_images(plant_name: str, limit: int = 5) -> List[str]:
    """Fetch plant images from multiple free sources"""
    async with aiohttp.ClientSession() as session:
        tasks = [
            fetch_wikimedia_images(session, plant_name),
            fetch_unsplash_images(session, plant_name),
            fetch_inaturalist_images(session, plant_name)
        ]
        
        results = await asyncio.gather(*tasks)
        return filter_and_deduplicate_images(results, limit)
```

## Environment Variables
```env
# .env example
# Weather API
OPENWEATHER_API_KEY=your_key_here
WEATHER_UPDATE_INTERVAL=3600

# Plant Data APIs
TREFLE_API_KEY=your_key_here
USDA_API_KEY=your_key_here

# Image APIs
UNSPLASH_ACCESS_KEY=your_key_here
FLICKR_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/garden_planner
```
