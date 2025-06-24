// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css'; // Eğer CSS dosyası yoksa yoruma alın

const Login = () => { // LoginPage → Login olarak değiştir
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Giriş Yap</h2>
          <p>KampüSepeti hesabınıza giriş yapın</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-posta</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Şifre</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Şifrenizi girin"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-btn"
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>
              Hesabınız yok mu? 
              <Link to="/register"> Kayıt olun</Link>
            </p>
            <p>
              Admin misiniz? 
              <Link to="/admin/login" style={{ color: '#dc3545' }}> Admin Girişi</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; // LoginPage → Login olarak değiştir