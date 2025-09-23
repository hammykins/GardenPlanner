import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './auth/LogoutButton';

const HomePage: React.FC = () => {
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <div className="home-card">
        <div className="handwritten" style={{ fontSize: '2rem', marginBottom: 12 }}>
          Welcome to Garden Yard Planner
        </div>
        {username && (
          <div style={{ fontSize: '1.1rem', color: '#4a6c4a', marginBottom: 8 }}>
            Logged in as <b>{username}</b>
          </div>
        )}
        <div style={{ fontSize: '1.2rem', color: '#4a6c4a', marginBottom: 16 }}>
          Plan your garden, track your plants, and grow with us.
        </div>
        <div style={{ fontSize: '1rem', color: '#333', marginBottom: 24 }}>
          <ul>
            <li>🌱 Create and manage your garden spaces</li>
            <li>📅 Track planting and harvest dates</li>
            <li>🪴 Visualize your yard and garden beds</li>
            <li>🔒 Secure login and registration</li>
          </ul>
        </div>
        <div style={{ fontSize: '1rem', color: '#666', marginBottom: 24 }}>
          Ready to get started? Use the menu to log in or sign up!
        </div>
        {!username && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: 16 }}>
            <button className="submit-btn" style={{ background: '#b7c9a7' }} onClick={() => navigate('/login')}>
              Login / Sign Up
            </button>
          </div>
        )}
        {username && <LogoutButton />}
      </div>
    </div>
  );
};

export default HomePage;
