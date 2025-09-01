export { default as apiClient } from './apiClient';
export { default as API_ENDPOINTS } from './endpoints';
export { GardenAPI } from './garden.api';
export { ZoneAPI } from './zone.api';
export { PlantAPI } from './plant.api';
export { handleAPIError, APIError } from './errors';

// Re-export types
export type { Garden, Zone, Plant, GridSystem } from '../types/garden';
