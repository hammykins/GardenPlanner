import React, { useState } from 'react';
import './App.css'
import { Header } from './components/layout/Header'
import { MapboxGardenPlanner } from './components/garden/MapboxGardenPlanner'
import type { Feature } from './api/features.api';

function App() {
  // For demonstration purposes, using hardcoded IDs
  const demoGardenId = 1;
  const demoUserId = 1;
  const [features, setFeatures] = useState<Feature[]>([]);

  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <div style={{ padding: '20px' }}>
          <h1>🌱 Garden Planner with Mapbox</h1>
          <p>Draw boundaries for different areas of your yard (house, garden beds, lawn, etc.)</p>
          
          {/* Features Summary */}
          {features.length > 0 && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '10px', 
              background: '#f5f5f5', 
              borderRadius: '5px' 
            }}>
              <strong>Your Features:</strong>
              <ul>
                {features.map(feature => (
                  <li key={feature.id}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: feature.color,
                      marginRight: '8px',
                      borderRadius: '2px'
                    }}></span>
                    {feature.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <MapboxGardenPlanner
            gardenId={demoGardenId}
            userId={demoUserId}
            onFeaturesChange={setFeatures}
          />
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <strong>Instructions:</strong>
            <ol>
              <li>First, get your free Mapbox token from https://account.mapbox.com/</li>
              <li>Update the token in MapboxGardenPlanner.tsx</li>
              <li>Use the polygon tool to draw boundaries</li>
              <li>Name each feature (yard, house, garden, etc.)</li>
              <li>Edit or delete features as needed</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
