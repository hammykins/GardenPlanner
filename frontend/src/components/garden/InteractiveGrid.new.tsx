import React, { useCallback, useRef, useEffect } from 'react';
import { Polygon, useMap } from 'react-leaflet';
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

export const InteractiveGrid: React.FC<InteractiveGridProps> = ({
  gridSystem,
  plantedCells,
  selectedCell,
  onCellClick,
  onGridResize,
  gridVisible
}) => {
  const map = useMap();
  const gridControlsLayerRef = useRef<L.LayerGroup | null>(null);
  
  // Calculate grid dimensions
  const cellSizeFeet = gridSystem?.cell_size_feet || 1;
  const rows = Math.round(gridSystem?.dimensions?.height_feet / cellSizeFeet) || 4;
  const cols = Math.round(gridSystem?.dimensions?.width_feet / cellSizeFeet) || 4;

  console.log('🔷 InteractiveGrid: Grid dimensions:', { rows, cols, cellSizeFeet });

  // Handle resize
  const handleResize = useCallback((direction: string) => {
    console.log('🔧 Grid resize requested:', direction, 'Current:', { rows, cols });
    switch (direction) {
      case 'expand':
        onGridResize(rows + 1, cols + 1);
        break;
      case 'shrink':
        if (rows > 1 && cols > 1) {
          onGridResize(rows - 1, cols - 1);
        }
        break;
      case 'add-row':
        onGridResize(rows + 1, cols);
        break;
      case 'remove-row':
        if (rows > 1) {
          onGridResize(rows - 1, cols);
        }
        break;
      case 'add-col':
        onGridResize(rows, cols + 1);
        break;
      case 'remove-col':
        if (cols > 1) {
          onGridResize(rows, cols - 1);
        }
        break;
    }
  }, [rows, cols, onGridResize]);

  // Create grid controls using native Leaflet
  useEffect(() => {
    if (!gridVisible || !gridSystem?.grid_cells?.length || !map) {
      // Clean up existing controls
      if (gridControlsLayerRef.current) {
        map.removeLayer(gridControlsLayerRef.current);
        gridControlsLayerRef.current = null;
      }
      return;
    }

    console.log('🎛️ Creating Leaflet grid controls');
    
    // Calculate grid boundaries
    const gridCells = gridSystem.grid_cells;
    const allCoords = gridCells.flatMap(cell => cell.geometry.coordinates[0]);
    const lats = allCoords.map(coord => coord[1]);
    const lngs = allCoords.map(coord => coord[0]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    console.log('📍 Grid boundaries:', { minLat, maxLat, minLng, maxLng });

    // Create layer group for controls
    const controlsLayer = L.layerGroup();
    
    // Create expand button (bottom-right corner)
    const expandButton = L.marker([minLat - 0.00005, maxLng + 0.00005], {
      icon: L.divIcon({
        className: 'grid-expand-btn',
        html: `<button style="
          background: #4CAF50; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">+Grid</button>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      })
    });
    
    expandButton.on('click', () => {
      console.log('🎯 Expand grid button clicked!');
      handleResize('expand');
    });
    
    // Create shrink button (top-left corner)  
    const shrinkButton = L.marker([maxLat + 0.00005, minLng - 0.00005], {
      icon: L.divIcon({
        className: 'grid-shrink-btn',
        html: `<button style="
          background: #f44336; 
          color: white; 
          border: none; 
          padding: 8px 12px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">-Grid</button>`,
        iconSize: [60, 30],
        iconAnchor: [30, 15]
      })
    });
    
    shrinkButton.on('click', () => {
      console.log('🎯 Shrink grid button clicked!');
      handleResize('shrink');
    });

    // Add row button
    const addRowButton = L.marker([minLat - 0.00005, (minLng + maxLng) / 2], {
      icon: L.divIcon({
        className: 'grid-add-row-btn',
        html: `<button style="
          background: #2196F3; 
          color: white; 
          border: none; 
          padding: 6px 10px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 11px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">+Row</button>`,
        iconSize: [50, 25],
        iconAnchor: [25, 12.5]
      })
    });
    
    addRowButton.on('click', () => {
      console.log('🎯 Add row button clicked!');
      handleResize('add-row');
    });

    // Add column button
    const addColButton = L.marker([(minLat + maxLat) / 2, maxLng + 0.00005], {
      icon: L.divIcon({
        className: 'grid-add-col-btn',
        html: `<button style="
          background: #FF9800; 
          color: white; 
          border: none; 
          padding: 6px 10px; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 11px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">+Col</button>`,
        iconSize: [50, 25],
        iconAnchor: [25, 12.5]
      })
    });
    
    addColButton.on('click', () => {
      console.log('🎯 Add column button clicked!');
      handleResize('add-col');
    });

    // Add buttons to layer group
    controlsLayer.addLayer(expandButton);
    controlsLayer.addLayer(shrinkButton);
    controlsLayer.addLayer(addRowButton);
    controlsLayer.addLayer(addColButton);

    // Add remove buttons if applicable
    if (rows > 1) {
      const removeRowButton = L.marker([maxLat + 0.00005, (minLng + maxLng) / 2], {
        icon: L.divIcon({
          className: 'grid-remove-row-btn',
          html: `<button style="
            background: #9C27B0; 
            color: white; 
            border: none; 
            padding: 6px 10px; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 11px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">-Row</button>`,
          iconSize: [50, 25],
          iconAnchor: [25, 12.5]
        })
      });
      
      removeRowButton.on('click', () => {
        console.log('🎯 Remove row button clicked!');
        handleResize('remove-row');
      });
      
      controlsLayer.addLayer(removeRowButton);
    }

    if (cols > 1) {
      const removeColButton = L.marker([(minLat + maxLat) / 2, minLng - 0.00005], {
        icon: L.divIcon({
          className: 'grid-remove-col-btn',
          html: `<button style="
            background: #607D8B; 
            color: white; 
            border: none; 
            padding: 6px 10px; 
            border-radius: 4px; 
            cursor: pointer;
            font-size: 11px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">-Col</button>`,
          iconSize: [50, 25],
          iconAnchor: [25, 12.5]
        })
      });
      
      removeColButton.on('click', () => {
        console.log('🎯 Remove column button clicked!');
        handleResize('remove-col');
      });
      
      controlsLayer.addLayer(removeColButton);
    }

    // Add controls to map
    controlsLayer.addTo(map);
    gridControlsLayerRef.current = controlsLayer;

    console.log('✅ Grid controls added to map');

    // Cleanup function
    return () => {
      if (gridControlsLayerRef.current) {
        map.removeLayer(gridControlsLayerRef.current);
        gridControlsLayerRef.current = null;
      }
    };
  }, [map, gridVisible, gridSystem, rows, cols, handleResize]);

  if (!gridVisible || !gridSystem?.grid_cells?.length) {
    return null;
  }

  return (
    <>
      {/* Render grid cells */}
      {gridSystem.grid_cells.map((cell, index) => {
        const plantedCell = plantedCells.find(pc => pc.cellId === index);
        return (
          <Polygon
            key={`cell-${index}`}
            positions={cell.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
            pathOptions={{
              color: selectedCell === index ? '#ff0000' : '#3388ff',
              weight: 2,
              fillOpacity: plantedCell ? 0.4 : 0.2,
              fillColor: plantedCell ? plantedCell.color : '#3388ff'
            }}
            eventHandlers={{
              click: () => onCellClick(index)
            }}
          />
        );
      })}

      {/* Grid info overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <div>Grid: {rows} × {cols}</div>
        <div>Size: {gridSystem.dimensions?.width_feet || 0}' × {gridSystem.dimensions?.height_feet || 0}'</div>
      </div>
    </>
  );
};
