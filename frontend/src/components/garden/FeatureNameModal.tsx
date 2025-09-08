import React, { useState } from 'react';

interface FeatureNameModalProps {
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
}

const COLORS = ['#3388ff', '#e4572e', '#76b041', '#f3a712', '#a259f7', '#e63946', '#457b9d', '#2a9d8f'];

export const FeatureNameModal: React.FC<FeatureNameModalProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#ff0000');

  const handleCustomColorChange = (newColor: string) => {
    setCustomColor(newColor);
    setColor(newColor);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Name this feature</h3>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Yard, House, Garden Bed 1"
          autoFocus
        />
        <div style={{ margin: '12px 0' }}>
          <span>Color: </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
            {/* Preset color options */}
            {COLORS.map(c => (
              <button
                key={c}
                style={{ 
                  background: c, 
                  border: color === c ? '3px solid #222' : '1px solid #ccc', 
                  width: 32, 
                  height: 32, 
                  borderRadius: 16, 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setColor(c)}
                title={`Select ${c}`}
              />
            ))}
            
            {/* Add Custom Color Button */}
            <button
              style={{
                background: showColorPicker ? customColor : 'linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)',
                border: (showColorPicker && color === customColor) ? '3px solid #222' : '2px solid #666',
                width: 32,
                height: 32,
                borderRadius: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Custom color picker"
            >
              +
            </button>
          </div>
          
          {/* Color Picker Input */}
          {showColorPicker && (
            <div style={{ 
              marginTop: '12px', 
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '14px',
                color: '#495057'
              }}>
                <span>Custom Color:</span>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  style={{
                    width: '50px',
                    height: '30px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6c757d',
                  fontFamily: 'monospace'
                }}>
                  {customColor}
                </span>
              </label>
            </div>
          )}
        </div>
        
        <div style={{ marginTop: 12 }}>
          <button 
            onClick={() => name && onSubmit(name, color)} 
            disabled={!name}
            style={{
              backgroundColor: !name ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: !name ? 'not-allowed' : 'pointer'
            }}
          >
            Save
          </button>
          <button 
            onClick={onCancel} 
            style={{ 
              marginLeft: 8,
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
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
