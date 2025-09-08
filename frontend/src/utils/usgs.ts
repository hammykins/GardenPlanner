// Utility to build USGS National Map WMS satellite image URL
export function getUSGSSatelliteUrl(bbox: {minLat: number, minLng: number, maxLat: number, maxLng: number}, width = 500, height = 500) {
  return `https://basemap.nationalmap.gov/arcgis/services/USGSImageryOnly/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=0&STYLES=&FORMAT=image/jpeg&CRS=EPSG:4326&BBOX=${bbox.minLat},${bbox.minLng},${bbox.maxLat},${bbox.maxLng}&WIDTH=${width}&HEIGHT=${height}`;
}
