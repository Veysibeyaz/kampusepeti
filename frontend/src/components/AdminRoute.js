// frontend/src/components/AdminRoute.js - Mevcut AuthContext ile uyumlu
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading, isAuthenticated, isAdminOrModerator, initialized } = useAuth();

  console.log('🛡️ AdminRoute Check:', {
    isAuthenticated,
    user: user?.name,
    role: user?.role,
    isAdminOrModerator,
    loading,
    initialized
  });

  // Loading durumunda veya henüz initialize olmamışsa bekleme göster
  if (loading || !initialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ fontSize: '1.2rem', margin: 0 }}>Yetki kontrol ediliyor...</p>
        <small style={{ opacity: 0.8 }}>KampüSepeti Admin Panel</small>
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
  }

  // Kullanıcı giriş yapmamışsa admin giriş sayfasına yönlendir
  if (!isAuthenticated || !user) {
    console.log('❌ Admin route: Kullanıcı giriş yapmamış');
    return <Navigate to="/admin/login" replace />;
  }

  // Admin veya moderatör değilse admin giriş sayfasına yönlendir
  if (!isAdminOrModerator) {
    console.log('❌ Admin route: Yetkisiz kullanıcı, role:', user.role);
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ Admin route: Erişim izni verildi');
  // Her şey tamam, içeriği göster
  return children;
};

export default AdminRoute;