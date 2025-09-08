import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { FeatureDrawing } from './FeatureDrawing';
import { FeatureLegend } from './FeatureLegend';
import { GardenWorkspace } from './GardenWorkspace';
import { InteractiveGrid } from './InteractiveGrid';
import './GardenPlanner.css';
import { useGardenData } from '../../hooks/useGardenData';
import { PlantSelector } from './PlantSelector';
import { Legend } from './Legend';
import { MapControls } from './MapControls';
import { AddressSearch } from './AddressSearch';
import { useGardenStore } from '../../stores/gardenStore';
import { gardenService } from '../../services/garden.service';
import type { PlantType } from '../../mocks/plantTypes';

// Fix for the leaflet icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface GardenPlannerProps {
  gardenId: number;
}

interface PlantedCell {
  cellId: number;
  plant: PlantType;
  color: string;
}

// Map controller component for zoom and layer updates
const MapController: React.FC<{
  onZoomChange: (zoom: number) => void;
}> = ({ onZoomChange }) => {
  const map = useMap();
  
  React.useEffect(() => {
    const updateZoom = () => {
      onZoomChange(map.getZoom());
    };
    map.on('zoomend', updateZoom);
    return () => {
      map.off('zoomend', updateZoom);
    };
  }, [map, onZoomChange]);

  return null;
};

const GardenPlanner: React.FC<GardenPlannerProps> = ({ gardenId }) => {
  const { garden, gridSystem, loading, error } = useGardenData(gardenId);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [plantedCells, setPlantedCells] = useState<PlantedCell[]>([]);
  const [isSatellite, setIsSatellite] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(19);
  const [gridVisible, setGridVisible] = useState(true);
  const [currentView, setCurrentView] = useState<'boundary' | 'workspace'>('boundary');
  const [savedGarden, setSavedGarden] = useState<any>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Load the most recent saved garden on mount (if exists)
  useEffect(() => {
    const savedGardens = useGardenStore.getState().getSavedGardens();
    if (savedGardens.length > 0) {
      const mostRecent = savedGardens[savedGardens.length - 1];
      setSavedGarden(mostRecent);
      // Don't auto-switch to workspace, let user choose
    }
  }, []);

  // Handle boundary submission
  const handleBoundarySubmit = async (gardenData: any) => {
    console.log('🏡 Submitting garden boundary:', gardenData);
    
    // Save to the store for persistence
    const garden = {
      id: Date.now(), // Simple ID generation
      ...gardenData
    };
    
    useGardenStore.getState().saveGarden(garden);
    setSavedGarden(garden);
    setCurrentView('workspace');
    console.log('🚀 Switching to workspace view with garden:', garden);
  };

  // If we're in workspace view, show the garden workspace
  if (currentView === 'workspace' && savedGarden) {
    console.log('🎯 Rendering GardenWorkspace with:', { currentView, savedGarden });
    return (
      <GardenWorkspace 
        garden={savedGarden}
      />
    );
  }

  // Only show loading/error states when NOT in workspace view
  if (loading) {
    return <div>Loading garden data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!garden || !gridSystem) {
    console.log('🚫 GardenPlanner: Missing data:', {
      hasGarden: !!garden,
      hasGridSystem: !!gridSystem,
      garden,
      gridSystem
    });
    return <div>No garden data available</div>;
  }

  // If we get here, we're in boundary drawing mode

  console.log('🔷 GardenPlanner: Rendering with:');
  console.log('  - Garden:', garden?.name || 'unnamed');
  console.log('  - GridSystem present:', !!gridSystem);
  console.log('  - Grid visible:', gridVisible);
  console.log('  - Cell count:', gridSystem?.grid_cells?.length || 0);

  const handleCellClick = (cellId: number) => {
    setSelectedCell(cellId);
  };

  const handleGridResize = async (rows: number, cols: number) => {
    console.log('🏡 GardenPlanner: handleGridResize called with:', { rows, cols, gardenId });
    try {
      console.log('🚀 Calling gardenService.resizeGardenGrid...');
      const result = await gardenService.resizeGardenGrid(gardenId, rows, cols);
      console.log('✅ Grid resize successful:', result);
      
      // TODO: Instead of reloading, we should update the grid state
      // For now, let's reload after a small delay to see the result
      setTimeout(() => {
        console.log('🔄 Reloading page...');
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Failed to resize grid:', error);
      // Show more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }
    }
  };

  const handlePlantSelect = (plant: PlantType, color: string) => {
    if (selectedCell !== null) {
      setPlantedCells(prev => {
        // Remove any existing plant in this cell
        const filtered = prev.filter(cell => cell.cellId !== selectedCell);
        // Add the new plant
        return [...filtered, { cellId: selectedCell, plant, color }];
      });
      setSelectedCell(null);
    }
  };

  const handleRemovePlant = (plantId: string) => {
    // Store the cell that had this plant (for visual feedback)
    const cellWithPlant = plantedCells.find(cell => cell.plant.id === plantId);
    
    // Remove the plant
    setPlantedCells(prev => prev.filter(cell => cell.plant.id !== plantId));

    // If the removed plant was in the selected cell, clear the selection
    if (cellWithPlant && cellWithPlant.cellId === selectedCell) {
      setSelectedCell(null);
    }
  };

  // Calculate center from garden boundary if available
  const center: LatLngTuple = garden.boundary ? [
    garden.boundary.coordinates[0][0][1],
    garden.boundary.coordinates[0][0][0]
  ] : [0, 0] as LatLngTuple;

  return (
    <div className="garden-planner">
      <div className="garden-layout">
        <AddressSearch 
          onAddressSelect={(address, lat, lng) => {
            useGardenStore.getState().setAddress(address, lat, lng);
            if (mapRef.current) {
              mapRef.current.setView([lat, lng], 19);
            }
          }} 
        />
        <div className="map-and-controls">
          <div className="map-wrapper">
          <MapContainer
            ref={mapRef}
            center={center}
            zoom={currentZoom}
            minZoom={15}
            maxZoom={22}
            style={{ height: '600px', width: '100%' }}
          >
            {isSatellite ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                maxZoom={22}
              />
            ) : (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
                maxZoom={22}
              />
            )}
            
            {/* Debug grid rendering decision */}
            {(() => {
              console.log('🎯 Grid render check:');
              console.log('  - gridVisible:', gridVisible);
              console.log('  - hasGridSystem:', !!gridSystem);
              console.log('  - willRenderGrid:', gridVisible && !!gridSystem);
              return null;
            })()}
            
            {gridVisible && gridSystem && (
              <InteractiveGrid
                gridSystem={gridSystem}
                plantedCells={plantedCells}
                selectedCell={selectedCell}
                onCellClick={handleCellClick}
                onGridResize={handleGridResize}
                gridVisible={gridVisible}
              />
            )}
            
            <MapController 
              onZoomChange={setCurrentZoom}
            />
            <FeatureDrawing
              gardenId={garden.id}
              userId={1} // TODO: Replace with real user ID from auth
              onFeaturesChange={() => {}}
            />
          </MapContainer>
          
          <MapControls
            isSatellite={isSatellite}
            onToggleSatellite={() => setIsSatellite(prev => !prev)}
          />
          
          {/* Boundary submission component */}
          <BoundarySubmit onSubmit={handleBoundarySubmit} />
          
          <div className="garden-reset">
            <button
              className="reset-button"
              onClick={() => {
                if (window.confirm('Are you sure you want to reset the garden? This will remove all plants and boundaries.')) {
                  useGardenStore.getState().clearAllData();
                  setPlantedCells([]);
                  setSelectedCell(null);
                }
              }}
            >
              Reset Garden
            </button>
            
            {savedGarden && (
              <button
                className="workspace-button"
                onClick={() => setCurrentView('workspace')}
                style={{
                  marginLeft: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                🏡 Go to My Garden
              </button>
            )}
          </div>
        </div>

        <div className="garden-controls">
          <FeatureLegend features={[]} />
        </div>
        </div>
      </div>
    </div>
  );
};

export default GardenPlanner;
