import React, { useCallback, useRef, useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GridSystem } from '../../types/garden';

interface InteractiveGridProps {
  gridSystem: GridSystem;
  plantedCells: Array<{ cellId: number; plant: any; color: string; }>;
  selectedCell: number | null;
  onCellClick: (cellId: number) => void;
  onGridResize: (rows: number, cols: number) => void;
  gridVisible: boolean;
}

interface GridBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export const InteractiveGrid: React.FC<InteractiveGridProps> = ({
  gridSystem,
  plantedCells,
  selectedCell,
  onCellClick,
  onGridResize,
  gridVisible
}) => {
  const map = useMap();
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const resizeHandlesRef = useRef<L.LayerGroup | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentBounds, setCurrentBounds] = useState<GridBounds | null>(null);

  // Calculate grid dimensions from gridSystem
  const calculateGridDimensions = useCallback(() => {
    if (!gridSystem?.grid_cells?.length) return null;

    const allCoords = gridSystem.grid_cells.flatMap(cell => 
      cell.geometry.coordinates[0]
    );
    const lats = allCoords.map(coord => coord[1]);
    const lngs = allCoords.map(coord => coord[0]);

    const bounds: GridBounds = {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs)
    };

    return bounds;
  }, [gridSystem]);

  // Create individual grid cell polygons
  const createGridCells = useCallback((bounds: GridBounds, rows: number, cols: number) => {
    const cells: L.Polygon[] = [];
    const latStep = (bounds.maxLat - bounds.minLat) / rows;
    const lngStep = (bounds.maxLng - bounds.minLng) / cols;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellIndex = row * cols + col;
        const plantedCell = plantedCells.find(pc => pc.cellId === cellIndex);
        
        const cellBounds = [
          [bounds.minLat + row * latStep, bounds.minLng + col * lngStep],
          [bounds.minLat + row * latStep, bounds.minLng + (col + 1) * lngStep],
          [bounds.minLat + (row + 1) * latStep, bounds.minLng + (col + 1) * lngStep],
          [bounds.minLat + (row + 1) * latStep, bounds.minLng + col * lngStep]
        ] as L.LatLngTuple[];

        const cell = L.polygon(cellBounds, {
          color: selectedCell === cellIndex ? '#ff0000' : '#3388ff',
          weight: 1,
          fillOpacity: plantedCell ? 0.4 : 0.1,
          fillColor: plantedCell ? plantedCell.color : '#3388ff'
        });

        cell.on('click', () => {
          console.log(`🎯 Grid cell ${cellIndex} clicked`);
          onCellClick(cellIndex);
        });

        cells.push(cell);
      }
    }

    return cells;
  }, [plantedCells, selectedCell, onCellClick]);

  // Create draggable resize handles
  const createResizeHandles = useCallback((bounds: GridBounds) => {
    const handles: L.Marker[] = [];

    // Corner positions for resize handles
    const cornerPositions = [
      { lat: bounds.minLat, lng: bounds.minLng, corner: 'sw' }, // Southwest
      { lat: bounds.minLat, lng: bounds.maxLng, corner: 'se' }, // Southeast  
      { lat: bounds.maxLat, lng: bounds.minLng, corner: 'nw' }, // Northwest
      { lat: bounds.maxLat, lng: bounds.maxLng, corner: 'ne' }  // Northeast
    ];

    cornerPositions.forEach(({ lat, lng, corner }) => {
      const handle = L.marker([lat, lng], {
        icon: L.divIcon({
          className: `resize-handle resize-${corner}`,
          html: `<div style="
            width: 12px;
            height: 12px;
            background: #fff;
            border: 2px solid #3388ff;
            border-radius: 50%;
            cursor: ${corner}-resize;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          "></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        }),
        draggable: true
      });

      // Handle drag events
      handle.on('dragstart', () => {
        console.log(`🎯 Started dragging ${corner} handle`);
        setIsResizing(true);
      });

      handle.on('drag', (e) => {
        const marker = e.target as L.Marker;
        const newPos = marker.getLatLng();
        
        // Calculate new bounds based on which corner is being dragged
        const newBounds = { ...bounds };
        
        switch (corner) {
          case 'sw':
            newBounds.minLat = newPos.lat;
            newBounds.minLng = newPos.lng;
            break;
          case 'se':
            newBounds.minLat = newPos.lat;
            newBounds.maxLng = newPos.lng;
            break;
          case 'nw':
            newBounds.maxLat = newPos.lat;
            newBounds.minLng = newPos.lng;
            break;
          case 'ne':
            newBounds.maxLat = newPos.lat;
            newBounds.maxLng = newPos.lng;
            break;
        }

        // Update current bounds for real-time preview
        setCurrentBounds(newBounds);
        
        // Optionally update grid in real-time (might be performance intensive)
        // updateGridDisplay(newBounds);
      });

      handle.on('dragend', () => {
        console.log(`🎯 Finished dragging ${corner} handle`);
        setIsResizing(false);
        
        if (currentBounds) {
          // Calculate new grid dimensions
          const cellSizeFeet = gridSystem?.cell_size_feet || 1;
          const latRange = Math.abs(currentBounds.maxLat - currentBounds.minLat);
          const lngRange = Math.abs(currentBounds.maxLng - currentBounds.minLng);
          
          // Convert lat/lng range to approximate feet (rough conversion)
          const feetPerLat = 364000; // Approximate feet per degree latitude
          const feetPerLng = 364000 * Math.cos(currentBounds.minLat * Math.PI / 180);
          
          const heightFeet = latRange * feetPerLat;
          const widthFeet = lngRange * feetPerLng;
          
          const newRows = Math.max(1, Math.round(heightFeet / cellSizeFeet));
          const newCols = Math.max(1, Math.round(widthFeet / cellSizeFeet));
          
          console.log(`🔧 Calculated new dimensions: ${newRows}x${newCols}`);
          onGridResize(newRows, newCols);
        }
      });

      handles.push(handle);
    });

    return handles;
  }, [gridSystem, currentBounds, onGridResize]);

  // Update grid display
  const updateGridDisplay = useCallback((bounds: GridBounds) => {
    if (!map || !gridLayerRef.current) return;

    // Clear existing grid
    gridLayerRef.current.clearLayers();

    const cellSizeFeet = gridSystem?.cell_size_feet || 1;
    const rows = Math.round(gridSystem?.dimensions?.height_feet / cellSizeFeet) || 4;
    const cols = Math.round(gridSystem?.dimensions?.width_feet / cellSizeFeet) || 4;

    // Create and add new grid cells
    const cells = createGridCells(bounds, rows, cols);
    cells.forEach(cell => gridLayerRef.current?.addLayer(cell));

  }, [map, gridSystem, createGridCells]);

  // Main effect to manage grid and handles
  useEffect(() => {
    if (!gridVisible || !gridSystem?.grid_cells?.length || !map) {
      // Clean up existing layers
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
      if (resizeHandlesRef.current) {
        map.removeLayer(resizeHandlesRef.current);
        resizeHandlesRef.current = null;
      }
      return;
    }

    const bounds = calculateGridDimensions();
    if (!bounds) return;

    console.log('🎛️ Creating resizable grid overlay');

    // Create grid layer
    const gridLayer = L.layerGroup();
    const cellSizeFeet = gridSystem?.cell_size_feet || 1;
    const rows = Math.round(gridSystem?.dimensions?.height_feet / cellSizeFeet) || 4;
    const cols = Math.round(gridSystem?.dimensions?.width_feet / cellSizeFeet) || 4;

    // Add grid cells
    const cells = createGridCells(bounds, rows, cols);
    cells.forEach(cell => gridLayer.addLayer(cell));

    // Create resize handles layer
    const handlesLayer = L.layerGroup();
    const handles = createResizeHandles(bounds);
    handles.forEach(handle => handlesLayer.addLayer(handle));

    // Add layers to map
    gridLayer.addTo(map);
    handlesLayer.addTo(map);

    gridLayerRef.current = gridLayer;
    resizeHandlesRef.current = handlesLayer;

    console.log('✅ Resizable grid overlay created');

    // Cleanup
    return () => {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
      if (resizeHandlesRef.current) {
        map.removeLayer(resizeHandlesRef.current);
        resizeHandlesRef.current = null;
      }
    };
  }, [map, gridVisible, gridSystem, calculateGridDimensions, createGridCells, createResizeHandles]);

  // Update bounds when currentBounds changes (during drag)
  useEffect(() => {
    if (currentBounds && isResizing) {
      updateGridDisplay(currentBounds);
    }
  }, [currentBounds, isResizing, updateGridDisplay]);

  if (!gridVisible || !gridSystem?.grid_cells?.length) {
    return null;
  }

  const cellSizeFeet = gridSystem?.cell_size_feet || 1;
  const rows = Math.round(gridSystem?.dimensions?.height_feet / cellSizeFeet) || 4;
  const cols = Math.round(gridSystem?.dimensions?.width_feet / cellSizeFeet) || 4;

  return (
    <>
      {/* Grid info overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px 16px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 'bold',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        border: '1px solid #ddd'
      }}>
        <div style={{ color: '#333', marginBottom: '4px' }}>
          Grid: {rows} × {cols} cells
        </div>
        <div style={{ color: '#666', fontSize: '11px' }}>
          Size: {gridSystem.dimensions?.width_feet || 0}' × {gridSystem.dimensions?.height_feet || 0}'
        </div>
        {isResizing && (
          <div style={{ color: '#3388ff', fontSize: '11px', marginTop: '4px' }}>
            ✨ Resizing...
          </div>
        )}
      </div>
    </>
  );
};
