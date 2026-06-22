import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

const NAV = [
  { id: 'dashboard', label: 'Читательская', icon: '💬', path: '/' },
  { id: 'books', label: 'Мои книги', icon: '📚', path: '/books' },
  { id: 'achievements', label: 'Достижения', icon: '🏆', path: '/achievements' },
  { id: 'profile', label: 'Профиль', icon: '👤', path: '/profile' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const current = location.pathname === '/' ? 'dashboard' : location.pathname.slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="topbar">
        <div className="topbar-logo">Читалка</div>

        <div style={{ position: 'relative' }}>
          <button className="topbar-user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>{user?.username?.[0]?.toUpperCase() || '?'}</span>
            <span>{user?.username || user?.email?.split('@')[0]}</span>
            <span>⌵</span>
          </button>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              <div className="topbar-dropdown-email">{user?.email}</div>
              <button
                className="topbar-logout"
                onClick={() => { setDropdownOpen(false); logout(); navigate('/login'); }}
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="layout">
        <nav className="sidebar">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${current === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <main>
          <div className="welcome-text">
            Добро пожаловать, <span>{user?.username || user?.email}</span>
          </div>
          {children}
        </main>
      </div>

      <nav className="mobile-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`mob-btn ${current === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="mob-btn-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}