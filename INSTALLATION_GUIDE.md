# Garden Planner Installation Guide

This guide will help you set up the Garden Planner application on Windows for local development.

## Prerequisites

### 1. Install Python 3.12+
```powershell
winget install Python.Python.3.12
```

### 2. Install Node.js LTS
```powershell
winget install OpenJS.NodeJS.LTS
```

### 3. Configure PATH Environment Variables (Important!)

After installing Python and Node.js, you may need to add them to your PATH. Run these PowerShell commands:

```powershell
# Add Node.js to user PATH (if not automatically added)
$currentPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
$newPath = $currentPath + ";C:\Program Files\nodejs"
[System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::User)

# Refresh current session PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User) + ";" + [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::Machine)

# Verify installations
node --version         # Should show v22.x.x or similar
npm --version          # Should show 10.x.x or similar
python.exe --version   # Should show Python 3.12.x (use python.exe to bypass Microsoft Store alias)
```

**Important Notes**:
- Python paths are usually added automatically during installation
- Node.js may need manual PATH configuration
- Use `python.exe` instead of `python` to bypass Microsoft Store alias
- PATH changes are permanent and will persist across new terminal sessions

## Quick Start (Recommended for Development)

### Quick Setup with SQLite
Run the automated setup script from the project root:

```powershell
.\setup_quick_dev.ps1
```

This script will:
- Create Python virtual environment
- Install all Python dependencies
- Set up SQLite database with tables
- Provide instructions for starting servers

### Manual Setup Steps

If you prefer manual setup or the script doesn't work:

#### 1. Backend Setup
```powershell
cd backend

# Create virtual environment (using python.exe to avoid Microsoft Store alias)
python.exe -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create database tables
python -c "from app.database import create_tables; create_tables()"
```

#### 2. Frontend Setup
```powershell
cd frontend
npm install
```

#### 3. Start Development Servers

**Backend** (Terminal 1):
```powershell
cd backend
# Activate virtual environment if not already active
.\venv\Scripts\Activate.ps1
# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend** (Terminal 2):
```powershell
cd frontend
npm run dev
```

## Production Setup with PostgreSQL

For production-like development with spatial features:

### 1. Install PostgreSQL
```powershell
winget install PostgreSQL.PostgreSQL.17
```

### 2. Setup Database
Run the PostgreSQL setup script:
```powershell
.\setup_postgresql.ps1
```

Or manually:
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE garden_planner;
\c garden_planner;
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
```

### 3. Configure Database Connection
Set environment variable:
```powershell
$env:DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/garden_planner"
```

### 4. Start Backend with PostgreSQL
```powershell
cd backend
$env:DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/garden_planner"
.\venv\Scripts\uvicorn.exe app.main:app --reload
```

## Access the Application

Once both servers are running:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000  
- **API Documentation**: http://localhost:8000/docs

## Troubleshooting

### Python Not Found
If Python is not recognized, use the full path:
```powershell
& "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe"
```

### PostgreSQL Service Issues
```powershell
# Check service status
Get-Service -Name "*postgresql*"

# Start service if stopped
Start-Service postgresql-x64-17  # Adjust service name as needed
```

### Port Conflicts
- Backend: Default port 8000 (change with `--port 8001`)
- Frontend: Default port 5173 (configured in vite.config.ts)

### Database Connection Issues
- SQLite: Ensure write permissions in backend directory
- PostgreSQL: Verify service is running and credentials are correct

## Development Workflow

1. **First-Time Setup**: Run `.\setup_quick_dev.ps1` for automated SQLite setup
2. **Daily Development**: 
   - **Backend Terminal**: `cd backend && .\venv\Scripts\Activate.ps1 && python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
   - **Frontend Terminal**: `cd frontend && npm run dev`
3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
4. **Testing**: Run `pytest` in backend directory (with virtual environment activated)

## Current Features (Updated)

### Interactive Grid System ✨ NEW
The Garden Planner includes an advanced grid system for organizing planting areas:

- **Separate Boundary and Grid**: Draw your yard boundary with the polygon drawing tool, then add an independent planting grid overlay
- **Intuitive Grid Controls**: 
  - Toggle: "📐 Add Grid" / "🎯 Grid Active" button
  - Dimensions: Real-time display (e.g., "Grid: 6 × 6")
  - Row Controls: "Insert Row" and "Delete Row" buttons
  - Column Controls: "Insert Column" and "Delete Column" buttons
- **Smart Integration**: Grid automatically fits within your drawn boundary polygon
- **Visual Design**: Subtle dashed grid lines (3px dash pattern) don't interfere with boundary visualization
- **State Persistence**: Grid settings and visibility persist between browser sessions
- **Dynamic Sizing**: Grid cells automatically resize based on boundary dimensions and row/column count

### Address Search and Mapping
- **Intelligent Address Search**: Search by street address to automatically center and zoom the map to your property
- **Dual Map Views**: Toggle between satellite imagery and street map views
- **High-Resolution Mapping**: Zoom levels up to 22 for precise garden planning
- **Location Persistence**: Your searched location is preserved when resetting garden data

### Boundary Drawing System
- **Polygon Tool**: Draw precise property boundaries using interactive polygon drawing
- **Edit Capabilities**: Modify boundary points after initial drawing
- **Visual Feedback**: Clear boundary outline with fill options
- **Separation of Concerns**: Boundary defines property limits, grid organizes planting areas

### State Management
- **Smart Reset**: "Reset Garden" button preserves your map location while clearing plant and boundary data
- **Persistent Storage**: Uses browser localStorage to save your garden state between sessions
- **Undo/Redo System**: Built-in history management for plant placement actions
- **Centralized Store**: Zustand-based state management for consistent data handling

### Technical Stack
- **Backend**: FastAPI (Python 3.12) with SQLAlchemy ORM
- **Database**: SQLite for development, PostgreSQL + PostGIS for production spatial features
- **Frontend**: React 18 + TypeScript with Vite build system
- **Mapping**: Leaflet with drawing capabilities and satellite imagery
- **Styling**: CSS modules with responsive design

## Future: Docker Containerization

This setup will be containerized with Docker for:
- Consistent development environments across team members
- Simplified production deployment
- Automated CI/CD pipelines

The Docker setup will include:
- PostgreSQL + PostGIS container
- Backend FastAPI container  
- Frontend React container
- Docker Compose orchestration

Stay tuned for Docker configuration updates!