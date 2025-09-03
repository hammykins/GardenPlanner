export interface Garden {
  id: number;
  name: string;
  boundary: GeoJSON.Polygon;
  elevation?: number;
  soil_type?: string;
  climate_zone?: string;
}

export interface Zone {
  id: number;
  garden_id: number;
  name: string;
  boundary: GeoJSON.Polygon;
  sun_exposure: number;
  soil_ph?: number;
  soil_moisture?: number;
}

export interface Plant {
  id: number;
  garden_id: number;
  zone_id: number;
  species_id: number;
  location: GeoJSON.Point;
  planted_date: string;
  current_height?: number;
  current_spread?: number;
  health_status?: string;
}

export interface GridCell {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface GridSystem {
  grid_cells: GridCell[];
  cell_size_feet: number;
  total_cells: number;
  dimensions: {
    width_feet: number;
    height_feet: number;
  };
}
