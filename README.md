# Garden Yard Planner

A modern web-based application for planning and managing yard features with professional mapping tools, cost-optimized design, and interactive feature management.

## 🌟 Key Features

### Professional Mapping System
- **Mapbox GL JS Integration**: Professional-grade mapping with drawing tools
- **Cost-Optimized Design**: USGS National Map imagery (free unlimited tiles) + Mapbox drawing tools
- **Multi-Feature Management**: Draw and name multiple yard features (yard, house, garden beds, etc.)
- **Interactive Feature Control**: Hover effects with delete functionality for all saved features
- **Custom Color Selection**: 8 preset colors + custom color picker for feature styling

### Address Search & Navigation
- **Intelligent Address Search**: Mapbox geocoding with autocomplete dropdown
- **OpenStreetMap Fallback**: Works without Mapbox token using free alternatives
- **Smooth Navigation**: Professional flyTo animations for location changes
- **High-Resolution Imagery**: Zoom up to level 22 with satellite+topographic layers

### Feature Management & Persistence
- **Professional Drawing Tools**: Mapbox Draw for precise polygon creation
- **Database Persistence**: PostgreSQL backend with full CRUD operations
- **Interactive Management**: Hover popups with delete confirmation dialogs
- **Real-time Updates**: Immediate visual feedback for all feature operations
- **Usage Monitoring**: Built-in Mapbox usage tracking with progressive alerts

## 🏗️ Architecture

- **Backend**: Python FastAPI with SQLAlchemy ORM
- **Frontend**: React + TypeScript with Vite build system  
- **Database**: PostgreSQL with spatial capabilities
- **Mapping**: Mapbox GL JS + Mapbox Draw + USGS National Map imagery
- **State Management**: React state with API persistence

## 📁 Project Structure

```
GardenPlanner/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── models/            # Database models (SQLAlchemy)
│   │   ├── routers/           # API endpoints (/api/*)
│   │   ├── services/          # Business logic
│   │   ├── main.py            # FastAPI application
│   │   └── database.py        # PostgreSQL configuration
│   ├── venv/                  # Python virtual environment
│   └── requirements.txt       # Python dependencies
├── frontend-vite/             # React + Vite frontend (current)
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── garden/        # Garden-specific components with Mapbox
│   │   ├── stores/           # React state management
│   │   ├── hooks/            # Custom React hooks
│   │   └── api/              # API client functions
│   ├── package.json          # Node.js dependencies
│   └── vite.config.ts        # Vite build configuration with API proxy
├── frontend/                  # Legacy React frontend
└── README.md                  # This documentation

## 🚀 Quick Start

For detailed setup instructions, see [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md)

### Prerequisites

1. **Python 3.12+** and **Node.js LTS**:
   ```powershell
   winget install Python.Python.3.12
   winget install OpenJS.NodeJS.LTS
   ```

2. **PostgreSQL 13+** (required for spatial features):
   ```powershell
   winget install PostgreSQL.PostgreSQL.17
   ```

3. **Mapbox Token** (optional but recommended):
   - Sign up at https://mapbox.com for enhanced address search
   - Free tier includes 50,000 requests/month

### Development Setup

#### Environment Configuration
Create environment files for Mapbox integration:

```powershell
# Create .env in project root (optional - for enhanced features)
echo "MAPBOX_ACCESS_TOKEN=your_mapbox_token_here" > .env

# Create .env in frontend-vite directory
echo "VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here" > frontend-vite/.env
```

#### Backend Setup
```powershell
cd backend
python.exe -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Setup PostgreSQL database
python setup_tables.py
```

#### Frontend Setup
```powershell
cd frontend-vite  
npm install
```

#### Start Development Servers
```powershell
# Terminal 1: Backend (from project root)
cd backend; .\venv\Scripts\Activate.ps1; python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend (from project root)
cd frontend-vite; npm run dev
```

**Access Application:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎮 Using the Garden Planner

1. **Search Your Location**: Enter your address in the search bar for automatic map centering
2. **Draw Features**: Use professional Mapbox Draw tools to create boundaries:
   - Click the polygon tool to start drawing
   - Click points to define your feature boundary
   - Double-click to complete the polygon
3. **Name & Style Features**: Choose from 8 preset colors or use custom color picker
4. **Manage Features**: Hover over saved features to see delete options
5. **Multiple Features**: Draw separate features for yard, house, garden beds, paths, etc.
6. **Professional Results**: Features are saved to database with persistent storage

### Mapping Features
- **Unlimited USGS Imagery**: Free satellite and topographic base maps
- **Professional Drawing**: Mapbox GL Draw tools for precise polygon creation
- **Interactive Management**: Hover effects with professional popup design
- **High-Resolution Zoom**: Up to level 22 for detailed planning
- **Smooth Navigation**: Professional flyTo animations and controls

## � Screenshots

### Early Development Phase
![Garden Planner Early Phase](docs/screenshots/mapper_early_phase.PNG)
*Garden planner showing the professional Mapbox interface with USGS imagery and drawing tools*

### Feature Creation System  
![Feature Creation Dialog](docs/screenshots/feature_creation.PNG)
*Professional feature creation modal with custom naming and color selection (8 presets + color picker)*

The application features a professional mapping interface built with Mapbox GL JS, offering:
- **USGS National Map Imagery**: High-resolution satellite and topographic base maps (free unlimited usage)
- **Professional Drawing Tools**: Mapbox Draw integration for precise polygon creation  
- **Enhanced User Experience**: Custom color selection, hover interactions, and intuitive controls
- **Cost-Optimized Design**: Hybrid approach using free imagery with professional drawing capabilities

## �🛠️ Technical Stack

**Backend**:
- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLAlchemy**: Python ORM with PostgreSQL integration
- **PostgreSQL**: Production database with spatial capabilities
- **Python 3.12**: Latest Python with enhanced performance

**Frontend**:
- **React 18**: Modern UI library with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript for better development experience  
- **Vite**: Fast build tool and development server with API proxy
- **Mapbox GL JS**: Professional mapping library with drawing capabilities
- **Mapbox Draw**: Interactive polygon drawing and editing tools

**Mapping & Imagery**:
- **USGS National Map**: Free unlimited satellite+topographic imagery
- **Mapbox Geocoding**: Enhanced address search and location services
- **PostGIS Ready**: Spatial database extensions for future features

**Development Tools**:
- **npm**: Package management for Node.js dependencies
- **pip**: Package management for Python dependencies
- **Hot Reload**: Both frontend and backend support live reloading during development

## 🔧 Advanced Configuration

### Mapbox Integration
The application uses a hybrid approach for optimal cost and functionality:

```env
# .env (project root)
MAPBOX_ACCESS_TOKEN=your_token_here

# frontend-vite/.env  
VITE_MAPBOX_ACCESS_TOKEN=your_token_here
```

**Mapbox Features**:
- **With Token**: Enhanced address search, geocoding, professional drawing tools
- **Without Token**: Still fully functional using OpenStreetMap fallback for search
- **Cost Optimization**: USGS imagery provides free unlimited base maps

### PostgreSQL Configuration
```powershell
# Install PostgreSQL with spatial extensions
winget install PostgreSQL.PostgreSQL.17

# Create database
psql -U postgres
CREATE DATABASE garden_planner;
\c garden_planner;
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Environment Variables
```powershell
# Database connection (if not using defaults)
$env:DATABASE_URL = "postgresql://postgres:your_password@localhost:5432/garden_planner"

# Optional Mapbox token
$env:MAPBOX_ACCESS_TOKEN = "pk.your_mapbox_token_here"
```

## 🐛 Troubleshooting

### Common Issues

**"Python not found" or "npm not found"**:
- Use full paths: `python.exe` instead of `python`
- Verify installations: `python.exe --version` and `node --version`

**Database connection issues**:
- Ensure PostgreSQL service is running: `Get-Service postgresql*`
- Check database exists and has proper permissions
- Verify `DATABASE_URL` if using custom configuration

**Mapbox features not working**:
- Verify Mapbox token is correctly set in both `.env` files
- Application works without token using OpenStreetMap fallback
- Check browser console for API errors

**Port conflicts**:
- Frontend: Default 5173 (configured in vite.config.ts)
- Backend: Default 8000 (change with `--port 8001`)
- Close existing terminals if ports remain occupied

**Terminal management issues**:
- VS Code may open multiple terminals - close unused ones
- Use Ctrl+C to stop servers properly before restarting
- If ports remain occupied: `taskkill /F /IM node.exe` or `taskkill /F /IM python.exe`

### Getting Help
- Check [INSTALLATION_GUIDE.md](INSTALLATION_GUIDE.md) for detailed setup instructions
- Review the API documentation at http://localhost:8000/docs when backend is running
- Check browser console (F12) for frontend errors
- Verify both services are running on correct ports

## 🚀 Future Development

### Planned Features
- **Plant Database Integration**: USDA Plants API and Trefle.io for comprehensive plant information
- **Spatial Analysis**: PostGIS-powered sunlight analysis and optimal plant placement
- **Weather Integration**: Real-time weather data and smart irrigation scheduling  
- **Seasonal Planning**: Climate-aware planting and harvest calendars
- **Mobile Responsive**: Touch-friendly interface for tablets and phones
- **Export Features**: PDF generation and GIS format exports

### Current Implementation Status
- ✅ **Professional Mapping**: Mapbox GL JS with drawing tools
- ✅ **Cost-Optimized Design**: USGS imagery + Mapbox tools
- ✅ **Multi-Feature Management**: Database persistence with CRUD operations
- ✅ **Interactive UX**: Hover effects, color picker, delete functionality
- ✅ **Address Search**: Geocoding with fallback options
- 🔄 **Plant Management**: Foundation ready for plant placement features

### Technical Roadmap
- **Enhanced Spatial Features**: Advanced PostGIS integration
- **Performance Optimization**: Database indexing and query optimization
- **Testing Suite**: Comprehensive unit and integration tests
- **Docker Containerization**: Consistent development environments
- **CI/CD Pipeline**: Automated testing and deployment
- **Advanced Spatial Analysis**: Integration with satellite imagery processing

### Contributing
This project is in active development. The current focus is on:
1. ✅ Professional mapping system (completed)
2. 🔄 Plant database integration and management features  
3. 📋 Advanced spatial analysis capabilities
4. 📋 Weather integration and smart scheduling
5. 📋 Mobile responsiveness and enhanced UX
