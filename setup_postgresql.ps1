# PostgreSQL Setup Script for Garden Planner
# Run this script to set up PostgreSQL for the Garden Planner application

Write-Host "Setting up PostgreSQL for Garden Planner..." -ForegroundColor Green

# Check if PostgreSQL service exists
$postgresService = Get-Service -Name "*postgresql*" -ErrorAction SilentlyContinue

if (-not $postgresService) {
    Write-Host "PostgreSQL not found. Installing..." -ForegroundColor Yellow
    winget install PostgreSQL.PostgreSQL.17
    Write-Host "PostgreSQL installation initiated. Please wait for completion." -ForegroundColor Yellow
    return
}

Write-Host "PostgreSQL service found: $($postgresService.Name)" -ForegroundColor Green

# Start PostgreSQL service if not running
if ($postgresService.Status -ne "Running") {
    Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service $postgresService.Name
    Start-Sleep -Seconds 5
}

# Check if psql is available in PATH
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "Adding PostgreSQL to PATH..." -ForegroundColor Yellow
    $env:PATH += ";C:\Program Files\PostgreSQL\17\bin"
    
    # Try to find psql in common locations
    $commonPaths = @(
        "C:\Program Files\PostgreSQL\17\bin",
        "C:\Program Files\PostgreSQL\16\bin", 
        "C:\Program Files\PostgreSQL\15\bin"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path "$path\psql.exe") {
            $env:PATH += ";$path"
            Write-Host "Found PostgreSQL at: $path" -ForegroundColor Green
            break
        }
    }
}

# Database setup
$databaseName = "garden_planner"
$username = "postgres"

Write-Host "Creating database and PostGIS extension..." -ForegroundColor Yellow
Write-Host "You may be prompted for the PostgreSQL password (set during installation)" -ForegroundColor Cyan

# Create database and enable PostGIS
$sqlCommands = @"
-- Create database if it doesn't exist
SELECT 'CREATE DATABASE $databaseName' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$databaseName')\gexec

-- Connect to the database and enable PostGIS
\c $databaseName;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Verify PostGIS installation
SELECT PostGIS_Full_Version();
"@

# Write SQL to temporary file
$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    # Execute SQL commands
    psql -U $username -d postgres -f $tempSqlFile
    
    Write-Host "`nDatabase setup complete!" -ForegroundColor Green
    Write-Host "Database: $databaseName" -ForegroundColor Green
    Write-Host "PostGIS extensions enabled" -ForegroundColor Green
    
    Write-Host "`nTo use PostgreSQL with Garden Planner, set environment variable:" -ForegroundColor Cyan
    Write-Host "`$env:DATABASE_URL = `"postgresql://postgres:your_password@localhost:5432/$databaseName`"" -ForegroundColor Yellow
    
} catch {
    Write-Host "Error setting up database: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please ensure PostgreSQL is properly installed and password is correct" -ForegroundColor Yellow
} finally {
    # Clean up temporary file
    Remove-Item $tempSqlFile -ErrorAction SilentlyContinue
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Set the DATABASE_URL environment variable (see above)" -ForegroundColor White
Write-Host "2. Navigate to backend directory: cd backend" -ForegroundColor White
Write-Host "3. Start the backend server: .\venv\Scripts\uvicorn.exe app.main:app --reload" -ForegroundColor White
