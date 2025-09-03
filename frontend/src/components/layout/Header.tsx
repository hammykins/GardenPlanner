import React from 'react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>Garden Yard Planner</h1>
        <nav className="header-nav">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/gardens">My Gardens</a></li>
            <li><a href="/plants">Plants</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
