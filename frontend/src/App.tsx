import React from 'react';
import { GardenPlanner } from './components/GardenPlanner';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Garden Yard Planner</h1>
      </header>
      <main>
        <GardenPlanner />
      </main>
    </div>
  );
}

export default App;
