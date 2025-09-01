export interface PlantType {
  id: string;
  name: string;
  category: 'Vegetable' | 'Herb' | 'Fruit' | 'Flower';
  spacing: number; // in feet
  color?: string;
}

export const mockPlantTypes: PlantType[] = [
  { id: 'tomato', name: 'Tomato', category: 'Vegetable', spacing: 2 },
  { id: 'pepper', name: 'Bell Pepper', category: 'Vegetable', spacing: 1 },
  { id: 'lettuce', name: 'Lettuce', category: 'Vegetable', spacing: 0.5 },
  { id: 'carrot', name: 'Carrot', category: 'Vegetable', spacing: 0.25 },
  { id: 'basil', name: 'Basil', category: 'Herb', spacing: 0.5 },
  { id: 'mint', name: 'Mint', category: 'Herb', spacing: 1 },
  { id: 'strawberry', name: 'Strawberry', category: 'Fruit', spacing: 1 },
  { id: 'marigold', name: 'Marigold', category: 'Flower', spacing: 0.5 },
  { id: 'zucchini', name: 'Zucchini', category: 'Vegetable', spacing: 3 },
  { id: 'cucumber', name: 'Cucumber', category: 'Vegetable', spacing: 2 },
  { id: 'peas', name: 'Garden Peas', category: 'Vegetable', spacing: 0.5 },
  { id: 'beans', name: 'Green Beans', category: 'Vegetable', spacing: 0.5 },
  { id: 'thyme', name: 'Thyme', category: 'Herb', spacing: 0.5 },
  { id: 'rosemary', name: 'Rosemary', category: 'Herb', spacing: 1 },
  { id: 'sunflower', name: 'Sunflower', category: 'Flower', spacing: 1 }
];
