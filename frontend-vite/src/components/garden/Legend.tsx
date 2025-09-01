import React from 'react';
import type { PlantType } from '../../mocks/plantTypes';
import './Legend.css';

interface LegendItem extends PlantType {
  color: string;
}

interface LegendProps {
  items: LegendItem[];
  onRemoveItem?: (plantId: string) => void;
}

export const Legend: React.FC<LegendProps> = ({ items, onRemoveItem }) => {
  return (
    <div className="garden-legend">
      <h3>Plants in Garden</h3>
      <div className="legend-items">
        {items.map(item => (
          <div key={item.id} className="legend-item">
            <div 
              className="color-box" 
              style={{ backgroundColor: item.color }}
            />
            <span className="item-name">{item.name}</span>
            {onRemoveItem && (
              <button 
                className="remove-btn"
                onClick={() => onRemoveItem(item.id)}
                title="Remove plant"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty-message">
            No plants added yet
          </div>
        )}
      </div>
    </div>
  );
};
