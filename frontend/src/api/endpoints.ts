const API_ENDPOINTS = {
  // Garden endpoints
  GARDENS: '/gardens',
  GARDEN_BY_ID: (id: number) => `/gardens/${id}`,
  GARDEN_SATELLITE: (id: number) => `/gardens/${id}/satellite`,
  GARDEN_GRID: (id: number) => `/gardens/${id}/grid`,
  
  // Zone endpoints
  ZONES: (gardenId: number) => `/gardens/${gardenId}/zones`,
  ZONE_BY_ID: (gardenId: number, zoneId: number) => `/gardens/${gardenId}/zones/${zoneId}`,
  
  // Plant endpoints
  PLANTS: (gardenId: number) => `/gardens/${gardenId}/plants`,
  PLANT_BY_ID: (gardenId: number, plantId: number) => `/gardens/${gardenId}/plants/${plantId}`,
  
  // Weather endpoints
  WEATHER: (gardenId: number) => `/gardens/${gardenId}/weather`,
  
  // Grid endpoints
  GRID_CELL: (gardenId: number, cellId: number) => `/gardens/${gardenId}/grid/${cellId}`
} as const;

export default API_ENDPOINTS;
