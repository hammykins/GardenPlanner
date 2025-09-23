import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/login');
  };
  return (
    <button className="submit-btn" style={{ background: '#b7c9a7', marginTop: 8 }} onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
