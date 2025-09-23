# Garden Planner - Copilot Instructions

## Project Overview
Web-based garden planning application with FastAPI backend and React frontend featuring Mapbox mapping.

## Environment & Setup
- **OS**: Windows PowerShell (use `;` not `&&` to chain commands)
- **Backend**: Python 3.12+ FastAPI on port 8000
- **Frontend**: React+TypeScript+Vite on port 5173
- **Database**: SQLite (development), PostgreSQL (optional)

### Development Commands
```powershell
# Backend: cd backend; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload
# Frontend: cd frontend; npm run dev
```

## Current Architecture

### Working Features
1. **Mapbox Integration**: 
   - Interactive map with USGS National Map imagery (free)
   - Mapbox Draw tools for polygon creation
   - Feature management (create, edit, delete boundaries)
   - Address search with geocoding

2. **API Endpoints** (`/api/` prefix):
   - `GET/POST/PUT/DELETE /api/features/` - Feature CRUD
   - `GET/POST/PUT/DELETE /api/gardens/` - Garden management
   - `GET/POST /api/plants/` - Basic plant endpoints

3. **Database Models**:
   - `Feature`: id, name, boundary (GeoJSON), color, garden_id
   - Basic models for Garden, Plant, User, Zone (minimal implementation)

### File Structure
```
backend/app/
├── main.py              # FastAPI app
├── database.py          # DB configuration  
├── models/              # SQLAlchemy models
└── routers/             # API endpoints

frontend/src/
├── components/garden/   # Mapbox components
├── api/                 # API client functions
└── stores/              # React state management
```

## Development Guidelines

### Mapbox Development
1. Always consult [Mapbox GL JS docs](https://docs.mapbox.com/mapbox-gl-js/api/) first
2. Use official patterns over custom implementations
3. Current implementation uses USGS imagery + Mapbox Draw tools only

### API Patterns
- Routes in `backend/app/routers/`
- Business logic in `backend/app/services/`
- Models in `backend/app/models/`
- Frontend API clients in `frontend/src/api/`

### Terminal Management
- **Critical**: Always close existing terminals before starting new servers
- Backend must use port 8000, frontend must use 5173
- Use `taskkill /F /IM node.exe` if ports are stuck

## Current Limitations
- No user authentication (development mode)
- No plant management beyond basic CRUD
- No watering/weather features yet
- Using SQLite by default (PostgreSQL optional)

## Future Features (Not Implemented)
- Advanced plant management
- Weather integration  
- Watering schedules
- Spatial analysis with PostGIS
- User authentication
