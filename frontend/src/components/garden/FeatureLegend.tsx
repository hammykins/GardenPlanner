import React from 'react';
import type { Feature } from '../../api/features.api';

export const FeatureLegend: React.FC<{ features: Feature[]; onSelect?: (id: number) => void; selectedId?: number }> = ({ features, onSelect, selectedId }) => (
  <div className="feature-legend" style={{ background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 2px 8px #0002', maxWidth: 220 }}>
    <h4 style={{ margin: '0 0 8px 0' }}>Legend</h4>
    {features.map(f => (
      <div
        key={f.id}
        style={{ display: 'flex', alignItems: 'center', marginBottom: 6, cursor: onSelect ? 'pointer' : 'default', fontWeight: selectedId === f.id ? 'bold' : 'normal' }}
        onClick={() => onSelect && onSelect(f.id)}
      >
        <span style={{ background: f.color, width: 18, height: 18, borderRadius: 9, display: 'inline-block', marginRight: 8, border: '1px solid #888' }} />
        {f.name}
      </div>
    ))}
  </div>
);
