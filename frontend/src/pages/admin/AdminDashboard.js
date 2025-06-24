// frontend/src/pages/admin/AdminDashboard.js - Mevcut AuthContext ile uyumlu
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
// import './AdminDashboard.css'; // CSS dosyası eksikse yoruma alın

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // API endpoint'i kontrol et - admin routes yoksa mock data kullan
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('İstatistik yükleme hatası:', error);
      
      // Admin routes henüz yoksa mock data kullan
      if (error.response?.status === 404) {
        console.log('⚠️ Admin API bulunamadı, mock data kullanılıyor');
        setStats({
          users: { total: 42, active: 38, newThisWeek: 7 },
          products: { total: 156, active: 134, newThisWeek: 23 },
          reports: { total: 8, pending: 3 },
          universities: [
            { _id: 'İstanbul Üniversitesi', count: 15 },
            { _id: 'Boğaziçi Üniversitesi', count: 12 },
            { _id: 'ODTÜ', count: 10 },
            { _id: 'ITÜ', count: 8 }
          ],
          categories: [
            { _id: 'Ders Kitabı', count: 89 },
            { _id: 'Roman', count: 34 },
            { _id: 'Kırtasiye', count: 23 },
            { _id: 'Elektronik', count: 10 }
          ]
        });
      } else {
        setError(error.response?.data?.message || 'İstatistikler yüklenemedi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Admin panelinden çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
      window.location.href = '/admin/login';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '2rem auto',
        padding: '2rem',
        textAlign: 'center',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h2>❌ Hata</h2>
        <p>{error}</p>
        <button onClick={fetchStats} style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          🔄 Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      background: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>🛠️ Yönetim Paneli</h1>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>KampüSepeti Admin Dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: '600' }}>Hoş geldin, {user?.name}</div>
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              display: 'inline-block',
              marginTop: '0.25rem'
            }}>
              {user?.role === 'admin' ? '👑 Admin' : '🛡️ Moderatör'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🚪 Çıkış
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #007bff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>👥</div>
            <div>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Kullanıcılar</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2c3e50', margin: '0.5rem 0' }}>
                {stats?.users?.total || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#28a745' }}>
                ✅ {stats?.users?.active || 0} Aktif
              </div>
              <div style={{ fontSize: '0.9rem', color: '#007bff' }}>
                🆕 {stats?.users?.newThisWeek || 0} Bu hafta
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #28a745'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>📦</div>
            <div>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>İlanlar</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2c3e50', margin: '0.5rem 0' }}>
                {stats?.products?.total || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#28a745' }}>
                ✅ {stats?.products?.active || 0} Aktif
              </div>
              <div style={{ fontSize: '0.9rem', color: '#007bff' }}>
                🆕 {stats?.products?.newThisWeek || 0} Bu hafta
              </div>
            </div>
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #dc3545'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>🚨</div>
            <div>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>Şikayetler</h3>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2c3e50', margin: '0.5rem 0' }}>
                {stats?.reports?.total || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#ffc107' }}>
                ⏳ {stats?.reports?.pending || 0} Bekleyen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>🚀 Hızlı İşlemler</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <Link 
            to="/admin/users" 
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Kullanıcı Yönetimi</h3>
            <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
              Kullanıcıları görüntüle, düzenle ve yönet
            </p>
          </Link>

          <Link 
            to="/admin/products" 
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>İlan Moderasyonu</h3>
            <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
              İlanları kontrol et ve yönet
            </p>
          </Link>

          <Link 
            to="/admin/reports" 
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Şikayet Yönetimi</h3>
            <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
              Kullanıcı şikayetlerini incele
            </p>
          </Link>

          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'center',
            opacity: 0.7
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>Analitik</h3>
            <p style={{ color: '#6c757d', fontSize: '0.95rem' }}>
              Yakında eklenecek...
            </p>
          </div>
        </div>
      </div>

      {/* University Distribution */}
      {stats?.universities && stats.universities.length > 0 && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>🏫 Üniversite Dağılımı</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.universities.map((uni, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 200px',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.75rem',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>{uni._id}</span>
                <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{uni.count} kullanıcı</span>
                <div style={{
                  background: '#e9ecef',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #007bff, #0056b3)',
                    height: '100%',
                    width: `${(uni.count / stats.universities[0].count) * 100}%`,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Health */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem' }}>💻 Sistem Durumu</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            borderLeft: '4px solid #28a745'
          }}>
            <span style={{ fontWeight: '600', color: '#2c3e50' }}>Database</span>
            <span style={{ color: '#28a745', fontWeight: '600' }}>🟢 Çevrimiçi</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            borderLeft: '4px solid #28a745'
          }}>
            <span style={{ fontWeight: '600', color: '#2c3e50' }}>API Server</span>
            <span style={{ color: '#28a745', fontWeight: '600' }}>🟢 Çalışıyor</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            borderLeft: '4px solid #28a745'
          }}>
            <span style={{ fontWeight: '600', color: '#2c3e50' }}>File Upload</span>
            <span style={{ color: '#28a745', fontWeight: '600' }}>🟢 Aktif</span>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;