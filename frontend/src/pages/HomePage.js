import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Öğrenci Dostu Alışveriş Platformu</h1>
          <p>
            Ders kitapları, notlar ve kırtasiye malzemelerini 
            uygun fiyatlarla al, sat ve paylaş!
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <>
                <button className="btn-primary">İlan Ver</button>
                <button className="btn-secondary">İlanları Gözat</button>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary">Hemen Başla</Link>
                <Link to="/login" className="btn-secondary">Giriş Yap</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          📚📖📝
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Neden KampüSepeti?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Uygun Fiyat</h3>
              <p>İkinci el ders kitaplarını çok daha uygun fiyatlarla bulun</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3>Sürdürülebilir</h3>
              <p>Kitapları tekrar kullanarak çevreye katkıda bulunun</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Güvenli</h3>
              <p>Öğrenci topluluğu içinde güvenli alışveriş yapın</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Kolay Kullanım</h3>
              <p>Basit arayüzle hızlıca ilan verin ve alışveriş yapın</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2>Kategoriler</h2>
          <div className="categories-grid">
            <div className="category-card">
              <h3>📚 Ders Kitapları</h3>
              <p>Tüm bölümlerden ders kitapları</p>
            </div>
            <div className="category-card">
              <h3>📝 Notlar</h3>
              <p>Sınav notları ve ders çıktıları</p>
            </div>
            <div className="category-card">
              <h3>✏️ Kırtasiye</h3>
              <p>Kalem, defter, hesap makinesi</p>
            </div>
            <div className="category-card">
              <h3>💻 Elektronik</h3>
              <p>Laptop, tablet, çizim tableti</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;