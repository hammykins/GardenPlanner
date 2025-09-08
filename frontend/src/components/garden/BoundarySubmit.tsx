import React, { useState } from 'react';
import { useGardenStore } from '../../stores/gardenStore';

interface BoundarySubmitProps {
  onSubmit: (gardenData: any) => void;
}

export const BoundarySubmit: React.FC<BoundarySubmitProps> = ({ onSubmit }) => {
  const { boundary, address, center } = useGardenStore();
  const [gardenName, setGardenName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = boundary && boundary.length > 0 && gardenName.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      // Calculate center from boundary if not available
      let gardenCenter = center;
      if (!gardenCenter && boundary && boundary.length > 0) {
        // Calculate centroid from boundary coordinates
        const sumLat = boundary.reduce((sum, coord) => sum + coord[0], 0);
        const sumLng = boundary.reduce((sum, coord) => sum + coord[1], 0);
        gardenCenter = [sumLat / boundary.length, sumLng / boundary.length];
      }

      const gardenData = {
        name: gardenName.trim(),
        address: address || 'Unknown location',
        center: gardenCenter,
        boundary: boundary,
        created_at: new Date().toISOString()
      };

      // Call the submit handler
      await onSubmit(gardenData);
      
      console.log('✅ Garden boundary submitted successfully');
    } catch (error) {
      console.error('❌ Error submitting garden boundary:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!boundary || boundary.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'white',
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '1px solid #ddd',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px', 
          color: '#333',
          textAlign: 'center'
        }}>
          Save Yard Boundary
        </h3>
        <p style={{
          margin: '0 0 12px 0',
          fontSize: '13px',
          color: '#666',
          textAlign: 'center'
        }}>
          Create a garden workspace from your drawn boundary
        </p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={gardenName}
          onChange={(e) => setGardenName(e.target.value)}
          placeholder="Enter garden name..."
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none'
          }}
          disabled={isSubmitting}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          style={{
            padding: '10px 20px',
            backgroundColor: canSubmit && !isSubmitting ? '#22c55e' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
        >
          {isSubmitting ? 'Creating Garden...' : '🏡 Create Garden Workspace'}
        </button>
      </div>

      {address && (
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          📍 {address}
        </div>
      )}
    </div>
  );
};
