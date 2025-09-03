import type { Zone } from '../types/garden';
import apiClient from './apiClient';
import API_ENDPOINTS from './endpoints';

export class ZoneAPI {
  static async getZones(gardenId: number): Promise<Zone[]> {
    const response = await apiClient.get(API_ENDPOINTS.ZONES(gardenId));
    return response.data;
  }

  static async getZone(gardenId: number, zoneId: number): Promise<Zone> {
    const response = await apiClient.get(API_ENDPOINTS.ZONE_BY_ID(gardenId, zoneId));
    return response.data;
  }

  static async createZone(gardenId: number, data: Omit<Zone, 'id' | 'garden_id'>): Promise<Zone> {
    const response = await apiClient.post(API_ENDPOINTS.ZONES(gardenId), data);
    return response.data;
  }

  static async updateZone(gardenId: number, zoneId: number, data: Partial<Zone>): Promise<Zone> {
    const response = await apiClient.patch(API_ENDPOINTS.ZONE_BY_ID(gardenId, zoneId), data);
    return response.data;
  }

  static async deleteZone(gardenId: number, zoneId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ZONE_BY_ID(gardenId, zoneId));
  }
}
