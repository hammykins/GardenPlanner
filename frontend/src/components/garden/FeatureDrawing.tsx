import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import type { Feature } from '../../api/features.api';
import { createFeature, updateFeature, deleteFeature, fetchFeatures } from '../../api/features.api';
import { FeatureNameModal } from './FeatureNameModal';

interface FeatureDrawingProps {
  gardenId: number;
  userId: number;
  onFeaturesChange: (features: Feature[]) => void;
  selectedId?: number;
  setSelectedId?: (id: number | null) => void;
}

export const FeatureDrawing: React.FC<FeatureDrawingProps> = ({ 
  gardenId, 
  userId, 
  onFeaturesChange, 
  setSelectedId 
}) => {
  const map = useMap();
  const [showModal, setShowModal] = useState(false);
  const [drawnBoundary, setDrawnBoundary] = useState<number[][] | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const editableLayers = useRef<L.FeatureGroup | null>(null);

  // Load features from backend
  useEffect(() => {
    fetchFeatures(gardenId)
      .then((loadedFeatures) => {
        setFeatures(loadedFeatures || []);
      })
      .catch(err => {
        console.error('Failed to load features:', err);
        setFeatures([]);
      });
  }, [gardenId]);

  // Expose features to parent
  useEffect(() => {
    onFeaturesChange(features);
  }, [features, onFeaturesChange]);

  // Add drawn features to map
  useEffect(() => {
    if (!map) return;
    if (!editableLayers.current) {
      editableLayers.current = new L.FeatureGroup();
      map.addLayer(editableLayers.current);
    }
    editableLayers.current.clearLayers();
    
    if (Array.isArray(features)) {
      features.forEach(f => {
        try {
          const geo = JSON.parse(f.boundary);
          const layer = L.geoJSON(geo, {
            style: { 
              color: f.color, 
              fillOpacity: 0.3, 
              weight: 2 
            }
          });
          layer.on('click', () => setSelectedId && setSelectedId(f.id));
          editableLayers.current!.addLayer(layer);
        } catch (err) {
          console.error('Error parsing feature boundary:', err);
        }
      });
    }
  }, [features, map, setSelectedId]);

  // Drawing logic
  useEffect(() => {
    if (!map || !editableLayers.current) return;
    
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
          showArea: false, 
          shapeOptions: { 
            color: '#3388ff', 
            fillOpacity: 0.2, 
            weight: 2 
          } 
        }
      },
      edit: {
        featureGroup: editableLayers.current,
        remove: true
      }
    });
    
    map.addControl(drawControl);
    
    // Draw created
    const handleDrawCreated = (e: any) => {
      const layer = e.layer as L.Polygon;
      const geojson = layer.toGeoJSON();
      const coords = geojson.geometry.coordinates[0];
      setDrawnBoundary(coords.map((coord: any) => [coord[1], coord[0]]));
      setShowModal(true);
    };

    // Edit
    const handleDrawEdited = async (e: any) => {
      for (const layer of e.layers.getLayers()) {
        const geojson = layer.toGeoJSON();
        const feature = features.find(f => {
          try {
            const fGeo = JSON.parse(f.boundary);
            return JSON.stringify(fGeo.coordinates) === JSON.stringify(geojson.geometry.coordinates);
          } catch {
            return false;
          }
        });
        
        if (feature) {
          await updateFeature(feature.id, {
            name: feature.name,
            color: feature.color,
            boundary: JSON.stringify(geojson.geometry),
            garden_id: gardenId,
            user_id: userId
          });
        }
      }
      fetchFeatures(gardenId).then(setFeatures);
    };

    // Delete
    const handleDrawDeleted = async (e: any) => {
      for (const layer of e.layers.getLayers()) {
        const geojson = layer.toGeoJSON();
        const feature = features.find(f => {
          try {
            const fGeo = JSON.parse(f.boundary);
            return JSON.stringify(fGeo.coordinates) === JSON.stringify(geojson.geometry.coordinates);
          } catch {
            return false;
          }
        });
        
        if (feature) {
          await deleteFeature(feature.id);
        }
      }
      fetchFeatures(gardenId).then(setFeatures);
    };
    
    map.on('draw:created', handleDrawCreated);
    map.on('draw:edited', handleDrawEdited);
    map.on('draw:deleted', handleDrawDeleted);
    
    return () => {
      map.removeControl(drawControl);
      map.off('draw:created', handleDrawCreated);
      map.off('draw:edited', handleDrawEdited);
      map.off('draw:deleted', handleDrawDeleted);
    };
  }, [map, features, gardenId, userId]);

  // Handle modal submit
  const handleModalSubmit = async (name: string, color: string) => {
    if (!drawnBoundary) return;
    
    // Convert to GeoJSON
    const geojson = {
      type: 'Polygon',
      coordinates: [drawnBoundary.map(([lat, lng]) => [lng, lat])]
    };
    
    try {
      await createFeature({
        name,
        color,
        boundary: JSON.stringify(geojson),
        garden_id: gardenId,
        user_id: userId
      });
      setShowModal(false);
      setDrawnBoundary(null);
      fetchFeatures(gardenId).then(setFeatures);
    } catch (err) {
      console.error('Failed to create feature:', err);
    }
  };

  return (
    <>
      {showModal && (
        <FeatureNameModal
          onSubmit={handleModalSubmit}
          onCancel={() => { 
            setShowModal(false); 
            setDrawnBoundary(null); 
          }}
        />
      )}
    </>
  );
};

export default FeatureDrawing;
