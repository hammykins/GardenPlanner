import type { Garden, GridSystem } from '../types/garden';

export const mockGarden: Garden = {
  id: 1,
  name: "Demo Garden",
  boundary: {
    type: "Polygon",
    coordinates: [[
      [-71.106167, 42.373095],
      [-71.106067, 42.373095],
      [-71.106067, 42.373195],
      [-71.106167, 42.373195],
      [-71.106167, 42.373095]
    ]]
  },
  soil_type: "Loam",
  climate_zone: "6b"
};

export const mockGridSystem: GridSystem = {
  grid_cells: Array(16).fill(null).map((_, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    const cellSize = 0.000025; // roughly 2 feet at this latitude
    
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-71.106167 + (col * cellSize), 42.373095 + (row * cellSize)],
          [-71.106167 + ((col + 1) * cellSize), 42.373095 + (row * cellSize)],
          [-71.106167 + ((col + 1) * cellSize), 42.373095 + ((row + 1) * cellSize)],
          [-71.106167 + (col * cellSize), 42.373095 + ((row + 1) * cellSize)],
          [-71.106167 + (col * cellSize), 42.373095 + (row * cellSize)]
        ]]
      }
    };
  }),
  cell_size_feet: 2,
  total_cells: 16,
  dimensions: {
    width_feet: 8,
    height_feet: 8
  }
};
