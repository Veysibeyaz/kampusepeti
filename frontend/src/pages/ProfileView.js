// frontend/src/pages/ProfileView.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Profile.css';

const ProfileView = () => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 Profilim</h1>
        <Link to="/profile/edit" className="edit-profile-btn">
          ✏️ Profili Düzenle
        </Link>
      </div>

      <div className="profile-content">
        {/* Kullanıcı Bilgileri */}
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
          </div>
          
          <div className="profile-info">
            <h2>{user?.name || 'İsimsiz Kullanıcı'}</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">📧 E-posta:</span>
                <span className="info-value">{user?.email || 'Belirtilmemiş'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">🏫 Üniversite:</span>
                <span className="info-value">{user?.university || 'Belirtilmemiş'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">📚 Bölüm:</span>
                <span className="info-value">{user?.department || 'Belirtilmemiş'}</span>
              </div>
              
              {user?.phone && (
                <div className="info-item">
                  <span className="info-label">📞 Telefon:</span>
                  <span className="info-value">{user.phone}</span>
                </div>
              )}
              
              <div className="info-item">
                <span className="info-label">📅 Üyelik Tarihi:</span>
                <span className="info-value">{formatDate(user?.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı Erişim */}
        <div className="quick-actions-card">
          <h3>⚡ Hızlı Erişim</h3>
          <div className="quick-actions">
            <Link to="/add-product" className="quick-action-btn">
              ➕ Yeni İlan Ver
            </Link>
            <Link to="/my-products" className="quick-action-btn">
              📋 İlanlarımı Görüntüle
            </Link>
            <Link to="/messages" className="quick-action-btn">
              💬 Mesajlarım
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;