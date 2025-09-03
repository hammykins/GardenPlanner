import { create } from 'zustand';
import type { PlantType } from '../mocks/plantTypes';

interface PlantedCell {
  cellId: number;
  plant: PlantType;
  color: string;
}

interface GardenState {
  address: string | null;
  center: [number, number] | null;
  boundary: number[][] | null;
  plantedCells: PlantedCell[];
  history: PlantedCell[][];
  currentHistoryIndex: number;
  // Grid state
  isGridVisible: boolean;
  gridRows: number;
  gridCols: number;
  // Actions
  setAddress: (address: string, lat: number, lng: number) => void;
  setBoundary: (boundary: number[][]) => void;
  clearBoundary: () => void;
  clearAllData: () => void;
  addPlant: (cellId: number, plant: PlantType, color: string) => void;
  removePlant: (cellId: number) => void;
  undo: () => void;
  redo: () => void;
  // Grid actions
  setGridVisible: (visible: boolean) => void;
  setGridDimensions: (rows: number, cols: number) => void;
  insertRow: () => void;
  deleteRow: () => void;
  insertColumn: () => void;
  deleteColumn: () => void;
}

const MAX_HISTORY = 50;

export const useGardenStore = create<GardenState>((set, get) => {
  // Load initial state from localStorage
  const savedState = localStorage.getItem('gardenState');
  const initialState = savedState ? JSON.parse(savedState) : {
    address: null,
    center: null,
    boundary: null,
    plantedCells: [],
    isGridVisible: false,
    gridRows: 6,
    gridCols: 6,
  };

  return {
    ...initialState,
    history: [initialState.plantedCells],
    currentHistoryIndex: 0,
    setAddress: (address: string, lat: number, lng: number) => {
      set({
        address,
        center: [lat, lng],
      });
    },
    setBoundary: (boundary: number[][]) => {
      const state = get();
      set({ boundary });
      
      // Save to localStorage
      localStorage.setItem('gardenState', JSON.stringify({
        ...state,
        boundary
      }));
    },

    clearBoundary: () => {
      const state = get();
      set({ boundary: null });
      
      // Save to localStorage
      localStorage.setItem('gardenState', JSON.stringify({
        ...state,
        boundary: null
      }));
    },

    clearAllData: () => {
      const currentState = get();
      set({
        // Preserve address and center location
        address: currentState.address,
        center: currentState.center,
        // Clear garden-specific data
        boundary: null,
        plantedCells: [],
        history: [[]],
        currentHistoryIndex: 0
      });
      
      // Update localStorage with preserved location data
      const preservedState = {
        address: currentState.address,
        center: currentState.center,
        boundary: null,
        plantedCells: [],
      };
      localStorage.setItem('gardenState', JSON.stringify(preservedState));
    },

    addPlant: (cellId: number, plant: PlantType, color: string) => {
      const state = get();
      const newCells = [...state.plantedCells];
      const existingIndex = newCells.findIndex(cell => cell.cellId === cellId);
      
      if (existingIndex !== -1) {
        newCells[existingIndex] = { cellId, plant, color };
      } else {
        newCells.push({ cellId, plant, color });
      }

      // Add to history
      const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
      newHistory.push(newCells);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }

      set({
        plantedCells: newCells,
        history: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      });

      // Save to localStorage
      localStorage.setItem('gardenState', JSON.stringify({
        address: state.address,
        center: state.center,
        boundary: state.boundary,
        plantedCells: newCells,
      }));
    },

    removePlant: (cellId: number) => {
      const state = get();
      const newCells = state.plantedCells.filter((cell: PlantedCell) => cell.cellId !== cellId);
      
      // Add to history
      const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
      newHistory.push(newCells);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }

      set({
        plantedCells: newCells,
        history: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      });

    // Save to localStorage
    localStorage.setItem('gardenState', JSON.stringify({
      address: state.address,
      center: state.center,
      boundary: state.boundary,
      plantedCells: newCells,
    }));
  },

    undo: () => {
      const state = get();
      if (state.currentHistoryIndex > 0) {
        set({
          currentHistoryIndex: state.currentHistoryIndex - 1,
          plantedCells: state.history[state.currentHistoryIndex - 1],
        });
      }
    },

    redo: () => {
      const state = get();
      if (state.currentHistoryIndex < state.history.length - 1) {
        set({
          currentHistoryIndex: state.currentHistoryIndex + 1,
          plantedCells: state.history[state.currentHistoryIndex + 1],
        });
      }
    },

    // Grid actions
    setGridVisible: (visible: boolean) => {
      set({ isGridVisible: visible });
    },

    setGridDimensions: (rows: number, cols: number) => {
      set({ gridRows: rows, gridCols: cols });
    },

    insertRow: () => {
      const state = get();
      set({ gridRows: state.gridRows + 1 });
    },

    deleteRow: () => {
      const state = get();
      if (state.gridRows > 1) {
        set({ gridRows: state.gridRows - 1 });
      }
    },

    insertColumn: () => {
      const state = get();
      set({ gridCols: state.gridCols + 1 });
    },

    deleteColumn: () => {
      const state = get();
      if (state.gridCols > 1) {
        set({ gridCols: state.gridCols - 1 });
      }
    }
  }
});