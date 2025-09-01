import type { Garden, GridSystem } from '../types/garden';
import apiClient from './apiClient';
import API_ENDPOINTS from './endpoints';

export class GardenAPI {
  static async getAllGardens(): Promise<Garden[]> {
    const response = await apiClient.get(API_ENDPOINTS.GARDENS);
    return response.data;
  }

  static async getGarden(id: number): Promise<Garden> {
    const response = await apiClient.get(API_ENDPOINTS.GARDEN_BY_ID(id));
    return response.data;
  }

  static async createGarden(data: Omit<Garden, 'id'>): Promise<Garden> {
    const response = await apiClient.post(API_ENDPOINTS.GARDENS, data);
    return response.data;
  }

  static async updateGarden(id: number, data: Partial<Garden>): Promise<Garden> {
    const response = await apiClient.patch(API_ENDPOINTS.GARDEN_BY_ID(id), data);
    return response.data;
  }

  static async deleteGarden(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.GARDEN_BY_ID(id));
  }

  static async getGardenSatellite(id: number) {
    const response = await apiClient.get(API_ENDPOINTS.GARDEN_SATELLITE(id));
    return response.data;
  }

  static async getGardenGrid(id: number, gridSize: number): Promise<GridSystem> {
    const response = await apiClient.get(API_ENDPOINTS.GARDEN_GRID(id), {
      params: { grid_size: gridSize }
    });
    return response.data;
  }
}
