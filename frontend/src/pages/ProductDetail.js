// frontend/src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Düzeltildi
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      
      if (!response.ok) {
        throw new Error('Ürün bulunamadı');
      }

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Yeni':
        return '#10b981';
      case 'Az Kullanılmış':
        return '#3b82f6';
      case 'Orta':
        return '#f59e0b';
      case 'Eski':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleMessageSeller = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user._id === product.seller._id) {
      alert('Kendi ürününüze mesaj gönderemezsiniz');
      return;
    }

    // Mesajlaşma sayfasına yönlendir
    navigate(`/messages?user=${product.seller._id}&product=${product._id}`);
  };

  const isOwner = isAuthenticated && user && product && user._id === product.seller._id;

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Ürün detayları yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="error-state">
            <p>❌ {error || 'Ürün bulunamadı'}</p>
            <button onClick={() => navigate('/products')} className="back-btn">
              Ürün Listesine Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Ana Sayfa</Link>
          <span>/</span>
          <Link to="/products">İlanlar</Link>
          <span>/</span>
          <span>{product.title}</span>
        </div>

        <div className="product-detail">
          {/* Images Section */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={product.images?.[selectedImage] || '/api/placeholder/600/400'}
                alt={product.title}
                onError={(e) => {
                  e.target.src = '/api/placeholder/600/400';
                }}
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/150/100';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1>{product.title}</h1>
              <div className="product-badges">
                <span 
                  className="condition-badge"
                  style={{ backgroundColor: getConditionColor(product.condition) }}
                >
                  {product.condition}
                </span>
                <span className="category-badge">{product.category}</span>
              </div>
            </div>

            <div className="product-price">
              {formatPrice(product.price)}
            </div>

            <div className="product-details">
              <div className="detail-row">
                <span className="detail-label">📚 Yazar:</span>
                <span>{product.author || 'Belirtilmemiş'}</span>
              </div>
              
              {product.publishYear && (
                <div className="detail-row">
                  <span className="detail-label">📅 Basım Yılı:</span>
                  <span>{product.publishYear}</span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">🏫 Üniversite:</span>
                <span>{product.university}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">🎓 Bölüm:</span>
                <span>{product.department}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">👁 Görüntülenme:</span>
                <span>{product.viewCount} kez</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">📅 İlan Tarihi:</span>
                <span>{formatDate(product.createdAt)}</span>
              </div>
            </div>

            <div className="product-description">
              <h3>Açıklama</h3>
              <p>{product.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              {isOwner ? (
                <div className="owner-actions">
                  <button 
                    onClick={() => navigate(`/edit-product/${product._id}`)}
                    className="btn-edit"
                  >
                    ✏️ Düzenle
                  </button>
                  <button 
                    onClick={() => navigate('/my-products')}
                    className="btn-manage"
                  >
                    📋 İlanlarım
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleMessageSeller}
                  className="btn-message"
                >
                  💬 Satıcıya Mesaj Gönder
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="seller-info">
          <h3>Satıcı Bilgileri</h3>
          <div className="seller-card">
            <div className="seller-avatar">
              <img 
                src={product.seller.avatar || '/api/placeholder/80/80'} 
                alt={product.seller.name}
                onError={(e) => {
                  e.target.src = '/api/placeholder/80/80';
                }}
              />
            </div>
            <div className="seller-details">
              <h4>{product.seller.name}</h4>
              <p>📧 {product.seller.email}</p>
              <p>🏫 {product.seller.university}</p>
              {product.seller.phone && (
                <p>📞 {product.seller.phone}</p>
              )}
              <div className="seller-rating">
                <span>⭐ 4.8</span>
                <span>(23 değerlendirme)</span>
              </div>
              <p className="member-since">
                Üye: {formatDate(product.seller.createdAt)}
              </p>
            </div>
            <div className="seller-actions">
              <Link 
                to={`/user/${product.seller._id}`}
                className="btn-view-profile"
              >
                Profili Görüntüle
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="related-products">
          <h3>Benzer İlanlar</h3>
          <p>Aynı kategoriden diğer ürünler için <Link to="/products">tüm ilanları görüntüleyin</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;