import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, ImageOverlay, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './GardenPlanner.css';

interface GridCell {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface GridSystem {
  grid_cells: GridCell[];
  cell_size_feet: number;
  total_cells: number;
  dimensions: {
    width_feet: number;
    height_feet: number;
  };
}

const GardenPlanner: React.FC<{ gardenId: number }> = ({ gardenId }) => {
  const [satelliteImage, setSatelliteImage] = useState<string>('');
  const [imageBounds, setImageBounds] = useState<[[number, number], [number, number]]>([[0, 0], [0, 0]]);
  const [gridSystem, setGridSystem] = useState<GridSystem | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  useEffect(() => {
    // Fetch satellite imagery
    const fetchSatelliteImage = async () => {
      try {
        const response = await axios.get(`/api/gardens/${gardenId}/satellite`);
        const imageBlob = new Blob([response.data.image], { type: 'image/png' });
        setSatelliteImage(URL.createObjectURL(imageBlob));
        setImageBounds([
          [response.data.bounds[1], response.data.bounds[0]],
          [response.data.bounds[3], response.data.bounds[2]]
        ]);
      } catch (error) {
        console.error('Error fetching satellite image:', error);
      }
    };

    // Fetch grid system
    const fetchGridSystem = async () => {
      try {
        const response = await axios.get(`/api/gardens/${gardenId}/grid?grid_size=2`);
        setGridSystem(response.data);
      } catch (error) {
        console.error('Error fetching grid system:', error);
      }
    };

    fetchSatelliteImage();
    fetchGridSystem();
  }, [gardenId]);

  const handleCellClick = async (cellId: number) => {
    try {
      const response = await axios.get(`/api/gardens/${gardenId}/grid/${cellId}`);
      setSelectedCell(cellId);
      console.log('Cell info:', response.data);
    } catch (error) {
      console.error('Error fetching cell info:', error);
    }
  };

  return (
    <div className="garden-planner">
      <MapContainer
        center={[
          (imageBounds[0][0] + imageBounds[1][0]) / 2,
          (imageBounds[0][1] + imageBounds[1][1]) / 2
        ]}
        zoom={19}
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {satelliteImage && (
          <ImageOverlay
            url={satelliteImage}
            bounds={imageBounds}
            opacity={0.7}
          />
        )}

        {gridSystem?.grid_cells.map((cell, index) => (
          <Polygon
            key={index}
            positions={cell.geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
            pathOptions={{
              color: selectedCell === index ? '#ff0000' : '#3388ff',
              weight: 1,
              fillOpacity: 0.2
            }}
            eventHandlers={{
              click: () => handleCellClick(index)
            }}
          />
        ))}
      </MapContainer>

      {selectedCell !== null && (
        <div className="cell-info">
          <h3>Selected Cell #{selectedCell}</h3>
          <p>Size: {gridSystem?.cell_size_feet} x {gridSystem?.cell_size_feet} feet</p>
        </div>
      )}
    </div>
  );
};

export default GardenPlanner;
