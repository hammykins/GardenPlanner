from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import gardens, plants, grid_simple

app = FastAPI(title="Garden Yard Planner API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React frontend (port 3000) and Vite frontend (port 5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(gardens.router, prefix="/api", tags=["gardens"])
app.include_router(plants.router, prefix="/api", tags=["plants"])
app.include_router(grid_simple.router, prefix="/api", tags=["grid"])

@app.get("/")
async def root():
    return {"message": "Welcome to Garden Yard Planner API"}
