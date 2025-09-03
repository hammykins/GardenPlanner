import React, { useState } from 'react';
import type { PlantType } from '../../mocks/plantTypes';
import { mockPlantTypes } from '../../mocks/plantTypes';
import './PlantSelector.css';

interface PlantSelectorProps {
  onPlantSelect: (plant: PlantType, color: string) => void;
}

export const PlantSelector: React.FC<PlantSelectorProps> = ({ onPlantSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<PlantType | null>(null);
  const [selectedColor, setSelectedColor] = useState('#4CAF50');

  const filteredPlants = mockPlantTypes.filter(plant => 
    plant.name.toLowerCase().includes(search.toLowerCase()) ||
    plant.category.toLowerCase().includes(search.toLowerCase())
  );

  const handlePlantSelect = (plant: PlantType) => {
    setSelectedPlant(plant);
  };

  const handleAddPlant = () => {
    if (selectedPlant) {
      onPlantSelect(selectedPlant, selectedColor);
      setSelectedPlant(null);
      setSearch('');
    }
  };

  return (
    <div className="plant-selector">
      <div className="plant-search">
        <input
          type="text"
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="plant-list">
          {filteredPlants.map(plant => (
            <div
              key={plant.id}
              className={`plant-item ${selectedPlant?.id === plant.id ? 'selected' : ''}`}
              onClick={() => handlePlantSelect(plant)}
            >
              <span className="plant-name">{plant.name}</span>
              <span className="plant-category">{plant.category}</span>
            </div>
          ))}
        </div>
      </div>
      
      {selectedPlant && (
        <div className="plant-options">
          <div className="color-picker">
            <label>Choose color:</label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            />
          </div>
          <button onClick={handleAddPlant} className="add-plant-btn">
            Add {selectedPlant.name}
          </button>
        </div>
      )}
    </div>
  );
};
