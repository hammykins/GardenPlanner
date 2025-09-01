import React, { useState } from 'react';
import './GridControls.css';

interface GridControlsProps {
  currentRows: number;
  currentCols: number;
  cellSizeFeet: number;
  onGridResize: (rows: number, cols: number) => void;
  onCellSizeChange: (sizeFeet: number) => void;
  onToggleGrid: () => void;
  gridVisible: boolean;
}

export const GridControls: React.FC<GridControlsProps> = ({
  currentRows,
  currentCols,
  cellSizeFeet,
  onGridResize,
  onCellSizeChange,
  onToggleGrid,
  gridVisible
}) => {
  const [rows, setRows] = useState(currentRows);
  const [cols, setCols] = useState(currentCols);
  const [cellSize, setCellSize] = useState(cellSizeFeet);
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded so it's visible

  const handleApplyChanges = () => {
    onGridResize(rows, cols);
    onCellSizeChange(cellSize);
  };

  const handlePresetGrid = (presetRows: number, presetCols: number) => {
    setRows(presetRows);
    setCols(presetCols);
    onGridResize(presetRows, presetCols);
  };

  const totalCells = rows * cols;
  const totalArea = (rows * cellSize) * (cols * cellSize); // square feet

  return (
    <div className="grid-controls">
      <div className="grid-controls-header">
        <button 
          className="toggle-grid-btn"
          onClick={onToggleGrid}
          title={gridVisible ? 'Hide Grid' : 'Show Grid'}
        >
          <span className={`grid-icon ${gridVisible ? 'visible' : 'hidden'}`}>⊞</span>
          {gridVisible ? 'Hide Grid' : 'Show Grid'}
        </button>
        
        <button 
          className="expand-controls-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          title="Grid Settings"
        >
          ⚙️ Settings {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <div className="grid-controls-panel">
          <div className="control-section">
            <h4>Grid Dimensions</h4>
            <div className="dimension-controls">
              <div className="dimension-group">
                <label>
                  Rows: 
                  <div className="number-input-group">
                    <button 
                      onClick={() => setRows(Math.max(1, rows - 1))}
                      disabled={rows <= 1}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={rows}
                      onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="50"
                    />
                    <button 
                      onClick={() => setRows(Math.min(50, rows + 1))}
                      disabled={rows >= 50}
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>

              <div className="dimension-group">
                <label>
                  Columns:
                  <div className="number-input-group">
                    <button 
                      onClick={() => setCols(Math.max(1, cols - 1))}
                      disabled={cols <= 1}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      value={cols}
                      onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="50"
                    />
                    <button 
                      onClick={() => setCols(Math.min(50, cols + 1))}
                      disabled={cols >= 50}
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h4>Cell Size</h4>
            <div className="cell-size-controls">
              <label>
                Size (feet):
                <select 
                  value={cellSize}
                  onChange={(e) => setCellSize(parseFloat(e.target.value))}
                >
                  <option value={0.5}>6 inches</option>
                  <option value={1}>1 foot</option>
                  <option value={2}>2 feet</option>
                  <option value={3}>3 feet</option>
                  <option value={4}>4 feet</option>
                  <option value={5}>5 feet</option>
                  <option value={10}>10 feet</option>
                </select>
              </label>
            </div>
          </div>

          <div className="control-section">
            <h4>Quick Presets</h4>
            <div className="preset-buttons">
              <button onClick={() => handlePresetGrid(5, 5)}>
                Small Garden<br/>
                <small>5×5 grid</small>
              </button>
              <button onClick={() => handlePresetGrid(10, 10)}>
                Medium Garden<br/>
                <small>10×10 grid</small>
              </button>
              <button onClick={() => handlePresetGrid(15, 15)}>
                Large Garden<br/>
                <small>15×15 grid</small>
              </button>
              <button onClick={() => handlePresetGrid(20, 10)}>
                Rectangular Plot<br/>
                <small>20×10 grid</small>
              </button>
            </div>
          </div>

          <div className="control-section">
            <h4>Grid Info</h4>
            <div className="grid-info">
              <div className="info-item">
                <strong>Total Cells:</strong> {totalCells}
              </div>
              <div className="info-item">
                <strong>Garden Size:</strong> {rows * cellSize}' × {cols * cellSize}'
              </div>
              <div className="info-item">
                <strong>Total Area:</strong> {totalArea} sq ft
              </div>
              {totalArea >= 43560 && (
                <div className="info-item">
                  <strong>≈ {(totalArea / 43560).toFixed(2)} acres</strong>
                </div>
              )}
            </div>
          </div>

          <div className="control-actions">
            <button 
              className="apply-btn"
              onClick={handleApplyChanges}
              disabled={rows === currentRows && cols === currentCols && cellSize === cellSizeFeet}
            >
              Apply Changes
            </button>
            <button 
              className="reset-btn"
              onClick={() => {
                setRows(currentRows);
                setCols(currentCols);
                setCellSize(cellSizeFeet);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
