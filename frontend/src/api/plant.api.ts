import type { Plant } from '../types/garden';
import apiClient from './apiClient';
import API_ENDPOINTS from './endpoints';

export class PlantAPI {
  static async getPlants(gardenId: number): Promise<Plant[]> {
    const response = await apiClient.get(API_ENDPOINTS.PLANTS(gardenId));
    return response.data;
  }

  static async getPlant(gardenId: number, plantId: number): Promise<Plant> {
    const response = await apiClient.get(API_ENDPOINTS.PLANT_BY_ID(gardenId, plantId));
    return response.data;
  }

  static async createPlant(gardenId: number, data: Omit<Plant, 'id' | 'garden_id'>): Promise<Plant> {
    const response = await apiClient.post(API_ENDPOINTS.PLANTS(gardenId), data);
    return response.data;
  }

  static async updatePlant(gardenId: number, plantId: number, data: Partial<Plant>): Promise<Plant> {
    const response = await apiClient.patch(API_ENDPOINTS.PLANT_BY_ID(gardenId, plantId), data);
    return response.data;
  }

  static async deletePlant(gardenId: number, plantId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PLANT_BY_ID(gardenId, plantId));
  }
}
