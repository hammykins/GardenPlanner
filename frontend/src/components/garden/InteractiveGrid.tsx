import React, { useState, useEffect } from 'react';
import { Polygon } from 'react-leaflet';
import { useGardenStore } from '../../stores/gardenStore';

interface GridCell {
  id: number;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  polygon: [number, number][];
}

interface InteractiveGridProps {
  isGridVisible: boolean;
  rows: number;
  cols: number;
}

export const InteractiveGrid: React.FC<InteractiveGridProps> = ({
  isGridVisible,
  rows,
  cols
}) => {
  const { boundary } = useGardenStore();
  const [gridCells, setGridCells] = useState<GridCell[]>([]);

  // Generate grid based on boundary
  useEffect(() => {
    if (!boundary || boundary.length === 0 || !isGridVisible) {
      setGridCells([]);
      return;
    }

    // Calculate bounding box of the boundary
    const lats = boundary.map(p => p[0]);
    const lngs = boundary.map(p => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Create grid
    const latStep = (maxLat - minLat) / rows;
    const lngStep = (maxLng - minLng) / cols;

    const cells: GridCell[] = [];
    let cellId = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const north = minLat + (row + 1) * latStep;
        const south = minLat + row * latStep;
        const west = minLng + col * lngStep;
        const east = minLng + (col + 1) * lngStep;

        const cellPolygon: [number, number][] = [
          [south, west],
          [north, west],
          [north, east],
          [south, east],
          [south, west]
        ];

        cells.push({
          id: cellId++,
          bounds: { north, south, east, west },
          polygon: cellPolygon
        });
      }
    }

    setGridCells(cells);
  }, [boundary, rows, cols, isGridVisible]);

  if (!isGridVisible) return null;

  return (
    <>
      {gridCells.map(cell => (
        <Polygon
          key={cell.id}
          positions={cell.polygon}
          pathOptions={{
            color: '#333',
            weight: 1,
            fillOpacity: 0,
            dashArray: '3, 3'
          }}
        />
      ))}
    </>
  );
};
