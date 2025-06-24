// frontend/src/pages/AdminDashboard.js - Fixed React Hooks
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data.data);
      setError('');
    } catch (error) {
      console.error('Dashboard verisi hatası:', error);
      setError('Dashboard verisi yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  // Admin kontrolü - hooks'tan sonra
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <h2>Hata</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentUsers, recentProducts, topCategories } = dashboardData || {};

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Paneli</h1>
        <p>Sistem yönetimi ve istatistikleri</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Toplam Kullanıcı</p>
            <small>{stats?.activeUsers || 0} aktif kullanıcı</small>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats?.totalProducts || 0}</h3>
            <p>Toplam İlan</p>
            <small>Bu ay eklenen</small>
          </div>
        </div>

        <div className="stat-card reports">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats?.pendingReports || 0}</h3>
            <p>Bekleyen Şikayet</p>
            <small>Toplam: {stats?.totalReports || 0}</small>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>%95.2</h3>
            <p>Kullanıcı Memnuniyeti</p>
            <small>Son 30 gün</small>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Sol Kolon */}
        <div className="left-column">
          {/* Son Kullanıcılar */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Son Kayıt Olan Kullanıcılar</h3>
              <a href="/admin/users" className="view-all-link">Tümünü Gör</a>
            </div>
            <div className="recent-users">
              {recentUsers?.length > 0 ? (
                recentUsers.map(user => (
                  <div key={user._id} className="user-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <h4>{user.name}</h4>
                        <p>{user.university}</p>
                        <small>{formatDate(user.createdAt)}</small>
                      </div>
                    </div>
                    <div className={`user-status ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">Henüz kullanıcı bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Kategori İstatistikleri */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Popüler Kategoriler</h3>
            </div>
            <div className="category-stats">
              {topCategories?.length > 0 ? (
                topCategories.map((cat, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{cat._id}</span>
                      <span className="category-count">{cat.count} ilan</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress"
                        style={{ 
                          width: `${(cat.count / Math.max(...topCategories.map(c => c.count))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">Kategori verisi bulunmuyor</p>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon */}
        <div className="right-column">
          {/* Son İlanlar */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Son Eklenen İlanlar</h3>
              <a href="/admin/products" className="view-all-link">Tümünü Gör</a>
            </div>
            <div className="recent-products">
              {recentProducts?.length > 0 ? (
                recentProducts.map(product => (
                  <div key={product._id} className="product-item">
                    <div className="product-info">
                      <h4>{product.title}</h4>
                      <p>Satıcı: {product.seller?.name}</p>
                      <div className="product-meta">
                        <span className="product-price">{formatPrice(product.price)}</span>
                        <span className="product-category">{product.category}</span>
                      </div>
                      <small>{formatDate(product.createdAt)}</small>
                    </div>
                    <div className={`product-status status-${product.status}`}>
                      {product.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">Henüz ilan bulunmuyor</p>
              )}
            </div>
          </div>

          {/* Hızlı Aksiyonlar */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Hızlı İşlemler</h3>
            </div>
            <div className="quick-actions">
              <a href="/admin/users" className="action-btn users-btn">
                <span className="action-icon">👥</span>
                <span>Kullanıcı Yönetimi</span>
              </a>
              <a href="/admin/products" className="action-btn products-btn">
                <span className="action-icon">📚</span>
                <span>İlan Moderasyonu</span>
              </a>
              <a href="/admin/reports" className="action-btn reports-btn">
                <span className="action-icon">⚠️</span>
                <span>Şikayet Yönetimi</span>
              </a>
              <a href="/admin/reports/system" className="action-btn system-btn">
                <span className="action-icon">📊</span>
                <span>Sistem Raporları</span>
              </a>
            </div>
          </div>

          {/* Sistem Durumu */}
          <div className="dashboard-section">
            <div className="section-header">
              <h3>Sistem Durumu</h3>
            </div>
            <div className="system-status">
              <div className="status-item">
                <div className="status-indicator active"></div>
                <span>Sunucu Durumu</span>
                <span className="status-value">Çevrimiçi</span>
              </div>
              <div className="status-item">
                <div className="status-indicator active"></div>
                <span>Veritabanı</span>
                <span className="status-value">Bağlı</span>
              </div>
              <div className="status-item">
                <div className="status-indicator active"></div>
                <span>Dosya Sistemi</span>
                <span className="status-value">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;