
import { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { MapboxGardenPlanner } from './components/garden/MapboxGardenPlanner';
import LoginSignup from './components/auth/LoginSignup';
import SetupPassword from './components/auth/SetupPassword';
import HomePage from './components/HomePage';
import type { Feature } from './api/features.api';


function App() {
  const demoGardenId = 1;
  const [features, setFeatures] = useState<Feature[]>([]);

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/setup-password" element={<SetupPassword />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App
