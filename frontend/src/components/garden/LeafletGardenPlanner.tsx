import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import type { Feature } from '../../api/features.api';
import { createFeature, updateFeature, deleteFeature, fetchFeatures } from '../../api/features.api';
import { FeatureNameModal } from './FeatureNameModal';

// Fix Leaflet default markers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface LeafletGardenPlannerProps {
  gardenId: number;
  userId: number;
  onFeaturesChange: (features: Feature[]) => void;
}

export const LeafletGardenPlanner: React.FC<LeafletGardenPlannerProps> = ({ 
  gardenId, 
  userId, 
  onFeaturesChange 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const drawnItems = useRef<L.FeatureGroup | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingLayer, setPendingLayer] = useState<L.Layer | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Create map with multiple tile layer options
    map.current = L.map(mapContainer.current).setView([40.7128, -74.0060], 18);

    // Add satellite imagery (completely free)
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    // Add default layer
    satelliteLayer.addTo(map.current);

    // Layer control to switch between satellite and street view
    L.control.layers({
      'Satellite': satelliteLayer,
      'Street Map': streetLayer
    }).addTo(map.current);

    // Initialize drawing
    drawnItems.current = new L.FeatureGroup();
    map.current.addLayer(drawnItems.current);

    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#3388ff',
            fillOpacity: 0.3,
            weight: 3
          }
        }
      },
      edit: {
        featureGroup: drawnItems.current,
        remove: true
      }
    });

    map.current.addControl(drawControl);

    // Event handlers
    map.current.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.current.on(L.Draw.Event.EDITED, handleDrawEdited);
    map.current.on(L.Draw.Event.DELETED, handleDrawDeleted);

    // Load existing features
    loadFeatures();

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const loadFeatures = async () => {
    try {
      const loadedFeatures = await fetchFeatures(gardenId);
      setFeatures(loadedFeatures || []);
      
      // Clear existing layers
      if (drawnItems.current) {
        drawnItems.current.clearLayers();
      }
      
      // Add features to map
      if (loadedFeatures && drawnItems.current) {
        loadedFeatures.forEach(feature => {
          try {
            const geometry = JSON.parse(feature.boundary);
            const layer = L.geoJSON(geometry, {
              style: {
                color: feature.color,
                fillColor: feature.color,
                fillOpacity: 0.3,
                weight: 3
              }
            });
            
            // Add feature properties
            layer.feature = {
              type: 'Feature',
              properties: {
                id: feature.id,
                name: feature.name,
                color: feature.color
              },
              geometry
            };
            
            // Add popup with feature name
            layer.bindPopup(`<strong>${feature.name}</strong>`);
            
            drawnItems.current!.addLayer(layer);
          } catch (error) {
            console.error('Error loading feature:', error);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load features:', error);
      setFeatures([]);
    }
  };

  const handleDrawCreated = (e: any) => {
    const layer = e.layer;
    setPendingLayer(layer);
    setShowModal(true);
  };

  const handleDrawEdited = async (e: any) => {
    const layers = e.layers;
    layers.eachLayer(async (layer: any) => {
      if (layer.feature && layer.feature.properties.id) {
        const geojson = layer.toGeoJSON();
        try {
          await updateFeature(layer.feature.properties.id, {
            name: layer.feature.properties.name,
            color: layer.feature.properties.color,
            boundary: JSON.stringify(geojson.geometry),
            garden_id: gardenId,
            user_id: userId
          });
        } catch (error) {
          console.error('Failed to update feature:', error);
        }
      }
    });
    loadFeatures();
  };

  const handleDrawDeleted = async (e: any) => {
    const layers = e.layers;
    layers.eachLayer(async (layer: any) => {
      if (layer.feature && layer.feature.properties.id) {
        try {
          await deleteFeature(layer.feature.properties.id);
        } catch (error) {
          console.error('Failed to delete feature:', error);
        }
      }
    });
    loadFeatures();
  };

  const handleModalSubmit = async (name: string, color: string) => {
    if (!pendingLayer || !drawnItems.current) return;

    const geojson = (pendingLayer as any).toGeoJSON();

    try {
      await createFeature({
        name,
        color,
        boundary: JSON.stringify(geojson.geometry),
        garden_id: gardenId,
        user_id: userId
      });
      
      // Add to map temporarily (will be replaced by loadFeatures)
      drawnItems.current.addLayer(pendingLayer);
      
      setShowModal(false);
      setPendingLayer(null);
      loadFeatures();
    } catch (error) {
      console.error('Failed to create feature:', error);
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setPendingLayer(null);
  };

  // Expose features to parent component
  useEffect(() => {
    onFeaturesChange(features);
  }, [features, onFeaturesChange]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <div>
          <strong>🌱 Garden Planner</strong>
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          100% Free - No API Keys Required
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

export default LeafletGardenPlanner;
