import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import type { Feature } from '../../api/features.api';
import { createFeature, updateFeature, deleteFeature, fetchFeatures } from '../../api/features.api';
import { FeatureNameModal } from './FeatureNameModal';
import { AddressSearch } from './AddressSearch';

// Set Mapbox access token - following official docs pattern
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.your_mapbox_token_here';

interface MapboxGardenPlannerProps {
  gardenId: number;
  onFeaturesChange: (features: Feature[]) => void;
}

// Usage tracking with alerts
const trackMapboxUsage = () => {
  const today = new Date().toDateString();
  const lastCheck = localStorage.getItem('mapbox-usage-check');
  
  if (lastCheck !== today) {
    // Reset daily counter
    localStorage.setItem('mapbox-daily-loads', '1');
    localStorage.setItem('mapbox-usage-check', today);
    console.log('📊 Mapbox Daily Usage: 1/50,000 loads (reset for new day)');
  } else {
    const currentCount = parseInt(localStorage.getItem('mapbox-daily-loads') || '0');
    const newCount = currentCount + 1;
    
    localStorage.setItem('mapbox-daily-loads', newCount.toString());
    
    // Progressive alerts
    if (newCount === 25000) { // 50% of free limit
      console.warn('🚨 Mapbox Usage Alert: 50% of daily limit reached (25,000/50,000)');
    } else if (newCount === 37500) { // 75% of free limit
      console.warn('🚨 Mapbox Usage Alert: 75% of daily limit reached (37,500/50,000)');
    } else if (newCount === 45000) { // 90% of free limit
      console.error('🚨 MAPBOX USAGE CRITICAL: 90% of daily limit reached (45,000/50,000)');
      alert('⚠️ Mapbox Usage Warning: You\'ve used 90% of your daily free limit!');
    }
    
    console.log(`📊 Mapbox Daily Usage: ${newCount}/50,000 loads`);
  }
};

export const MapboxGardenPlanner: React.FC<MapboxGardenPlannerProps> = ({ 
  gardenId, 
  onFeaturesChange 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingGeometry, setPendingGeometry] = useState<any>(null);

  // Initialize map following official Mapbox GL JS docs
  useEffect(() => {
    if (map.current) return; // Prevent multiple initializations
    
    // Track usage for monitoring
    trackMapboxUsage();

    console.log('🗺️ Initializing Mapbox GL JS map...');
    console.log('🗺️ Access token:', mapboxgl.accessToken ? 'Present' : 'Missing');

    if (!mapContainer.current) {
      console.error('🗺️ Map container not found');
      return;
    }

    // Create map instance with USGS National Map imagery (free)
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        "version": 8,
        "sources": {
          "usgs-imagery-topo": {
            "type": "raster",
            "tiles": [
              "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}"
            ],
            "tileSize": 256,
            "attribution": "© USGS National Map"
          }
        },
        "layers": [
          {
            "id": "usgs-imagery-topo",
            "type": "raster",
            "source": "usgs-imagery-topo",
            "minzoom": 0,
            "maxzoom": 22
          }
        ]
      },
      center: [-74.5, 40], // Starting position [lng, lat]
      zoom: 15 // Starting zoom
    });

    // Wait for map to load before adding controls
    map.current.on('load', () => {
      console.log('🗺️ Map loaded successfully');
      
      // Initialize drawing tools after map loads
      if (map.current) {
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true
          },
          defaultMode: 'simple_select'  // Start in select mode, not drawing mode
        });

        map.current.addControl(draw.current);
        console.log('🗺️ Drawing controls added');

        // Add event handlers
        map.current.on('draw.create', handleDrawCreate);
        map.current.on('draw.update', handleDrawUpdate);  
        map.current.on('draw.delete', handleDrawDelete);

        // Load existing features
        loadFeatures();
      }
    });

    map.current.on('error', (e) => {
      console.error('🗺️ Mapbox error:', e.error);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const loadFeatures = async () => {
    try {
      const loadedFeatures = await fetchFeatures(gardenId);
      console.log('Raw features from API:', loadedFeatures); // Debug log
      
      // Ensure we have an array
      const featuresArray = Array.isArray(loadedFeatures) ? loadedFeatures : [];
      setFeatures(featuresArray);
      
      // Clear existing features from draw control
      if (draw.current) {
        draw.current.deleteAll();
      }
      
      // Add features to map with enhanced styling and interaction
      if (draw.current && featuresArray.length > 0) {
        featuresArray.forEach(feature => {
          try {
            const geometry = JSON.parse(feature.boundary);
            const mapFeature = {
              type: 'Feature' as const,
              geometry,
              properties: {
                id: feature.id,
                name: feature.name,
                color: feature.color,
                user_feature: true // Mark as user feature for styling
              }
            };
            draw.current?.add(mapFeature);
          } catch (parseError) {
            console.error('Error parsing feature boundary:', parseError, feature);
          }
        });
      }
      
      // Add hover and click interactions for existing features
      setupFeatureInteractions();
      
    } catch (error) {
      console.error('Failed to load features:', error);
      setFeatures([]);
    }
  };

  const setupFeatureInteractions = () => {
    if (!map.current) return;

    // Create popup for feature interactions
    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      className: 'feature-popup'
    });

    // Using proper Mapbox API patterns for Draw feature interaction
    // Note: Mapbox Draw uses specific layer names we need to target
    
    // Mouse enter event for polygon fills (using official Draw layer names)
    map.current.on('mouseenter', 'gl-draw-polygon-fill-inactive.cold', (e) => {
      handleFeatureHover(e, popup, true);
    });

    map.current.on('mouseenter', 'gl-draw-polygon-fill-inactive.hot', (e) => {
      handleFeatureHover(e, popup, true);
    });

    // Mouse leave events
    map.current.on('mouseleave', 'gl-draw-polygon-fill-inactive.cold', () => {
      handleFeatureHover(null, popup, false);
    });

    map.current.on('mouseleave', 'gl-draw-polygon-fill-inactive.hot', () => {
      handleFeatureHover(null, popup, false);
    });

    // Click events for additional interaction
    map.current.on('click', 'gl-draw-polygon-fill-inactive.cold', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        if (feature.properties?.user_feature) {
          console.log(`🎯 Clicked feature: ${feature.properties.name}`);
        }
      }
    });
  };

  const handleFeatureHover = (e: any, popup: mapboxgl.Popup, isEntering: boolean) => {
    if (!map.current) return;

    if (isEntering && e?.features && e.features[0]) {
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (properties?.user_feature) {
        map.current.getCanvas().style.cursor = 'pointer';
        
        // Enhanced popup with better styling using Mapbox best practices
        popup.setLngLat(e.lngLat)
          .setHTML(`
            <div style="
              padding: 16px; 
              min-width: 180px; 
              font-family: 'Helvetica Neue', Arial, sans-serif;
              background: white;
              border-radius: 8px;
            ">
              <div style="
                display: flex; 
                align-items: center; 
                gap: 10px; 
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e2e8f0;
              ">
                <div style="
                  width: 16px; 
                  height: 16px; 
                  background: ${properties.color}; 
                  border-radius: 3px;
                  border: 1px solid rgba(0,0,0,0.1);
                "></div>
                <strong style="
                  color: #2d3748; 
                  font-size: 15px; 
                  font-weight: 600;
                ">${properties.name}</strong>
              </div>
              
              <button 
                onclick="window.deleteFeature(${properties.id})"
                style="
                  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 13px;
                  font-weight: 500;
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  width: 100%;
                  justify-content: center;
                  transition: all 0.2s ease;
                  box-shadow: 0 2px 4px rgba(229, 62, 62, 0.2);
                "
                onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(229, 62, 62, 0.3)'"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(229, 62, 62, 0.2)'"
              >
                🗑️ Delete Feature
              </button>
              
              <div style="
                font-size: 11px; 
                color: #718096; 
                margin-top: 8px; 
                text-align: center;
                font-style: italic;
              ">
                Click to permanently remove
              </div>
            </div>
          `)
          .addTo(map.current);
      }
    } else {
      // Mouse leave or no feature
      map.current.getCanvas().style.cursor = '';
      popup.remove();
    }
  };

  // Global function for popup delete button
  const handleFeatureDelete = async (featureId: number) => {
    // Find the feature name for confirmation
    const feature = features.find(f => f.id === featureId);
    const featureName = feature ? feature.name : 'this feature';
    
    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete "${featureName}"? This action cannot be undone.`)) {
      try {
        await deleteFeature(featureId);
        loadFeatures(); // Reload to update the map
        console.log(`🗑️ Deleted feature: ${featureName} (ID: ${featureId})`);
      } catch (error) {
        console.error('Failed to delete feature:', error);
        alert('Failed to delete feature. Please try again.');
      }
    }
  };

  // Expose delete function globally for popup buttons
  useEffect(() => {
    (window as any).deleteFeature = handleFeatureDelete;
    return () => {
      delete (window as any).deleteFeature;
    };
  }, []);

  const handleDrawCreate = (e: any) => {
    const feature = e.features[0];
    setPendingGeometry(feature.geometry);
    setShowModal(true);
  };

  const handleDrawUpdate = async (e: any) => {
    // Handle feature editing
    for (const feature of e.features) {
      const existingFeature = features.find(f => f.id === parseInt(feature.properties.id));
      if (existingFeature) {
        try {
          await updateFeature(existingFeature.id, {
            name: existingFeature.name,
            color: existingFeature.color,
            boundary: JSON.stringify(feature.geometry),
            garden_id: gardenId
          });
        } catch (error) {
          console.error('Failed to update feature:', error);
        }
      }
    }
    loadFeatures();
  };

  const handleDrawDelete = async (e: any) => {
    // Handle feature deletion
    for (const feature of e.features) {
      const featureId = parseInt(feature.properties.id);
      if (featureId) {
        try {
          await deleteFeature(featureId);
        } catch (error) {
          console.error('Failed to delete feature:', error);
        }
      }
    }
    loadFeatures();
  };

  const handleModalSubmit = async (name: string, color: string) => {
    if (!pendingGeometry) return;

    try {
      await createFeature({
        name,
        color,
        boundary: JSON.stringify(pendingGeometry),
        garden_id: gardenId
      });
      setShowModal(false);
      setPendingGeometry(null);
      loadFeatures();
    } catch (error) {
      console.error('Failed to create feature:', error);
    }
  };

  const handleModalCancel = () => {
    // Remove the drawn feature if user cancels naming
    if (draw.current) {
      const drawnFeatures = draw.current.getAll();
      const lastFeature = drawnFeatures.features[drawnFeatures.features.length - 1];
      if (lastFeature && !lastFeature.properties?.id && lastFeature.id) {
        draw.current.delete(lastFeature.id as string);
      }
    }
    setShowModal(false);
    setPendingGeometry(null);
  };

  const handleAddressSelect = (address: string, lat: number, lng: number) => {
    if (map.current) {
      // Fly to the selected location
      map.current.flyTo({
        center: [lng, lat],
        zoom: 18,
        duration: 2000
      });
      console.log(`🎯 Flying to: ${address} (${lat}, ${lng})`);
    }
  };

  // Expose features to parent component
  useEffect(() => {
    onFeaturesChange(features);
  }, [features, onFeaturesChange]);

  return (
    <div>
      {/* Custom styles for feature interactions - following Mapbox design patterns */}
      <style>{`
        .feature-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          background: white;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          overflow: hidden;
        }
        
        .feature-popup .mapboxgl-popup-tip {
          border-top-color: #e2e8f0;
        }
        
        .feature-popup .mapboxgl-popup-close-button {
          color: #718096;
          font-size: 16px;
          width: 20px;
          height: 20px;
          line-height: 20px;
          text-align: center;
          right: 8px;
          top: 8px;
        }
        
        .feature-popup .mapboxgl-popup-close-button:hover {
          background: #f7fafc;
          color: #2d3748;
        }
        
        /* Enhanced hover effects for map features */
        .mapboxgl-canvas {
          cursor: default;
        }
        
        /* Custom animation for popup appearance */
        .feature-popup .mapboxgl-popup-content {
          animation: popupSlideIn 0.2s ease-out;
        }
        
        @keyframes popupSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      
      {/* Address Search */}
      <AddressSearch onAddressSelect={handleAddressSelect} />
      
      {/* Map Container - following official Mapbox GL JS docs */}
      <div
        ref={mapContainer}
        style={{ 
          width: '100%', 
          height: '600px'
        }}
      />
      
      {/* Status Display */}
      <div style={{
        padding: '10px',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        marginTop: '10px'
      }}>
        <strong>🗺️ Garden Planner Status:</strong>
        <div>🔧 Mapbox: {mapboxgl.accessToken ? '✅ Drawing Tools Active' : '❌ Missing Token'}</div>
        <div>🛰️ Imagery: ✅ USGS National Map (Free)</div>
        <div>📊 Features: {features.length}</div>
        <div>💡 Usage: Only drawing tools count toward Mapbox limits</div>
        <div>📐 Instructions: Use the polygon tool to draw boundaries</div>
      </div>
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div>
          <strong>Garden Planner</strong>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Draw boundaries for your yard features
        </div>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
          Features: {features.length}
        </div>
      </div>

      {/* Feature Name Modal */}
      {showModal && (
        <FeatureNameModal
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
};

export default MapboxGardenPlanner;
