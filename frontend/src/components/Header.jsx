import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header({ currentPage, setCurrentPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'compare', label: 'Compare' },
    { id: 'itinerary', label: 'Journey Schedule' },
    { id: 'explore', label: 'Explore' },
    { id: 'wishlist', label: 'Wishlist' },
  ];

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo" onClick={() => setCurrentPage('home')}>
          <span className="logo-text">Wandrix</span>
        </div>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(item.id);
                setMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="login-btn"
              onClick={() => {
                setCurrentPage('login');
                setMenuOpen(false);
              }}
            >
              Sign In
            </button>
          )}
        </div>

        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            {menuOpen ? (
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            ) : (
              <>
                <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}

export default Header;
