import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { BoundaryDrawing } from './BoundaryDrawing';
import './GardenPlanner.css';
import { useGardenData } from '../../hooks/useGardenData';
import { PlantSelector } from './PlantSelector';
import { Legend } from './Legend';
import { MapControls } from './MapControls';
import { AddressSearch } from './AddressSearch';
import { useGardenStore } from '../../stores/gardenStore';
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
  const mapRef = useRef<LeafletMap | null>(null);

  if (loading) {
    return <div>Loading garden data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!garden || !gridSystem) {
    return <div>No garden data available</div>;
  }

  const handleCellClick = (cellId: number) => {
    setSelectedCell(cellId);
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
            
            {gridSystem.grid_cells.map((cell, index) => {
              const plantedCell = plantedCells.find(pc => pc.cellId === index);
              return (
                <Polygon
                  key={index}
                  positions={cell.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
                  pathOptions={{
                    color: selectedCell === index ? '#ff0000' : '#3388ff',
                    weight: 1,
                    fillOpacity: plantedCell ? 0.4 : 0.2,
                    fillColor: plantedCell ? plantedCell.color : '#3388ff'
                  }}
                  eventHandlers={{
                    click: () => handleCellClick(index)
                  }}
                />
              );
            })}
            
            <MapController 
              onZoomChange={setCurrentZoom}
            />
            <BoundaryDrawing />
          </MapContainer>
          
          <MapControls
            isSatellite={isSatellite}
            onToggleSatellite={() => setIsSatellite(prev => !prev)}
          />
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
          </div>
        </div>

        <div className="garden-controls">
          {selectedCell !== null && (
            <div className="cell-info">
              <h3>Selected Cell #{selectedCell}</h3>
              <p>Size: {gridSystem.cell_size_feet} x {gridSystem.cell_size_feet} feet</p>
              <PlantSelector onPlantSelect={handlePlantSelect} />
            </div>
          )}

          <Legend 
            items={plantedCells.map(cell => ({
              ...cell.plant,
              color: cell.color
            }))}
            onRemoveItem={handleRemovePlant}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default GardenPlanner;
