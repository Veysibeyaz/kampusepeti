// frontend/src/components/Navbar.js - Updated with Admin Links
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
              {/* İlan Ver Butonu */}
              <Link to="/add-product" className="nav-btn add-product-btn">
                ➕ İlan Ver
              </Link>

              {/* Mesajlar */}
              <Link to="/messages" className="nav-btn messages-btn">
                💬 Mesajlar
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>

              {/* ADMIN PANEL LINK - NEW */}
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-btn admin-btn">
                  👑 Admin Panel
                </Link>
              )}

              {/* User Profile Dropdown */}
              <div className="user-profile-menu">
                <button 
                  className="user-profile-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                >
                  <img 
                    src={profileImageUrl}
                    alt={user?.name}
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <span className="user-name">{user?.name}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {showUserDropdown && (
                  <div className="user-dropdown">
                    <Link 
                      to={`/user/${user?.id}`} 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      👤 Profilim
                    </Link>
                    
                    <Link 
                      to="/profile/edit" 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      ⚙️ Profil Düzenle
                    </Link>
                    
                    <Link 
                      to="/my-products" 
                      className="dropdown-item"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      📚 İlanlarım
                    </Link>

                    {/* ADMIN DROPDOWN ITEMS - NEW */}
                    {user?.role === 'admin' && (
                      <>
                        <div className="dropdown-divider"></div>
                        <div className="dropdown-header">Admin İşlemleri</div>
                        
                        <Link 
                          to="/admin/dashboard" 
                          className="dropdown-item admin-item"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          📊 Dashboard
                        </Link>
                        
                        <Link 
                          to="/admin/users" 
                          className="dropdown-item admin-item"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          👥 Kullanıcı Yönetimi
                        </Link>
                        
                        <Link 
                          to="/admin/products" 
                          className="dropdown-item admin-item"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          📚 İlan Moderasyonu
                        </Link>
                        
                        <Link 
                          to="/admin/reports" 
                          className="dropdown-item admin-item"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          ⚠️ Şikayet Yönetimi
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>
                    
                    <button 
                      className="dropdown-item logout-item"
                      onClick={() => {
                        setShowUserDropdown(false);
                        handleLogout();
                      }}
                    >
                      🚪 Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-menu">
              <Link to="/login" className="nav-btn login-btn">
                🔑 Giriş Yap
              </Link>
              <Link to="/register" className="nav-btn register-btn">
                📝 Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;