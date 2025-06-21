// frontend/src/components/Navbar.js - Final Version
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
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  // Dropdown dışına tıklandığında kapat
  const handleClickOutside = (e) => {
    if (!e.target.closest('.user-profile-menu')) {
      setShowUserDropdown(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Profil resmi URL'i oluştur
  const getProfileImageUrl = (profilePhoto) => {
    if (!profilePhoto || profilePhoto === 'default-avatar.png') {
      return '/default-avatar.png';
    }
    return `http://localhost:5000/uploads/profiles/${profilePhoto}`;
  };

  const profileImageUrl = getProfileImageUrl(user?.profilePhoto);

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
              {/* Mesajlar */}
              <Link to="/messages" className="nav-btn messages-btn">
                <span className="messages-icon">💬</span>
                <span className="messages-text">Mesajlar</span>
                {unreadCount > 0 && (
                  <span className="message-badge">{unreadCount}</span>
                )}
              </Link>
              
              <Link to="/add-product" className="nav-btn">İlan Ver</Link>
              
              {/* Profil Dropdown Menüsü */}
              <div className="user-profile-menu">
                <button 
                  className="profile-trigger"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <img 
                    src={profileImageUrl}
                    alt={user?.name || 'Profil'}
                    className="profile-avatar"
                    onLoad={() => console.log('✅ Navbar profil resmi yüklendi')}
                    onError={(e) => {
                      console.error('❌ Navbar profil resmi yüklenemedi:', profileImageUrl);
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <span className="profile-name">{user?.name}</span>
                  <span className={`dropdown-arrow ${showUserDropdown ? 'open' : ''}`}>▼</span>
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <img 
                        src={profileImageUrl}
                        alt={user?.name}
                        className="dropdown-avatar"
                      />
                      <div className="dropdown-user-info">
                        <span className="dropdown-name">{user?.name}</span>
                        <span className="dropdown-email">{user?.email}</span>
                      </div>
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    
                    <Link 
                      to={`/users/${user?.id}`} 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <span className="dropdown-icon">👤</span>
                      Profilimi Gör
                    </Link>
                    
                    <Link 
                      to="/profile/edit" 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <span className="dropdown-icon">⚙️</span>
                      Profili Düzenle
                    </Link>
                    
                    <Link 
                      to="/my-products" 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <span className="dropdown-icon">📋</span>
                      İlanlarım
                    </Link>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button 
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleLogout();
                      }} 
                      className="dropdown-item logout-item"
                    >
                      <span className="dropdown-icon">🚪</span>
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
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