import type { Garden, GridSystem } from '../types/garden';
import type { GardenBoundary, Plant } from '../types/garden';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const gardenService = {
  async getGarden(id: number): Promise<Garden> {
    const response = await fetch(`${API_BASE}/gardens/${id}`);
    if (!response.ok) throw new Error('Failed to fetch garden');
    return response.json();
  },

  async updateGardenBoundary(id: number, boundary: GardenBoundary): Promise<Garden> {
    const response = await fetch(`${API_BASE}/gardens/${id}/boundary`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ boundary }),
    });
    if (!response.ok) throw new Error('Failed to update garden boundary');
    return response.json();
  },

  async getGardenGrid(id: number, gridSize: number): Promise<GridSystem> {
    const response = await fetch(`${API_BASE}/gardens/${id}/grid?size=${gridSize}`);
    if (!response.ok) throw new Error('Failed to fetch garden grid');
    return response.json();
  },

  async getPlants(gardenId: number): Promise<Plant[]> {
    const response = await fetch(`${API_BASE}/gardens/${gardenId}/plants`);
    if (!response.ok) throw new Error('Failed to fetch plants');
    return response.json();
  },

  async addPlant(gardenId: number, plantData: Omit<Plant, 'id'>): Promise<Plant> {
    const response = await fetch(`${API_BASE}/gardens/${gardenId}/plants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantData),
    });
    if (!response.ok) throw new Error('Failed to add plant');
    return response.json();
  },

  async removePlant(gardenId: number, plantId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/gardens/${gardenId}/plants/${plantId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove plant');
  }
};
