import React, { useState, useRef, useCallback } from 'react';
import { useMapEvents } from 'react-leaflet';
import './InteractiveGrid.css';

interface InteractiveGridProps {
  gridSystem: any;
  onGridResize: (rows: number, cols: number) => void;
  onGridMove: (latOffset: number, lngOffset: number) => void;
  visible: boolean;
}

export const InteractiveGrid: React.FC<InteractiveGridProps> = ({
  gridSystem,
  onGridResize,
  onGridMove,
  visible
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<'top' | 'bottom' | 'left' | 'right' | 'corner' | null>(null);

  const map = useMapEvents({
    mousemove(e) {
      if (isDragging && dragStart) {
        const deltaX = e.originalEvent.clientX - dragStart.x;
        const deltaY = e.originalEvent.clientY - dragStart.y;
        
        // Convert pixel movement to lat/lng offset
        const latOffset = deltaY * -0.00001; // Negative because map coordinates are inverted
        const lngOffset = deltaX * 0.00001;
        
        onGridMove(latOffset, lngOffset);
      }
    },
    mouseup() {
      setIsDragging(false);
      setIsResizing(false);
      setDragStart(null);
      document.body.style.cursor = 'default';
    }
  });

  if (!visible || !gridSystem) return null;

  const { grid_cells, dimensions } = gridSystem;
  const rows = dimensions.rows;
  const cols = dimensions.cols;

  // Get grid boundaries
  const firstCell = grid_cells[0];
  const lastCell = grid_cells[grid_cells.length - 1];
  
  if (!firstCell || !lastCell) return null;

  const minLat = Math.min(...grid_cells.map((cell: any) => 
    Math.min(...cell.geometry.coordinates[0].map((coord: number[]) => coord[1]))
  ));
  const maxLat = Math.max(...grid_cells.map((cell: any) => 
    Math.max(...cell.geometry.coordinates[0].map((coord: number[]) => coord[1]))
  ));
  const minLng = Math.min(...grid_cells.map((cell: any) => 
    Math.min(...cell.geometry.coordinates[0].map((coord: number[]) => coord[0]))
  ));
  const maxLng = Math.max(...grid_cells.map((cell: any) => 
    Math.max(...cell.geometry.coordinates[0].map((coord: number[]) => coord[0]))
  ));

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize' | 'add-row' | 'remove-row' | 'add-col' | 'remove-col') => {
    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });

    switch (action) {
      case 'drag':
        setIsDragging(true);
        document.body.style.cursor = 'grabbing';
        break;
      case 'resize':
        setIsResizing(true);
        document.body.style.cursor = 'nw-resize';
        break;
      case 'add-row':
        onGridResize(rows + 1, cols);
        break;
      case 'remove-row':
        if (rows > 1) onGridResize(rows - 1, cols);
        break;
      case 'add-col':
        onGridResize(rows, cols + 1);
        break;
      case 'remove-col':
        if (cols > 1) onGridResize(rows, cols - 1);
        break;
    }
  };

  return (
    <div className="interactive-grid-overlay">
      {/* Main grid area - draggable */}
      <div
        className={`grid-drag-area ${isDragging ? 'dragging' : ''}`}
        style={{
          position: 'absolute',
          top: `${(90 - maxLat * 1000000) * 10}px`, // Convert lat to approximate pixels
          left: `${(minLng + 74.006) * 1000000 * 10}px`, // Convert lng to approximate pixels
          width: `${(maxLng - minLng) * 1000000 * 10}px`,
          height: `${(maxLat - minLat) * 1000000 * 10}px`,
          border: hoveredEdge ? '2px solid #4CAF50' : '1px solid transparent',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 1000,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
        onMouseEnter={() => setHoveredEdge('corner')}
        onMouseLeave={() => setHoveredEdge(null)}
      >
        {/* Corner resize handle */}
        <div
          className="resize-handle corner"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMouseDown(e, 'resize');
          }}
        />

        {/* Top edge - add/remove rows */}
        <div
          className="edge-control top"
          onMouseEnter={() => setHoveredEdge('top')}
        >
          <button
            className="edge-button add"
            onClick={() => onGridResize(rows + 1, cols)}
            title="Add Row Above"
          >
            +
          </button>
          {rows > 1 && (
            <button
              className="edge-button remove"
              onClick={() => onGridResize(rows - 1, cols)}
              title="Remove Top Row"
            >
              −
            </button>
          )}
        </div>

        {/* Bottom edge - add/remove rows */}
        <div
          className="edge-control bottom"
          onMouseEnter={() => setHoveredEdge('bottom')}
        >
          <button
            className="edge-button add"
            onClick={() => onGridResize(rows + 1, cols)}
            title="Add Row Below"
          >
            +
          </button>
          {rows > 1 && (
            <button
              className="edge-button remove"
              onClick={() => onGridResize(rows - 1, cols)}
              title="Remove Bottom Row"
            >
              −
            </button>
          )}
        </div>

        {/* Left edge - add/remove columns */}
        <div
          className="edge-control left"
          onMouseEnter={() => setHoveredEdge('left')}
        >
          <button
            className="edge-button add"
            onClick={() => onGridResize(rows, cols + 1)}
            title="Add Column Left"
          >
            +
          </button>
          {cols > 1 && (
            <button
              className="edge-button remove"
              onClick={() => onGridResize(rows, cols - 1)}
              title="Remove Left Column"
            >
              −
            </button>
          )}
        </div>

        {/* Right edge - add/remove columns */}
        <div
          className="edge-control right"
          onMouseEnter={() => setHoveredEdge('right')}
        >
          <button
            className="edge-button add"
            onClick={() => onGridResize(rows, cols + 1)}
            title="Add Column Right"
          >
            +
          </button>
          {cols > 1 && (
            <button
              className="edge-button remove"
              onClick={() => onGridResize(rows, cols - 1)}
              title="Remove Right Column"
            >
              −
            </button>
          )}
        </div>
      </div>

      {/* Grid info tooltip */}
      {hoveredEdge && (
        <div className="grid-tooltip">
          <div className="tooltip-content">
            <strong>{rows} × {cols} Grid</strong>
            <div>{rows * cols} cells</div>
            <div>{dimensions.width_feet}' × {dimensions.height_feet}'</div>
          </div>
        </div>
      )}
    </div>
  );
};
