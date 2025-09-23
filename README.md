# Garden Yard Planner

A modern web-based application for planning and tracking gardens and landscaping projects with advanced spatial analysis and interactive grid systems.

## 🌟 Key Features

### Interactive Grid System
- **Smart Boundary Drawing**: Draw precise yard boundaries with polygon tools
- **Separate Grid Overlay**: Independent planting grid that fits within your boundary
- **Intuitive Grid Controls**: "Insert Row/Column" and "Delete Row/Column" buttons
- **Real-time Dimensions**: Live display of grid size (e.g., "Grid: 6 × 6")
- **Visual Clarity**: Subtle dashed grid lines that don't interfere with boundary visualization
- **State Persistence**: Grid settings saved between browser sessions

### Address Search & Mapping
- **Intelligent Address Search**: Automatically center map on your property
- **Dual Map Views**: Toggle between satellite imagery and street map views
- **High-Resolution Mapping**: Zoom levels up to 22 for precise planning
- **Location Memory**: Preserves your searched location when resetting garden data

### Advanced Garden Planning
- **Boundary Management**: Draw and edit property boundaries independently from planting areas
- **Smart Reset**: "Reset Garden" preserves location while clearing plant data
- **State Management**: Robust undo/redo system with persistent storage
- **Future Spatial Features**: PostGIS integration for sunlight analysis and spatial operations

## 🏗️ Architecture

- **Backend**: Python FastAPI with SQLAlchemy ORM
- **Frontend**: React + TypeScript with Vite build system  
- **Database**: SQLite (development) / PostgreSQL + PostGIS (production)
- **Mapping**: Mapbox GL JS + Mapbox Draw + USGS National Map imagery
- **State Management**: Zustand store with localStorage persistence

## 📁 Project Structure

```
GardenPlanner/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── models/            # Database models (SQLAlchemy)
│   │   ├── routers/           # API endpoints (/api/*)
│   │   ├── services/          # Business logic
│   │   ├── main.py            # FastAPI application
│   │   └── database.py        # Database configuration
│   ├── venv/                  # Python virtual environment
│   └── requirements.txt       # Python dependencies
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── garden/        # Garden-specific components
│   │   ├── stores/           # Zustand state management
│   │   ├── hooks/            # Custom React hooks
│   │   └── api/              # API client functions
│   ├── package.json          # Node.js dependencies
│   └── vite.config.ts        # Vite build configuration
└── INSTALLATION_GUIDE.md      # Detailed setup instructions

## 🚀 Quick Start

For detailed setup instructions, see [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

### Prerequisites

1. **Python 3.12+** and **Node.js LTS**:
   ```powershell
   winget install Python.Python.3.12
   winget install OpenJS.NodeJS.LTS
   ```

2. **Configure PATH** (if commands not recognized):
   ```powershell
   # Add Node.js to PATH
   $currentPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
   $newPath = $currentPath + ";C:\Program Files\nodejs"
   [System.Environment]::SetEnvironmentVariable("PATH", $newPath, [System.EnvironmentVariableTarget]::User)
   
   # Test installations
   node --version         # Should show v22.x.x
   python.exe --version   # Should show Python 3.12.x
   ```

### Development Setup

#### Option 1: Quick Setup (Recommended)
```powershell
# Run automated setup script
.\setup_quick_dev.ps1
```

#### Option 2: Manual Setup

**Backend Setup:**
```powershell
cd backend
python.exe -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Frontend Setup:**
```powershell
cd frontend  
npm install
```

**Start Development Servers:**
```powershell
# Terminal 1: Backend
cd backend
.\venv\Scripts\Activate.ps1
python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Access Application:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎮 Using the Garden Planner

1. **Search Your Location**: Enter your address in the search bar
2. **Draw Yard Boundary**: Use the polygon tool to outline your property
3. **Add Planting Grid**: Click "📐 Add Grid" to overlay a planting grid
4. **Adjust Grid**: Use "Insert Row/Column" and "Delete Row/Column" to customize
5. **Plan Your Garden**: Grid cells will be used for plant placement (coming soon)
6. **Reset When Needed**: "Reset Garden" clears data but preserves your location

## 🛠️ Technical Stack

**Backend**:
- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLAlchemy**: Python ORM with support for SQLite and PostgreSQL
- **PostGIS**: Spatial database extension (planned for production)
- **Python 3.12**: Latest Python with enhanced performance

**Frontend**:
- **React 18**: Modern UI library with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript for better development experience  
- **Vite**: Fast build tool and development server
- **Mapbox GL JS**: Professional mapping library with drawing capabilities
- **Zustand**: Lightweight state management with persistence

**Development Tools**:
- **npm**: Package management for Node.js dependencies
- **pip**: Package management for Python dependencies
- **Hot Reload**: Both frontend and backend support live reloading during development

## 🔧 Advanced Configuration

### PostgreSQL Setup (Optional - for spatial features)
```powershell
# Install PostgreSQL
winget install PostgreSQL.PostgreSQL.17

# Create database with PostGIS
psql -U postgres
CREATE DATABASE garden_planner;
\c garden_planner;
CREATE EXTENSION postgis;
```

### Environment Variables
```powershell
# For PostgreSQL (instead of default SQLite)
$env:DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/garden_planner"
```

## 🐛 Troubleshooting

### Common Issues

**"Python not found" or "npm not found"**:
- Follow PATH configuration steps in Quick Start section
- Use full paths if needed: `python.exe` instead of `python`

**Database connection issues**:
- SQLite: Check write permissions in backend directory
- PostgreSQL: Verify service is running with `Get-Service postgresql*`

**Port conflicts**:
- Backend: Default 8000 (change with `--port 8001`)  
- Frontend: Default 5173 (configured in vite.config.ts)

### Getting Help
- Check [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for detailed setup instructions
- Review the API documentation at http://localhost:8000/docs when backend is running

## 🚀 Future Development

### Planned Features
- **Plant Management**: Visual plant placement on grid cells with species information
- **Spatial Analysis**: PostGIS-powered sunlight analysis and optimal plant placement
- **Weather Integration**: Real-time weather data and smart irrigation scheduling
- **Seasonal Planning**: Climate-aware planting and harvest calendars
- **Mobile Responsive**: Touch-friendly interface for tablets and phones

### Upcoming Technical Improvements
- **Docker Containerization**: Consistent development environments and easy deployment
- **Testing Suite**: Comprehensive unit and integration tests
- **CI/CD Pipeline**: Automated testing and deployment
- **Performance Optimization**: Database indexing and query optimization
- **Advanced Spatial Features**: Integration with satellite imagery and terrain analysis

### Contributing
This project is in active development. The current focus is on:
1. Stabilizing the grid system and UI components
2. Adding plant placement and management features
3. Implementing spatial analysis capabilities
4. Preparing for containerization and production deployment
