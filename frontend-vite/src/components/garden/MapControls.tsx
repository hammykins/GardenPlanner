import React from 'react';
import './MapControls.css';

interface MapControlsProps {
  isSatellite: boolean;
  onToggleSatellite: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  isSatellite,
  onToggleSatellite
}) => {
  return (
    <div className="map-controls">
      <button 
        className={`map-control-btn ${isSatellite ? 'active' : ''}`}
        onClick={onToggleSatellite}
        title="Toggle satellite view"
      >
        {isSatellite ? '🛰️ Satellite' : '🗺️ Street Map'}
      </button>
    </div>
  );
};
