# Quick Setup Script for Garden Planner (SQLite Development)
# This script sets up the Garden Planner for local development using SQLite

Write-Host "Quick Setup: Garden Planner with SQLite" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend\app\main.py")) {
    Write-Host "Error: Please run this script from the Garden Planner root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    return
}

# Navigate to backend
Set-Location backend

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    
    # Try to find Python
    $pythonPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312\python.exe"
    if (-not (Test-Path $pythonPath)) {
        Write-Host "Python not found at expected location: $pythonPath" -ForegroundColor Red
        Write-Host "Please install Python 3.12+ or update the path in this script" -ForegroundColor Yellow
        return
    }
    
    & $pythonPath -m venv venv
    Write-Host "Virtual environment created!" -ForegroundColor Green
}

# Check if dependencies are installed
Write-Host "Checking Python dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "venv\Scripts\uvicorn.exe")) {
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    .\venv\Scripts\pip.exe install -r requirements.txt
    Write-Host "Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
}

# Create database tables
Write-Host "Setting up SQLite database..." -ForegroundColor Yellow
.\venv\Scripts\python.exe -c "
from app.database import create_tables, engine
from app.models import garden, plant, user, zone, watering, weather
print('Creating database tables...')
create_tables()
print('Database setup complete!')
print(f'SQLite database created at: garden_planner.db')
"

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "Backend configured with SQLite database" -ForegroundColor Green
Write-Host "`nTo start the development servers:" -ForegroundColor Cyan
Write-Host "`n1. Start Backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\uvicorn.exe app.main:app --reload" -ForegroundColor Gray
Write-Host "`n2. Start Frontend (in a new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`nServices will be available at:" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White

# Return to root directory
Set-Location ..
