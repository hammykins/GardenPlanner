import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Feature } from '../../api/features.api';

interface PlantGridProps {
  features: Feature[];
  gridVisible: boolean;
  cellSize: number; // in meters
  plants: PlantedCell[];
  onCellClick: (lat: number, lng: number, cellId: string) => void;
  onCellHover: (plant: PlantedCell | null) => void;
}

interface PlantedCell {
  cellId: string;
  lat: number;
  lng: number;
  plantName: string;
  plantColor: string;
}

export const PlantGrid: React.FC<PlantGridProps> = ({
  features,
  gridVisible,
  cellSize,
  plants,
  onCellClick,
  onCellHover
}) => {
  const map = useMap();
  const gridLayerRef = useRef<L.LayerGroup | null>(null);
  const plantLayerRef = useRef<L.LayerGroup | null>(null);

  // Calculate yard boundary from features
  const getYardBoundary = () => {
    const yardFeature = features.find(f => f.name.toLowerCase().includes('yard'));
    if (!yardFeature) return null;
    
    try {
      const boundary = JSON.parse(yardFeature.boundary);
      return boundary.coordinates[0].map(([lng, lat]: [number, number]) => [lat, lng]);
    } catch {
      return null;
    }
  };

  // Check if point is inside polygon using ray casting algorithm
  const isPointInPolygon = (point: [number, number], polygon: [number, number][]): boolean => {
    const [x, y] = point;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };

  // Generate grid cells within yard boundary
  const generateGridCells = () => {
    const yardBoundary = getYardBoundary();
    if (!yardBoundary) return [];

    // Find bounding box
    const lats = yardBoundary.map(([lat]: [number, number]) => lat);
    const lngs = yardBoundary.map(([, lng]: [number, number]) => lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Convert cell size from meters to degrees (approximate)
    const latDegreeSize = cellSize / 111320; // 1 degree lat ≈ 111.32 km
    const lngDegreeSize = cellSize / (111320 * Math.cos(minLat * Math.PI / 180));

    const cells: Array<{ lat: number; lng: number; cellId: string }> = [];
    
    // Generate grid
    for (let lat = minLat; lat <= maxLat; lat += latDegreeSize) {
      for (let lng = minLng; lng <= maxLng; lng += lngDegreeSize) {
        if (isPointInPolygon([lat, lng], yardBoundary)) {
          cells.push({
            lat,
            lng,
            cellId: `${lat.toFixed(6)}_${lng.toFixed(6)}`
          });
        }
      }
    }

    return cells;
  };

  // Update grid display
  useEffect(() => {
    if (!map) return;

    // Remove existing grid
    if (gridLayerRef.current) {
      map.removeLayer(gridLayerRef.current);
    }

    if (!gridVisible) return;

    const gridLayer = new L.LayerGroup();
    const cells = generateGridCells();
    
    cells.forEach(cell => {
      const cellRect = L.rectangle(
        [[cell.lat, cell.lng], [cell.lat + 0.00005, cell.lng + 0.00005]],
        {
          color: '#666',
          weight: 1,
          fillOpacity: 0.1,
          fillColor: '#ccc'
        }
      );
      
      cellRect.on('click', () => {
        onCellClick(cell.lat, cell.lng, cell.cellId);
      });
      
      gridLayer.addLayer(cellRect);
    });

    gridLayerRef.current = gridLayer;
    map.addLayer(gridLayer);

    return () => {
      if (gridLayerRef.current) {
        map.removeLayer(gridLayerRef.current);
      }
    };
  }, [map, gridVisible, cellSize, features]);

  // Update plant display
  useEffect(() => {
    if (!map) return;

    // Remove existing plants
    if (plantLayerRef.current) {
      map.removeLayer(plantLayerRef.current);
    }

    const plantLayer = new L.LayerGroup();
    
    plants.forEach(plant => {
      const plantMarker = L.circleMarker([plant.lat, plant.lng], {
        radius: 8,
        fillColor: plant.plantColor,
        color: '#333',
        weight: 2,
        fillOpacity: 0.8
      });
      
      plantMarker.on('mouseover', () => {
        onCellHover(plant);
      });
      
      plantMarker.on('mouseout', () => {
        onCellHover(null);
      });
      
      plantLayer.addLayer(plantMarker);
    });

    plantLayerRef.current = plantLayer;
    map.addLayer(plantLayer);

    return () => {
      if (plantLayerRef.current) {
        map.removeLayer(plantLayerRef.current);
      }
    };
  }, [map, plants, onCellHover]);

  return null;
};
