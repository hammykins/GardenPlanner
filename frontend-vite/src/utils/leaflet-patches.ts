import L from 'leaflet';

// Patch the _flat deprecation
if (L.Polyline) {
  L.Polyline._flat = L.LineUtil.isFlat;
}
