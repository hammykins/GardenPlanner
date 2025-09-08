import { getBoundingBox } from '../../utils/geo';
import { getUSGSSatelliteUrl } from '../../utils/usgs';
import React, { useState, useRef, useEffect } from 'react';

interface Garden {
  id: number;
  name: string;
  address: string;
  boundary: number[][];
  center: [number, number];
  created_at: string;
}

interface GardenWorkspaceProps {
  garden: Garden;
}

interface GridCell {
  id: number;
  x: number;
  y: number;
  planted: boolean;
  plantType?: string;
}


// Canvas size for satellite image
const CANVAS_SIZE = 500;

// Convert lat/lng to canvas pixel coordinates
function latLngToCanvas(
  lat: number,
  lng: number,
  bbox: { minLat: number; minLng: number; maxLat: number; maxLng: number }
) {
  const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * CANVAS_SIZE;
  const y = ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * CANVAS_SIZE;
  return { x, y };
}



export const GardenWorkspace: React.FC<GardenWorkspaceProps> = ({ garden }) => {
  const [gridRows, setGridRows] = useState(8);
  const [gridCols, setGridCols] = useState(8);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Generate grid cells
  useEffect(() => {
    const newCells: GridCell[] = [];
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        newCells.push({
          id: row * gridCols + col,
          x: col,
          y: row,
          planted: false
        });
      }
    }
    setCells(newCells);
  }, [gridRows, gridCols]);


  // Draw satellite image clipped to polygon, then grid overlay
  useEffect(() => {
    if (!garden.boundary || garden.boundary.length < 3) return;
  const bbox = getBoundingBox(garden.boundary as [number, number][]);
    const imageUrl = getUSGSSatelliteUrl(bbox, CANVAS_SIZE, CANVAS_SIZE);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      // Draw satellite image
      ctx.save();
      ctx.beginPath();
      garden.boundary.forEach(([lat, lng], i) => {
        const { x, y } = latLngToCanvas(lat, lng, bbox);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.restore();
      // Draw polygon outline
      ctx.save();
      ctx.beginPath();
      garden.boundary.forEach(([lat, lng], i) => {
        const { x, y } = latLngToCanvas(lat, lng, bbox);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      // Draw grid overlay
      const cellWidth = CANVAS_SIZE / gridCols;
      const cellHeight = CANVAS_SIZE / gridRows;
  cells.forEach((cell: GridCell) => {
        const x = cell.x * cellWidth;
        const y = cell.y * cellHeight;
        if (cell.planted) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
          ctx.fillRect(x, y, cellWidth, cellHeight);
        } else if (selectedCell === cell.id) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.fillRect(x, y, cellWidth, cellHeight);
        }
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      });
      // Highlight selected cell
      if (selectedCell !== null) {
        const cell = cells.find((c: GridCell) => c.id === selectedCell);
        if (cell) {
          const x = cell.x * cellWidth;
          const y = cell.y * cellHeight;
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellWidth, cellHeight);
        }
      }
    };
    img.onerror = () => {
      setImageLoaded(false);
      setImageError(true);
    };
  }, [garden.boundary, gridRows, gridCols, cells, selectedCell]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const cellWidth = canvas.width / gridCols;
    const cellHeight = canvas.height / gridRows;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    const cellId = row * gridCols + col;

    if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
      setSelectedCell(cellId);
    }
  };

  const handleCellAction = (action: 'plant' | 'remove') => {
    if (selectedCell === null) return;

    setCells((prev: GridCell[]) => prev.map((cell: GridCell) => 
      cell.id === selectedCell 
        ? { ...cell, planted: action === 'plant', plantType: action === 'plant' ? 'tomato' : undefined }
        : cell
    ));
  };

  return (
    <div className="garden-workspace">
      <div className="workspace-header">
        <h1>{garden.name}</h1>
        <div className="garden-info">
          <span>📍 {garden.address}</span>
          <span>🗓️ {new Date(garden.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="workspace-content">
        <div className="grid-controls">
          <h3>Grid Controls</h3>
          <div className="control-group">
            <label>Rows: {gridRows}</label>
            <input 
              type="range" 
              min="4" 
              max="20" 
              value={gridRows} 
              onChange={(e) => setGridRows(Number(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>Columns: {gridCols}</label>
            <input 
              type="range" 
              min="4" 
              max="20" 
              value={gridCols} 
              onChange={(e) => setGridCols(Number(e.target.value))}
            />
          </div>
          
          {selectedCell !== null && (
            <div className="cell-actions">
              <h4>Cell {selectedCell}</h4>
              <button onClick={() => handleCellAction('plant')} className="plant-button">
                🌱 Plant Here
              </button>
              <button onClick={() => handleCellAction('remove')} className="remove-button">
                🗑️ Remove Plant
              </button>
            </div>
          )}
        </div>

        <div className="garden-canvas-container">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="garden-canvas"
            onClick={handleCanvasClick}
            style={{
              borderRadius: 16,
              boxShadow: '0 2px 8px #0002',
              margin: 24,
              cursor: 'crosshair',
              background: '#222'
            }}
          />
          {!imageLoaded && !imageError && (
            <div style={{position:'absolute',left:0,top:0,width:CANVAS_SIZE,height:CANVAS_SIZE,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',background:'#222a',zIndex:2}}>
              Loading satellite image...
            </div>
          )}
          {imageError && (
            <div style={{position:'absolute',left:0,top:0,width:CANVAS_SIZE,height:CANVAS_SIZE,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',background:'#a00a',zIndex:2}}>
              Failed to load satellite image
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
