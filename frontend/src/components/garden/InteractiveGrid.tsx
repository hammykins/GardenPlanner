import React, { useState, useCallback } from 'react';
import { Polygon, Marker } from 'react-leaflet';
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
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    html: `<div class="resize-handle-inner"></div>`
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
  const [isGridHovered, setIsGridHovered] = useState(false);

  if (!gridVisible || !gridSystem?.grid_cells?.length) {
    return null;
  }

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

  // Calculate approximate rows and columns from dimensions
  const cellSizeFeet = gridSystem.cell_size_feet || 1;
  const rows = Math.round(gridSystem.dimensions.height_feet / cellSizeFeet);
  const cols = Math.round(gridSystem.dimensions.width_feet / cellSizeFeet);

  // Handle resize
  const handleResize = useCallback((direction: string) => {
    switch (direction) {
      case 'se': // Southeast corner - increase both
        onGridResize(rows + 1, cols + 1);
        break;
      case 'sw': // Southwest corner - increase rows, decrease cols
        onGridResize(rows + 1, Math.max(1, cols - 1));
        break;
      case 'ne': // Northeast corner - decrease rows, increase cols
        onGridResize(Math.max(1, rows - 1), cols + 1);
        break;
      case 'nw': // Northwest corner - decrease both
        onGridResize(Math.max(1, rows - 1), Math.max(1, cols - 1));
        break;
    }
  }, [rows, cols, onGridResize]);

  // Handle row/column operations
  const addRow = useCallback(() => {
    onGridResize(rows + 1, cols);
  }, [rows, cols, onGridResize]);

  const removeRow = useCallback(() => {
    if (rows > 1) {
      onGridResize(rows - 1, cols);
    }
  }, [rows, cols, onGridResize]);

  const addColumn = useCallback(() => {
    onGridResize(rows, cols + 1);
  }, [rows, cols, onGridResize]);

  const removeColumn = useCallback(() => {
    if (cols > 1) {
      onGridResize(rows, cols - 1);
    }
  }, [rows, cols, onGridResize]);

  return (
    <div 
      className={`interactive-grid ${isGridHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsGridHovered(true)}
      onMouseLeave={() => setIsGridHovered(false)}
    >
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
              mouseover: () => setIsGridHovered(true)
            }}
          />
        );
      })}

      {/* Corner resize handles - only show on hover */}
      {isGridHovered && (
        <>
          {/* Southeast corner - primary resize handle */}
          <Marker
            position={[minLat, maxLng]}
            icon={createResizeIcon('se')}
            eventHandlers={{
              click: () => handleResize('se')
            }}
          />

          {/* Northwest corner */}
          <Marker
            position={[maxLat, minLng]}
            icon={createResizeIcon('nw')}
            eventHandlers={{
              click: () => handleResize('nw')
            }}
          />

          {/* Northeast corner */}
          <Marker
            position={[maxLat, maxLng]}
            icon={createResizeIcon('ne')}
            eventHandlers={{
              click: () => handleResize('ne')
            }}
          />

          {/* Southwest corner */}
          <Marker
            position={[minLat, minLng]}
            icon={createResizeIcon('sw')}
            eventHandlers={{
              click: () => handleResize('sw')
            }}
          />
        </>
      )}

      {/* Row and column controls - show on hover */}
      {isGridHovered && (
        <>
          {/* Add row button (bottom edge) */}
          <Marker
            position={[minLat - 0.00002, (minLng + maxLng) / 2]}
            icon={L.divIcon({
              className: 'grid-control-button add-row',
              iconSize: [24, 12],
              iconAnchor: [12, 6],
              html: '<div class="control-text">+ Row</div>'
            })}
            eventHandlers={{
              click: addRow
            }}
          />

          {/* Remove row button (if more than 1 row) */}
          {rows > 1 && (
            <Marker
              position={[maxLat + 0.00002, (minLng + maxLng) / 2]}
              icon={L.divIcon({
                className: 'grid-control-button remove-row',
                iconSize: [24, 12],
                iconAnchor: [12, 6],
                html: '<div class="control-text">- Row</div>'
              })}
              eventHandlers={{
                click: removeRow
              }}
            />
          )}

          {/* Add column button (right edge) */}
          <Marker
            position={[(minLat + maxLat) / 2, maxLng + 0.00002]}
            icon={L.divIcon({
              className: 'grid-control-button add-col',
              iconSize: [12, 24],
              iconAnchor: [6, 12],
              html: '<div class="control-text">+ Col</div>'
            })}
            eventHandlers={{
              click: addColumn
            }}
          />

          {/* Remove column button (if more than 1 column) */}
          {cols > 1 && (
            <Marker
              position={[(minLat + maxLat) / 2, minLng - 0.00002]}
              icon={L.divIcon({
                className: 'grid-control-button remove-col',
                iconSize: [12, 24],
                iconAnchor: [6, 12],
                html: '<div class="control-text">- Col</div>'
              })}
              eventHandlers={{
                click: removeColumn
              }}
            />
          )}
        </>
      )}

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
  );
};
