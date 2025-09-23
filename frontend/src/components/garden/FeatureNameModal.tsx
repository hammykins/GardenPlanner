import React, { useState } from 'react';

interface FeatureNameModalProps {
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
}

const COLORS = ['#3388ff', '#e4572e', '#76b041', '#f3a712', '#a259f7', '#e63946', '#457b9d', '#2a9d8f'];

export const FeatureNameModal: React.FC<FeatureNameModalProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

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
          {COLORS.map(c => (
            <button
              key={c}
              style={{ background: c, border: color === c ? '2px solid #222' : '1px solid #ccc', width: 28, height: 28, borderRadius: 14, marginRight: 6 }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => name && onSubmit(name, color)} disabled={!name}>
            Save
          </button>
          <button onClick={onCancel} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
