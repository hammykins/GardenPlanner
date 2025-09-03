import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import { useGardenStore } from '../../stores/gardenStore';

interface DrawEvent extends L.LeafletEvent {
  layer: L.Layer;
  layerType: string;
}

interface EditEvent extends L.LeafletEvent {
  layers: L.LayerGroup;
}

export const BoundaryDrawing = () => {
  const map = useMap();
  const { boundary, setBoundary } = useGardenStore();
  
  // Track drawing state for debugging
  const isDrawing = useRef(false);
  const editableLayers = useRef<L.FeatureGroup | null>(null);
  
  console.log('🌟 BoundaryDrawing component mounted');

  useEffect(() => {
    // Initialize the FeatureGroup to store editable layers
    const editableLayersInstance = new L.FeatureGroup();
    editableLayers.current = editableLayersInstance;
    map.addLayer(editableLayersInstance);

    // Add a safety fallback for area measurement
    // Override the area display handler
    L.Draw.Polygon.prototype._getMeasurementString = function() {
      const area = this._area;
      if (!area && area !== 0) {
        return null;
      }
      return L.GeometryUtil.readableArea(area, true);
    };

    // Initialize draw control
    console.log('🛠️ Initializing draw control...');
    const drawControl = new L.Control.Draw({
      position: 'topleft',
      draw: {
        // Only enable polygon with minimal options
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polygon: {
          allowIntersection: false,
          showArea: false, // Disable area measurement temporarily
          shapeOptions: {
            color: '#3388ff',
            fillOpacity: 0.2,
            weight: 2
          },
          repeatMode: false
        }
      },
      edit: {
        featureGroup: editableLayersInstance,
        remove: true,
        edit: {
          selectedPathOptions: {
            color: '#3388ff',
            fillOpacity: 0.2,
            dashArray: '10, 10',
            weight: 2
          }
        }
      }
    });

    console.log('🎨 Adding draw control to map...');
    map.addControl(drawControl);
    console.log('✅ Draw control added successfully');

    // Track drawing state
    map.on('draw:drawstart', () => {
      isDrawing.current = true;
      console.log('🎯 Drawing started - Click points to draw your polygon!');
    });

    map.on('draw:drawstop', () => {
      isDrawing.current = false;
      console.log('🛑 Drawing stopped');
    });

    // Handle vertex drawing
    map.on('draw:drawvertex', (e: any) => {
      console.log('📍 Vertex added:', e);
      // If we have 3 or more points, enable manual completion
      const layers = editableLayersInstance.getLayers();
      if (layers.length > 0) {
        const layer = layers[0] as L.Polygon;
        const points = layer.getLatLngs();
        console.log('📐 Current vertex count:', points.length);
      }
    });

    map.on('draw:vertexend', (e: any) => {
      console.log('🔄 Vertex end event:', e);
    });

    // Additional event listeners for debugging
    map.on('click', (e) => {
      console.log('🖱️ Map clicked at:', e.latlng);
    });

    map.on('draw:toolbarclosed', () => {
      console.log('🔨 Drawing toolbar closed');
    });

    map.on('draw:toolbaropened', () => {
      console.log('🔨 Drawing toolbar opened');
    });

    // Handle new drawings
    map.on('draw:created', ((e: unknown) => {
      try {
        const event = e as DrawEvent;
        console.log('🎨 Draw created event type:', event.layerType);
        
        // Clear previous layers
        editableLayersInstance.clearLayers();
        
        // Add new layer
        editableLayersInstance.addLayer(event.layer);
        
        // Get coordinates from layer
        if (event.layerType === 'polygon') {
          console.log('✅ Layer confirmed as polygon');
          const layer = event.layer as L.Polygon;
          
          try {
            const latLngs = layer.getLatLngs();
            console.log('📍 Raw LatLngs:', latLngs);
            
            // Extract points from the polygon safely
            const coords = layer.getLatLngs() as L.LatLng[][];
            // Take first ring of coordinates for simple polygons
            const points = coords[0] as L.LatLng[];
            console.log('📍 Processing points:', points);
            
            const coordinates: number[][] = points.map((point: L.LatLng) => {
              return [point.lat, point.lng];
            });
            
            console.log('📍 Processed coordinates:', coordinates);
            
            if (coordinates.length > 2) {
              // Calculate area after polygon is complete
              const area = L.GeometryUtil.geodesicArea(points);
              // Convert square meters to square feet (1 sq m = 10.764 sq ft)
              const areaInSqFt = area * 10.764;
              // Convert to acres if larger than 43,560 sq ft (1 acre)
              const readableArea = areaInSqFt >= 43560 
                ? `${(areaInSqFt / 43560).toFixed(2)} acres`
                : `${areaInSqFt.toFixed(2)} sq ft`;
              
              console.log('📏 Garden area:', readableArea);
              
              setBoundary(coordinates);
              console.log('💾 Boundary saved with', coordinates.length, 'points');
              
              // Show area in a temporary div
              const areaDiv = L.DomUtil.create('div', 'area-display');
              areaDiv.innerHTML = `Garden area: ${readableArea}`;
              areaDiv.style.position = 'absolute';
              areaDiv.style.bottom = '20px';
              areaDiv.style.left = '20px';
              areaDiv.style.backgroundColor = 'white';
              areaDiv.style.padding = '10px';
              areaDiv.style.borderRadius = '4px';
              areaDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              areaDiv.style.zIndex = '1000';
              
              map.getContainer().appendChild(areaDiv);
              
              // Remove the area display after 5 seconds
              setTimeout(() => {
                areaDiv.remove();
              }, 5000);
            } else {
              console.warn('⚠️ Not enough points for a polygon:', coordinates.length);
            }
          } catch (err) {
            console.error('🚨 Error processing polygon points:', err);
          }
        } else {
          console.warn('⚠️ Unexpected layer type:', event.layerType);
        }
      } catch (err) {
        console.error('🚨 Error handling draw:created event:', err);
      }
    }));

    // Handle edited shapes
    map.on('draw:edited', ((e: unknown) => {
      const event = e as EditEvent;
      event.layers.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          // Extract points from the polygon safely
          const coords = layer.getLatLngs() as L.LatLng[][];
          // Take first ring of coordinates for simple polygons
          const points = coords[0] as L.LatLng[];

          const coordinates = points.map((point: L.LatLng) => [point.lat, point.lng]);
          setBoundary(coordinates);

          // Recalculate and show area after edit
          const area = L.GeometryUtil.geodesicArea(points);
          const areaInSqFt = area * 10.764;
          const readableArea = areaInSqFt >= 43560 
            ? `${(areaInSqFt / 43560).toFixed(2)} acres`
            : `${areaInSqFt.toFixed(2)} sq ft`;
          
          // Show updated area
          const areaDiv = L.DomUtil.create('div', 'area-display');
          areaDiv.innerHTML = `Updated garden area: ${readableArea}`;
          areaDiv.style.position = 'absolute';
          areaDiv.style.bottom = '20px';
          areaDiv.style.left = '20px';
          areaDiv.style.backgroundColor = 'white';
          areaDiv.style.padding = '10px';
          areaDiv.style.borderRadius = '4px';
          areaDiv.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          areaDiv.style.zIndex = '1000';
          
          map.getContainer().appendChild(areaDiv);
          
          // Remove the area display after 5 seconds
          setTimeout(() => {
            areaDiv.remove();
          }, 5000);
        }
      });
    }));

    // Handle deleted shapes
    map.on('draw:deleted', () => {
      setBoundary([]);
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(editableLayersInstance);
      map.off('draw:created');
      map.off('draw:edited');
      map.off('draw:deleted');
      map.off('draw:drawstart');
      map.off('draw:drawstop');
    };
  }, [map, setBoundary]);

  // Effect to clear layers when boundary is reset in store
  useEffect(() => {
    if (!boundary && editableLayers.current) {
      console.log('🗑️ Clearing boundary layers due to store reset');
      editableLayers.current.clearLayers();
    }
  }, [boundary]);

  return null;
};
