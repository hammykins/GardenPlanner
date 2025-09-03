import { useEffect, useState } from 'react';
import { gardenService } from '../services/garden.service';
import type { Garden, GridSystem } from '../types/garden';

export const useGardenData = (gardenId: number) => {
  const [garden, setGarden] = useState<Garden | null>(null);
  const [gridSystem, setGridSystem] = useState<GridSystem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGardenData = async () => {
    try {
      setLoading(true);
      const [gardenData, gridData] = await Promise.all([
        gardenService.getGarden(gardenId),
        gardenService.getGardenGrid(gardenId, 2)
      ]);
      
      setGarden(gardenData);
      setGridSystem(gridData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch garden data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGardenData();
  }, [gardenId]);

  return { garden, gridSystem, loading, error, refresh: fetchGardenData };
};
