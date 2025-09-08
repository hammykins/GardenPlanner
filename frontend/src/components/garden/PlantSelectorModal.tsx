import React, { useState } from 'react';

interface PlantSelectorModalProps {
  onSelect: (plantName: string, color: string) => void;
  onCancel: () => void;
}

const PLANT_TYPES = [
  { name: 'Tomato', color: '#dc2626', icon: '🍅' },
  { name: 'Lettuce', color: '#16a34a', icon: '🥬' },
  { name: 'Carrot', color: '#ea580c', icon: '🥕' },
  { name: 'Pepper', color: '#dc2626', icon: '🌶️' },
  { name: 'Onion', color: '#a855f7', icon: '🧅' },
  { name: 'Cucumber', color: '#059669', icon: '🥒' },
  { name: 'Corn', color: '#facc15', icon: '🌽' },
  { name: 'Beans', color: '#16a34a', icon: '🫘' },
  { name: 'Spinach', color: '#15803d', icon: '🥬' },
  { name: 'Radish', color: '#dc2626', icon: '🌿' },
  { name: 'Sunflower', color: '#facc15', icon: '🌻' },
  { name: 'Rose', color: '#e11d48', icon: '🌹' },
  { name: 'Marigold', color: '#f59e0b', icon: '🌼' },
  { name: 'Lavender', color: '#8b5cf6', icon: '🪻' },
  { name: 'Herb Mix', color: '#22c55e', icon: '🌿' }
];

export const PlantSelectorModal: React.FC<PlantSelectorModalProps> = ({ onSelect, onCancel }) => {
  const [selectedPlant, setSelectedPlant] = useState(PLANT_TYPES[0]);
  const [customColor, setCustomColor] = useState(selectedPlant.color);

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div className="modal" style={{
        background: 'white',
        borderRadius: 8,
        padding: 24,
        maxWidth: 400,
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Select Plant</h3>
        
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: 8
          }}>
            {PLANT_TYPES.map(plant => (
              <button
                key={plant.name}
                onClick={() => {
                  setSelectedPlant(plant);
                  setCustomColor(plant.color);
                }}
                style={{
                  padding: 8,
                  border: selectedPlant.name === plant.name ? '2px solid #007bff' : '1px solid #ddd',
                  borderRadius: 6,
                  background: selectedPlant.name === plant.name ? '#f0f8ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: 12
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{plant.icon}</div>
                <div>{plant.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Custom Color:</label>
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            style={{ width: '100%', height: 40 }}
          />
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 16,
          padding: 12,
          border: '1px solid #ddd',
          borderRadius: 6
        }}>
          <span style={{ fontSize: 24, marginRight: 12 }}>{selectedPlant.icon}</span>
          <div>
            <div style={{ fontWeight: 'bold' }}>{selectedPlant.name}</div>
            <div style={{ 
              width: 40, 
              height: 20, 
              backgroundColor: customColor, 
              borderRadius: 4, 
              border: '1px solid #ddd' 
            }}></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onSelect(selectedPlant.name, customColor)}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Plant Here
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
