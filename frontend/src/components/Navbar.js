// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useMessageNotification from '../hooks/useMessageNotification';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useMessageNotification();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <img 
            src="/Kampüsepeti_logo.png" 
            alt="KampüSepeti" 
            className="logo-image"
            onError={(e) => {
              // Fallback olarak emoji logo
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
          />
          <span className="logo-fallback" style={{display: 'none'}}>
            📚 KampüSepeti
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="nav-search">
          <input 
            type="text" 
            placeholder="Ders kitabı, not, kırtasiye ara..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">🔍</button>
        </form>

        {/* User Menu */}
        <div className="nav-menu">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">Merhaba, {user?.name}</span>
              
              {/* Mesajlar - Yeni Eklendi */}
              <Link to="/messages" className="nav-btn messages-btn">
                <span className="messages-icon">💬</span>
                <span className="messages-text">Mesajlar</span>
                {unreadCount > 0 && (
                  <span className="message-badge">{unreadCount}</span>
                )}
              </Link>
              
              <Link to="/add-product" className="nav-btn">İlan Ver</Link>
              <Link to="/my-products" className="nav-btn">İlanlarım</Link>
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