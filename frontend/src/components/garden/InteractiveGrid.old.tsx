import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GridSystem } from '../../types/garden';
import './InteractiveGrid.css';

interface InteractiveGridProps {
  gridSystem: GridSystem;
  plantedCells: Array<{ cellId: number; plant: any; color: string; }>;
  selectedCell: number | null;
  onCellClick: (cellId: number) => void;
  onGridResize: (rows: number, cols: number) => void;
  gridVisible: boolean;
}

// Custom resize handle icon
const createResizeIcon = (direction: string) => {
  return L.divIcon({
    className: `resize-handle resize-${direction}`,
    iconSize: [20, 20], // Increased size for better visibility
    iconAnchor: [10, 10], // Adjust anchor to center
    html: `<div class="resize-handle-inner" style="background-color: red; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`
  });
};

export const InteractiveGrid: React.FC<InteractiveGridProps> = ({
  gridSystem,
  plantedCells,
  selectedCell,
  onCellClick,
  onGridResize,
  gridVisible
}) => {
  console.log('🔷 InteractiveGrid rendered with props:');
  console.log('  - hasGridSystem:', !!gridSystem);
  console.log('  - hasCells:', !!gridSystem?.grid_cells?.length);
  console.log('  - gridVisible:', gridVisible);
  console.log('  - cellCount:', gridSystem?.grid_cells?.length || 0);

  const [isGridHovered, setIsGridHovered] = useState(false);
  const map = useMap(); // Get map instance for dragging control
  const mapDragDisabledRef = useRef(false);
  const hoverTimeoutRef = useRef<number | null>(null);

  // Disable map dragging when hovering over grid controls
  const disableMapDrag = useCallback(() => {
    if (map && map.dragging && !mapDragDisabledRef.current) {
      map.dragging.disable();
      mapDragDisabledRef.current = true;
    }
  }, [map]);

  // Re-enable map dragging when leaving grid controls
  const enableMapDrag = useCallback(() => {
    if (map && map.dragging && mapDragDisabledRef.current) {
      map.dragging.enable();
      mapDragDisabledRef.current = false;
    }
  }, [map]);

  // Handle grid hover with delay
  const handleGridMouseEnter = useCallback(() => {
    console.log('🖱️ Grid hover detected - showing controls');
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsGridHovered(true);
    disableMapDrag();
  }, [disableMapDrag]);

  const handleGridMouseLeave = useCallback(() => {
    console.log('🖱️ Grid hover leave detected - hiding controls with delay');
    hoverTimeoutRef.current = window.setTimeout(() => {
      setIsGridHovered(false);
      enableMapDrag();
    }, 200); // Small delay to prevent flickering
  }, [enableMapDrag]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      enableMapDrag();
    };
  }, [enableMapDrag]);

  if (!gridVisible || !gridSystem?.grid_cells?.length) {
    console.log('🚫 InteractiveGrid early return:');
    console.log('  - gridVisible:', gridVisible);
    console.log('  - hasGridSystem:', !!gridSystem);
    console.log('  - hasCells:', !!gridSystem?.grid_cells?.length);
    console.log('  - cellCount:', gridSystem?.grid_cells?.length || 0);
    return null;
  }

  console.log('✅ InteractiveGrid proceeding to render grid components!');
  
  // Temporarily disable map dragging completely for testing
  React.useEffect(() => {
    if (map && map.dragging) {
      console.log('🚫 Temporarily disabling map dragging for testing');
      map.dragging.disable();
    }
    
    return () => {
      if (map && map.dragging) {
        console.log('✅ Re-enabling map dragging on cleanup');
        map.dragging.enable();
      }
    };
  }, [map]);

  // Calculate grid boundaries
  const gridCells = gridSystem.grid_cells;
  
  // Find the actual boundaries
  const allCoords = gridCells.flatMap(cell => cell.geometry.coordinates[0]);
  const lats = allCoords.map(coord => coord[1]);
  const lngs = allCoords.map(coord => coord[0]);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  console.log('🗺️ Grid boundaries calculated:', {
    minLat: minLat.toFixed(8),
    maxLat: maxLat.toFixed(8), 
    minLng: minLng.toFixed(8),
    maxLng: maxLng.toFixed(8)
  });

  // Calculate approximate rows and columns from dimensions
  const cellSizeFeet = gridSystem.cell_size_feet || 1;
  const rows = Math.round(gridSystem.dimensions.height_feet / cellSizeFeet);
  const cols = Math.round(gridSystem.dimensions.width_feet / cellSizeFeet);

  // Handle resize
  const handleResize = useCallback((direction: string) => {
    console.log('🔧 Grid resize requested:', direction, 'Current:', { rows, cols });
    switch (direction) {
      case 'se': // Southeast corner - increase both
        console.log('🔧 SE resize: increasing to', rows + 1, cols + 1);
        onGridResize(rows + 1, cols + 1);
        break;
      case 'sw': // Southwest corner - increase rows, decrease cols
        console.log('🔧 SW resize: changing to', rows + 1, Math.max(1, cols - 1));
        onGridResize(rows + 1, Math.max(1, cols - 1));
        break;
      case 'ne': // Northeast corner - decrease rows, increase cols
        console.log('🔧 NE resize: changing to', Math.max(1, rows - 1), cols + 1);
        onGridResize(Math.max(1, rows - 1), cols + 1);
        break;
      case 'nw': // Northwest corner - decrease both
        console.log('🔧 NW resize: decreasing to', Math.max(1, rows - 1), Math.max(1, cols - 1));
        onGridResize(Math.max(1, rows - 1), Math.max(1, cols - 1));
        break;
    }
  }, [rows, cols, onGridResize]);

  // Handle row/column operations
  const addRow = useCallback(() => {
    console.log('➕ Adding row: from', rows, 'to', rows + 1);
    onGridResize(rows + 1, cols);
  }, [rows, cols, onGridResize]);

  const removeRow = useCallback(() => {
    if (rows > 1) {
      console.log('➖ Removing row: from', rows, 'to', rows - 1);
      onGridResize(rows - 1, cols);
    }
  }, [rows, cols, onGridResize]);

  const addColumn = useCallback(() => {
    console.log('➕ Adding column: from', cols, 'to', cols + 1);
    onGridResize(rows, cols + 1);
  }, [rows, cols, onGridResize]);

  const removeColumn = useCallback(() => {
    if (cols > 1) {
      console.log('➖ Removing column: from', cols, 'to', cols - 1);
      onGridResize(rows, cols - 1);
    }
  }, [rows, cols, onGridResize]);

  return (
    <>
      <div className={`interactive-grid ${isGridHovered ? 'hovered' : ''}`}>
        {/* Render grid cells */}
        {gridCells.map((cell, index) => {
          const plantedCell = plantedCells.find(pc => pc.cellId === index);
          return (
            <Polygon
              key={`cell-${index}`}
              positions={cell.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
              pathOptions={{
                color: selectedCell === index ? '#ff0000' : '#3388ff',
                weight: isGridHovered ? 2 : 1,
                fillOpacity: plantedCell ? 0.4 : 0.2,
                fillColor: plantedCell ? plantedCell.color : '#3388ff'
              }}
              eventHandlers={{
                click: () => onCellClick(index),
                mouseover: () => {
                  console.log('🖱️ Grid cell mouseover - enabling hover state');
                  handleGridMouseEnter();
                },
                mouseout: () => {
                  console.log('🖱️ Grid cell mouseout - starting leave timer');
                  handleGridMouseLeave();
                }
              }}
            />
          );
        })}

        {/* Grid info overlay */}
        {isGridHovered && (
          <div className="grid-info-overlay">
            <div className="grid-dimensions">
              {rows} × {cols}
            </div>
            <div className="grid-size">
              {gridSystem.dimensions.width_feet}' × {gridSystem.dimensions.height_feet}'
            </div>
          </div>
        )}
      </div>

      {/* Simple button-based resize controls - positioned outside the map */}
      {isGridHovered && (
        <div className="grid-resize-controls" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 2000,
          border: '1px solid #ccc'
        }}>
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Grid Controls ({rows} × {cols})
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <button
              onClick={() => {
                console.log('🔴 Resize SE button clicked!');
                handleResize('se');
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#3388ff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Expand ↘️
            </button>
            
            <button
              onClick={() => {
                console.log('🔴 Resize NW button clicked!');
                handleResize('nw');
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#cc6633',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Shrink ↖️
            </button>
            
            <button
              onClick={() => {
                console.log('➕ Add Row button clicked!');
                addRow();
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#22aa22',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              + Row
            </button>
            
            <button
              onClick={() => {
                console.log('➖ Remove Row button clicked!');
                removeRow();
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: rows <= 1 ? '#ccc' : '#aa2222',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: rows <= 1 ? 'not-allowed' : 'pointer'
              }}
              disabled={rows <= 1}
            >
              - Row
            </button>
            
            <button
              onClick={() => {
                console.log('➕ Add Column button clicked!');
                addColumn();
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#22aa22',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              + Col
            </button>
            
            <button
              onClick={() => {
                console.log('➖ Remove Column button clicked!');
                removeColumn();
              }}
              style={{
                padding: '5px 10px',
                backgroundColor: '#aa2222',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
              disabled={cols <= 1}
            >
              - Col
            </button>
          </div>
        </div>
      )}
    </>
  );
};
