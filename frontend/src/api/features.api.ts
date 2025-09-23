import axios from 'axios';

export interface Feature {
  id: number;
  name: string;
  boundary: string; // GeoJSON string
  color: string;
  garden_id: number;
  user_id: number;
  created_at: string;
}

export interface FeatureCreate {
  name: string;
  boundary: string;
  color: string;
  garden_id: number;
  user_id: number;
}

const API_URL = '/api/features/';

export async function fetchFeatures(garden_id: number): Promise<Feature[]> {
  const res = await axios.get(API_URL, { params: { garden_id } });
  return res.data;
}

export async function createFeature(data: FeatureCreate): Promise<Feature> {
  const res = await axios.post(API_URL, data);
  return res.data;
}

export async function updateFeature(id: number, data: FeatureCreate): Promise<Feature> {
  const res = await axios.put(`${API_URL}${id}`, data);
  return res.data;
}

export async function deleteFeature(id: number): Promise<void> {
  await axios.delete(`${API_URL}${id}`);
}
