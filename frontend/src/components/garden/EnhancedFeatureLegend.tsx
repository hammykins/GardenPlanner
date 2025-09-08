import React, { useState } from 'react';
import type { Feature } from '../../api/features.api';
import { updateFeature } from '../../api/features.api';

interface FeatureLegendProps {
  features: Feature[];
  onSelect?: (id: number) => void;
  selectedId?: number;
  onUpdateFeature?: (feature: Feature) => void;
}

interface FeatureStyles {
  color: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
}

export const EnhancedFeatureLegend: React.FC<FeatureLegendProps> = ({ 
  features, 
  onSelect, 
  selectedId, 
  onUpdateFeature 
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [styles, setStyles] = useState<Record<number, FeatureStyles>>({});

  const getFeatureStyle = (feature: Feature): FeatureStyles => {
    return styles[feature.id] || {
      color: feature.color,
      fillOpacity: 0.3,
      strokeColor: feature.color,
      strokeWidth: 2
    };
  };

  const updateFeatureStyle = async (feature: Feature, newStyles: FeatureStyles) => {
    setStyles(prev => ({ ...prev, [feature.id]: newStyles }));
    
    // Update the feature in backend with new color
    const updatedFeature = { ...feature, color: newStyles.color };
    try {
      await updateFeature(feature.id, {
        name: feature.name,
        boundary: feature.boundary,
        color: newStyles.color,
        garden_id: feature.garden_id,
        user_id: feature.user_id
      });
      onUpdateFeature?.(updatedFeature);
    } catch (error) {
      console.error('Failed to update feature:', error);
    }
  };

  return (
    <div className="feature-legend" style={{ 
      background: '#fff', 
      padding: 16, 
      borderRadius: 8, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      maxWidth: 300,
      margin: 16
    }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: 16 }}>Yard Features</h4>
      {features.length === 0 && (
        <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
          Draw polygons on the map to create yard features
        </p>
      )}
      {features.map(feature => {
        const style = getFeatureStyle(feature);
        const isEditing = editingId === feature.id;
        
        return (
          <div key={feature.id} style={{ marginBottom: 12, border: selectedId === feature.id ? '2px solid #007bff' : '1px solid #e0e0e0', borderRadius: 6, padding: 8 }}>
            <div
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: onSelect ? 'pointer' : 'default',
                marginBottom: 8
              }}
              onClick={() => onSelect?.(feature.id)}
            >
              <span 
                style={{ 
                  background: style.color, 
                  width: 20, 
                  height: 20, 
                  borderRadius: 4, 
                  display: 'inline-block', 
                  marginRight: 8,
                  border: `${style.strokeWidth}px solid ${style.strokeColor}`,
                  opacity: style.fillOpacity + 0.7
                }} 
              />
              <span style={{ fontWeight: selectedId === feature.id ? 'bold' : 'normal', flex: 1 }}>
                {feature.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(isEditing ? null : feature.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#666'
                }}
              >
                {isEditing ? '✓' : '⚙️'}
              </button>
            </div>
            
            {isEditing && (
              <div style={{ fontSize: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Fill Color:</label>
                  <input
                    type="color"
                    value={style.color}
                    onChange={(e) => updateFeatureStyle(feature, { ...style, color: e.target.value })}
                    style={{ width: '100%', height: 30 }}
                  />
                </div>
                
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Opacity: {Math.round(style.fillOpacity * 100)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={style.fillOpacity}
                    onChange={(e) => updateFeatureStyle(feature, { ...style, fillOpacity: parseFloat(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Border Color:</label>
                  <input
                    type="color"
                    value={style.strokeColor}
                    onChange={(e) => updateFeatureStyle(feature, { ...style, strokeColor: e.target.value })}
                    style={{ width: '100%', height: 30 }}
                  />
                </div>
                
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Border Width: {style.strokeWidth}px</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={style.strokeWidth}
                    onChange={(e) => updateFeatureStyle(feature, { ...style, strokeWidth: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
