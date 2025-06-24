// frontend/src/pages/admin/AdminLogin.js - Mevcut AuthContext ile uyumlu
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
// import './AdminLogin.css'; // CSS dosyası eksikse yoruma alın

const AdminLogin = () => {
  const { login, user, isAuthenticated, isAdminOrModerator, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: 'admin@kampusepeti.com', // Varsayılan admin bilgileri
    password: 'admin123'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Eğer kullanıcı zaten admin olarak giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated && user && isAdminOrModerator) {
      console.log('✅ Admin zaten giriş yapmış, dashboard\'a yönlendiriliyor');
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, user, isAdminOrModerator, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Error'ları temizle
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError('');
    
    if (error) clearError();

    try {
      console.log('🔐 Admin login attempt:', { email: formData.email });
      
      // API call
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`,
        formData
      );

      if (response.data.success) {
        const { user: userData, token } = response.data;
        
        console.log('✅ Login response:', { 
          user: userData.name, 
          role: userData.role,
          isAdmin: userData.role === 'admin',
          isModerator: userData.role === 'moderator'
        });
        
        // Admin veya moderatör kontrolü
        if (userData.role === 'admin' || userData.role === 'moderator') {
          // AuthContext'teki login fonksiyonunu kullan
          await login(userData, token);
          console.log('✅ Admin login başarılı, dashboard\'a yönlendiriliyor');
          navigate('/admin/dashboard');
        } else {
          setLocalError('Bu alana erişim yetkiniz bulunmuyor. Sadece admin ve moderatörler giriş yapabilir.');
          console.log('❌ Yetkisiz kullanıcı:', userData.role);
        }
      }
    } catch (error) {
      console.error('❌ Admin giriş hatası:', error);
      const errorMessage = error.response?.data?.message || 'Giriş yapılırken hata oluştu';
      setLocalError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const displayError = localError || error;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      position: 'relative'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '3rem',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '4rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            🛠️
          </div>
          <h1 style={{ color: '#2c3e50', margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
            Admin Panel
          </h1>
          <p style={{ color: '#6c757d', fontSize: '1.1rem', margin: 0 }}>
            KampüSepeti Yönetim Sistemi
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#2c3e50', textAlign: 'center', marginBottom: '2rem' }}>
            Yönetici Girişi
          </h2>
          
          {displayError && (
            <div style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid #f5c6cb'
            }}>
              <span>⚠️</span>
              <span>{displayError}</span>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#2c3e50',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              <span>📧</span>
              E-posta Adresi
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@kampusepeti.com"
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.8)'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#2c3e50',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              <span>🔒</span>
              Şifre
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                background: 'rgba(255,255,255,0.8)'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            style={{
              width: '100%',
              padding: '1.2rem',
              background: submitting 
                ? '#6c757d' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {submitting ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Giriş Yapılıyor...
              </>
            ) : (
              <>
                <span>🚀</span>
                Yönetici Paneline Giriş
              </>
            )}
          </button>
        </form>

        {/* Default Credentials Info */}
        <div style={{
          background: 'rgba(255, 243, 205, 0.7)',
          border: '1px solid #ffeaa7',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#856404', margin: '0 0 1rem 0' }}>
            🔑 Varsayılan Admin Bilgileri
          </h3>
          <div style={{
            background: 'rgba(255,255,255,0.8)',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: '0.5rem 0', color: '#2c3e50', fontFamily: 'monospace' }}>
              <strong>E-posta:</strong> admin@kampusepeti.com
            </p>
            <p style={{ margin: '0.5rem 0', color: '#2c3e50', fontFamily: 'monospace' }}>
              <strong>Şifre:</strong> admin123
            </p>
          </div>
          <small style={{ color: '#856404', fontStyle: 'italic' }}>
            ⚠️ Güvenlik için bu bilgileri değiştirmeyi unutmayın!
          </small>
        </div>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e9ecef'
        }}>
          <Link 
            to="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6c757d',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>🏠</span>
            Ana Siteye Dön
          </Link>
          <Link 
            to="/login" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6c757d',
              textDecoration: 'none',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            <span>👤</span>
            Kullanıcı Girişi
          </Link>
        </div>

        {/* System Info */}
        <div style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e9ecef'
        }}>
          <p style={{ margin: '0.3rem 0', color: '#6c757d', fontSize: '0.85rem' }}>
            🔐 Güvenli bağlantı aktif
          </p>
          <p style={{ margin: '0.3rem 0', color: '#6c757d', fontSize: '0.85rem' }}>
            📊 Admin Panel v2.0
          </p>
          <p style={{ margin: '0.3rem 0', color: '#6c757d', fontSize: '0.85rem' }}>
            🚀 KampüSepeti Yönetim Sistemi
          </p>
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

export default AdminLogin;