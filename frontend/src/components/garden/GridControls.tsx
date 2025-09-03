import React from 'react';
import { useGardenStore } from '../../stores/gardenStore';
import './GridControls.css';

export const GridControls: React.FC = () => {
  const { 
    isGridVisible, 
    gridRows, 
    gridCols, 
    setGridVisible, 
    insertRow, 
    deleteRow, 
    insertColumn, 
    deleteColumn 
  } = useGardenStore();

  return (
    <div className="grid-controls">
      <div className="grid-toggle">
        <button 
          className={`toggle-button ${isGridVisible ? 'active' : ''}`}
          onClick={() => setGridVisible(!isGridVisible)}
        >
          {isGridVisible ? '🎯 Grid Active' : '📐 Add Grid'}
        </button>
      </div>
      
      {isGridVisible && (
        <div className="grid-controls-panel">
          <div className="grid-status">
            <span className="grid-dimensions">
              Grid: {gridRows} × {gridCols}
            </span>
          </div>
          
          <div className="grid-actions">
            <div className="action-group">
              <label>Rows</label>
              <div className="button-group">
                <button 
                  className="action-button insert"
                  onClick={insertRow}
                  title="Insert Row"
                >
                  Insert Row
                </button>
                <button 
                  className="action-button delete"
                  onClick={deleteRow}
                  disabled={gridRows <= 1}
                  title="Delete Row"
                >
                  Delete Row
                </button>
              </div>
            </div>
            
            <div className="action-group">
              <label>Columns</label>
              <div className="button-group">
                <button 
                  className="action-button insert"
                  onClick={insertColumn}
                  title="Insert Column"
                >
                  Insert Column
                </button>
                <button 
                  className="action-button delete"
                  onClick={deleteColumn}
                  disabled={gridCols <= 1}
                  title="Delete Column"
                >
                  Delete Column
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
