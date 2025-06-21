// frontend/src/pages/UserProfile.js - Final Version
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RatingComponent from '../components/RatingComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('👤 Fetching user profile for ID:', id);
        
        // Kullanıcı profili
        const userResponse = await api.get(`/users/${id}`);
        console.log('✅ User profile loaded:', userResponse.data);
        setUser(userResponse.data);
        
        // Kullanıcının ilanları
        const productsResponse = await api.get(`/users/${id}/products`);
        setProducts(productsResponse.data.products || []);
        
        // Mock ratings - Rating API henüz hazır değil
        setRatings([]);
        
      } catch (error) {
        console.error('❌ Profil yükleme hatası:', error);
        setError('Profil bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (id && id !== 'undefined') {
      fetchUserProfile();
    } else {
      setError('Geçersiz kullanıcı ID');
      setLoading(false);
    }
  }, [id]);

  const handleRatingSubmit = async (ratingData) => {
    try {
      console.log('⭐ Rating submit:', ratingData);
      setShowRatingModal(false);
      setError('Değerlendirme sistemi henüz aktif değil (Adım 8 devam ediyor)');
    } catch (error) {
      console.error('Değerlendirme hatası:', error);
      setError('Değerlendirme gönderilemedi');
    }
  };

  const getTrustBadge = (trustScore) => {
    if (trustScore >= 80) return { text: 'Çok Güvenilir', class: 'trust-excellent' };
    if (trustScore >= 60) return { text: 'Güvenilir', class: 'trust-good' };
    if (trustScore >= 40) return { text: 'Orta', class: 'trust-medium' };
    return { text: 'Düşük', class: 'trust-low' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  // Profil resmi URL'i oluştur
  const getProfileImageUrl = (profilePhoto) => {
    if (!profilePhoto || profilePhoto === 'default-avatar.png') {
      return '/default-avatar.png';
    }
    return `http://localhost:5000/uploads/profiles/${profilePhoto}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!user) return <div className="error-message">Kullanıcı bulunamadı</div>;

  const trustBadge = getTrustBadge(user.trustScore || 50);
  const isOwnProfile = currentUser && currentUser.id === id;
  const profileImageUrl = getProfileImageUrl(user.profilePhoto);

  console.log('🖼️ Profile image URL:', profileImageUrl);

  return (
    <div className="user-profile">
      <div className="container">
        {/* Profil Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <img 
              src={profileImageUrl}
              alt={user.name}
              onLoad={() => console.log('✅ Profil resmi yüklendi')}
              onError={(e) => {
                console.error('❌ Profil resmi yüklenemedi:', profileImageUrl);
                e.target.src = '/default-avatar.png';
              }}
            />
          </div>
          
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-university">
              {user.university || 'Üniversite belirtilmemiş'} - {user.department || 'Bölüm belirtilmemiş'}
            </p>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{user.averageRating ? user.averageRating.toFixed(1) : '0.0'}</span>
                <span className="stat-label">⭐ Ortalama Puan</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.totalRatings || 0}</span>
                <span className="stat-label">Değerlendirme</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.activeProductsCount || 0}</span>
                <span className="stat-label">Aktif İlan</span>
              </div>
            </div>
            
            <div className="profile-badges">
              <span className={`trust-badge ${trustBadge.class}`}>
                {trustBadge.text}
              </span>
              {user.isEmailVerified && (
                <span className="verified-badge">✓ Doğrulanmış</span>
              )}
            </div>
            
            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}
            
            <div className="profile-actions">
              {isOwnProfile ? (
                <Link to="/profile/edit" className="btn btn-primary">
                  Profili Düzenle
                </Link>
              ) : (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowRatingModal(true)}
                  >
                    Değerlendir
                  </button>
                  <Link 
                    to={`/messages?user=${id}`} 
                    className="btn btn-secondary"
                  >
                    Mesaj Gönder
                  </Link>
                </>
              )}
            </div>
            
            <div className="profile-meta">
              <span>Üye oldu: {formatDate(user.createdAt)}</span>
              {user.lastActive && (
                <span>Son görülme: {formatDate(user.lastActive)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Profil Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            Hakkında
          </button>
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            İlanları ({products.length})
          </button>
          <button 
            className={`tab ${activeTab === 'ratings' ? 'active' : ''}`}
            onClick={() => setActiveTab('ratings')}
          >
            Değerlendirmeler ({ratings.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'about' && (
            <div className="about-tab">
              <div className="info-section">
                <h3>Kullanıcı Bilgileri</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Üniversite:</label>
                    <span>{user.university || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="info-item">
                    <label>Bölüm:</label>
                    <span>{user.department || 'Belirtilmemiş'}</span>
                  </div>
                  <div className="info-item">
                    <label>Toplam Satış:</label>
                    <span>{user.totalSales || 0}</span>
                  </div>
                  <div className="info-item">
                    <label>Güven Skoru:</label>
                    <span className={`trust-score ${trustBadge.class}`}>
                      {user.trustScore || 50}/100
                    </span>
                  </div>
                </div>
              </div>
              
              {user.bio && (
                <div className="bio-section">
                  <h3>Hakkında</h3>
                  <p>{user.bio}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-tab">
              {products.length > 0 ? (
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product._id} className="product-card">
                      <Link to={`/products/${product._id}`}>
                        <img 
                          src={product.images?.[0] || '/placeholder-product.png'} 
                          alt={product.title}
                        />
                        <div className="product-info">
                          <h4>{product.title}</h4>
                          <p className="product-price">{product.price} ₺</p>
                          <p className="product-category">{product.category?.name}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Henüz aktif ilan bulunmuyor.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ratings' && (
            <div className="ratings-tab">
              {ratings.length > 0 ? (
                <div className="ratings-list">
                  {ratings.map(rating => (
                    <div key={rating._id} className="rating-item">
                      <div className="rating-header">
                        <div className="rating-user">
                          <img 
                            src={getProfileImageUrl(rating.ratingUser?.profilePhoto)}
                            alt={rating.ratingUser?.name}
                          />
                          <span>{rating.ratingUser?.name}</span>
                        </div>
                        <div className="rating-stars">
                          {'⭐'.repeat(rating.rating)}
                        </div>
                        <div className="rating-date">
                          {formatDate(rating.createdAt)}
                        </div>
                      </div>
                      
                      {rating.comment && (
                        <p className="rating-comment">{rating.comment}</p>
                      )}
                      
                      {rating.product && (
                        <div className="rating-product">
                          <Link to={`/products/${rating.product._id}`}>
                            İlan: {rating.product.title}
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Henüz değerlendirme bulunmuyor.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{user.name} kullanıcısını değerlendir</h3>
            <RatingComponent 
              onSubmit={handleRatingSubmit}
              onCancel={() => setShowRatingModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;