import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          📚 KampüSepeti
        </Link>

        {/* Search Bar */}
        <div className="nav-search">
          <input 
            type="text" 
            placeholder="Ders kitabı, not, kırtasiye ara..."
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        {/* User Menu */}
        <div className="nav-menu">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">Merhaba, {user?.name}</span>
              <button className="nav-btn">İlan Ver</button>
              <button className="nav-btn">Profilim</button>
              <button className="nav-btn logout-btn" onClick={handleLogout}>
                Çıkış
              </button>
            </div>
          ) : (
            <div className="auth-menu">
              <Link to="/login" className="nav-btn login-btn">
                Giriş Yap
              </Link>
              <Link to="/register" className="nav-btn register-btn">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;