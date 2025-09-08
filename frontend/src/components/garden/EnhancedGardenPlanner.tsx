import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { FeatureDrawing } from './FeatureDrawing';
import { EnhancedFeatureLegend } from './EnhancedFeatureLegend';
import { PlantGrid } from './PlantGrid';
import { PlantSelectorModal } from './PlantSelectorModal';
import { AddressSearch } from './AddressSearch';
import type { Feature } from '../../api/features.api';
import { useGardenStore } from '../../stores/gardenStore';

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

interface PlantedCell {
  cellId: string;
  lat: number;
  lng: number;
  plantName: string;
  plantColor: string;
}

interface EnhancedGardenPlannerProps {
  gardenId: number;
}

const EnhancedGardenPlanner: React.FC<EnhancedGardenPlannerProps> = ({ gardenId }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<number | null>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(19);
  const [gridVisible, setGridVisible] = useState(true);
  const [cellSize, setCellSize] = useState(2); // meters
  const [plants, setPlants] = useState<PlantedCell[]>([]);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ lat: number; lng: number; cellId: string } | null>(null);
  const [hoveredPlant, setHoveredPlant] = useState<PlantedCell | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const mapRef = useRef<LeafletMap | null>(null);
  const { address, center } = useGardenStore();

  // Load plants from localStorage on mount
  useEffect(() => {
    const savedPlants = localStorage.getItem(`plants_${gardenId}`);
    if (savedPlants) {
      setPlants(JSON.parse(savedPlants));
    }
  }, [gardenId]);

  // Save plants to localStorage whenever plants change
  useEffect(() => {
    localStorage.setItem(`plants_${gardenId}`, JSON.stringify(plants));
  }, [plants, gardenId]);

  const handleCellClick = (lat: number, lng: number, cellId: string) => {
    // Check if cell already has a plant
    const existingPlant = plants.find(p => p.cellId === cellId);
    if (existingPlant) {
      // Remove plant
      setPlants(prev => prev.filter(p => p.cellId !== cellId));
      setHasUnsavedChanges(true);
    } else {
      // Add plant
      setSelectedCell({ lat, lng, cellId });
      setShowPlantModal(true);
    }
  };

  const handlePlantSelect = (plantName: string, color: string) => {
    if (!selectedCell) return;
    
    const newPlant: PlantedCell = {
      cellId: selectedCell.cellId,
      lat: selectedCell.lat,
      lng: selectedCell.lng,
      plantName,
      plantColor: color
    };
    
    setPlants(prev => [...prev, newPlant]);
    setShowPlantModal(false);
    setSelectedCell(null);
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    // Here you would typically save to backend
    console.log('Saving plants to backend:', plants);
    setHasUnsavedChanges(false);
    // TODO: Implement actual backend save
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all plants? This cannot be undone.')) {
      setPlants([]);
      setHasUnsavedChanges(true);
    }
  };

  const defaultCenter: LatLngTuple = center || [40.7128, -74.006];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Main Map Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          right: 16, 
          zIndex: 1000,
          display: 'flex',
          gap: 8
        }}>
          <AddressSearch 
            onAddressSelect={(address, lat, lng) => {
              useGardenStore.getState().setAddress(address, lat, lng);
              if (mapRef.current) {
                mapRef.current.setView([lat, lng], 19);
              }
            }} 
          />
          
          <button
            onClick={() => setIsSatellite(!isSatellite)}
            style={{
              padding: '8px 12px',
              backgroundColor: isSatellite ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {isSatellite ? '🗺️ Map' : '🛰️ Satellite'}
          </button>
          
          <button
            onClick={() => setGridVisible(!gridVisible)}
            style={{
              padding: '8px 12px',
              backgroundColor: gridVisible ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {gridVisible ? '🔳 Hide Grid' : '⬜ Show Grid'}
          </button>
        </div>

        <MapContainer
          ref={mapRef}
          center={defaultCenter}
          zoom={currentZoom}
          minZoom={15}
          maxZoom={22}
          style={{ height: '100%', width: '100%' }}
        >
          {isSatellite ? (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='Tiles &copy; Esri'
              maxZoom={22}
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
              maxZoom={22}
            />
          )}
          
          <FeatureDrawing
            gardenId={gardenId}
            userId={1} // TODO: Replace with real user ID
            onFeaturesChange={setFeatures}
            selectedId={selectedFeatureId || undefined}
            setSelectedId={setSelectedFeatureId}
          />
          
          <PlantGrid
            features={features}
            gridVisible={gridVisible}
            cellSize={cellSize}
            plants={plants}
            onCellClick={handleCellClick}
            onCellHover={setHoveredPlant}
          />
        </MapContainer>

        {/* Plant Hover Tooltip */}
        {hoveredPlant && (
          <div style={{
            position: 'absolute',
            top: 100,
            left: 20,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: 4,
            fontSize: 14,
            zIndex: 1000,
            pointerEvents: 'none'
          }}>
            🌱 {hoveredPlant.plantName}
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div style={{ 
        width: 350, 
        backgroundColor: '#f8f9fa', 
        padding: 16, 
        overflowY: 'auto',
        borderLeft: '1px solid #dee2e6'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 20 }}>Garden Planner</h2>
        
        {/* Grid Controls */}
        <div style={{ marginBottom: 20, padding: 16, backgroundColor: 'white', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Grid Settings</h4>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
              Cell Size: {cellSize}m x {cellSize}m
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={cellSize}
              onChange={(e) => setCellSize(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Plant Controls */}
        <div style={{ marginBottom: 20, padding: 16, backgroundColor: 'white', borderRadius: 8 }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Plants ({plants.length})</h4>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: hasUnsavedChanges ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                fontSize: 12
              }}
            >
              💾 Save Changes
            </button>
            <button
              onClick={handleClearAll}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              🗑️ Clear All
            </button>
          </div>
          {hasUnsavedChanges && (
            <p style={{ fontSize: 12, color: '#dc3545', margin: '0 0 8px 0' }}>
              ⚠️ You have unsaved changes
            </p>
          )}
          <p style={{ fontSize: 12, color: '#6c757d', margin: 0 }}>
            Click empty grid cells to add plants. Click planted cells to remove plants.
          </p>
        </div>

        {/* Feature Legend */}
        <EnhancedFeatureLegend
          features={features}
          onSelect={setSelectedFeatureId}
          selectedId={selectedFeatureId}
          onUpdateFeature={(updatedFeature: Feature) => {
            setFeatures(prev => prev.map(f => f.id === updatedFeature.id ? updatedFeature : f));
          }}
        />
      </div>

      {/* Plant Selection Modal */}
      {showPlantModal && (
        <PlantSelectorModal
          onSelect={handlePlantSelect}
          onCancel={() => {
            setShowPlantModal(false);
            setSelectedCell(null);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedGardenPlanner;
