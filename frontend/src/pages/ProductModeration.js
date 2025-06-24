// frontend/src/pages/ProductModeration.js - Final Fixed Version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProductModeration.css';

const ProductModeration = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // fetchProducts function
  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      params.append('page', filters.page);
      params.append('limit', 12);

      const response = await api.get(`/admin/products?${params.toString()}`);
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (error) {
      console.error('İlan listesi hatası:', error);
      setError('İlanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // useEffect - HOOKS'LAR EN ÜSTTE
  useEffect(() => {
    // Sadece admin ise fetch yap
    if (user && user.role === 'admin') {
      fetchProducts();
    }
  }, [fetchProducts, user]);

  // Event handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setSelectedProduct(null);
    setShowDeleteModal(false);
  };

  const deleteProduct = async (reason) => {
    try {
      setDeleteLoading(true);
      await api.delete(`/admin/products/${selectedProduct._id}`, {
        data: { reason }
      });

      // Listeyi güncelle
      setProducts(prev => prev.filter(p => p._id !== selectedProduct._id));
      
      closeDeleteModal();
      alert('İlan başarıyla silindi.');
      
    } catch (error) {
      console.error('İlan silme hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setDeleteLoading(false);
    }
  };

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

  const getStatusColor = (status) => {
    const colors = {
      'aktif': 'status-active',
      'pasif': 'status-inactive',
      'satildi': 'status-sold'
    };
    return colors[status] || 'status-default';
  };

  const getConditionColor = (condition) => {
    const colors = {
      'Yeni': 'condition-new',
      'Az Kullanılmış': 'condition-like-new',
      'Orta': 'condition-used',
      'Eski': 'condition-old'
    };
    return colors[condition] || 'condition-default';
  };

  // Admin kontrolü - TÜM HOOKS'LARDAN SONRA
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading && products.length === 0) return <LoadingSpinner />;

  return (
    <div className="product-moderation">
      <div className="page-header">
        <h1>İlan Moderasyonu</h1>
        <p>Yayınlanan ilanları yönetin ve moderasyon işlemlerini gerçekleştirin</p>
      </div>

      {/* Filtreler */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="İlan başlığı, açıklama veya yazar ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍 Ara
          </button>
        </form>

        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
            <option value="satildi">Satıldı</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="Ders Kitabı">Ders Kitabı</option>
            <option value="Not">Not</option>
            <option value="Kırtasiye">Kırtasiye</option>
            <option value="Diğer">Diğer</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', status: '', category: '', page: 1 })}
            className="clear-filters-btn"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchProducts}>Tekrar Dene</button>
        </div>
      )}

      {/* İlan Listesi */}
      <div className="products-section">
        <div className="products-header">
          <h3>
            İlanlar ({pagination.total || 0})
          </h3>
          <span className="results-info">
            Sayfa {pagination.current || 1} / {pagination.pages || 1}
          </span>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <LoadingSpinner />
          </div>
        ) : products.length > 0 ? (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                {/* Ürün Resmi */}
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={`http://localhost:5000/uploads/products/${product.images[0]}`}
                      alt={product.title}
                      onError={(e) => {
                        e.target.src = '/placeholder-book.png';
                      }}
                    />
                  ) : (
                    <div className="no-image">📚</div>
                  )}
                  
                  {/* Durum Badge */}
                  <div className={`status-badge ${getStatusColor(product.status)}`}>
                    {product.status}
                  </div>
                </div>

                {/* Ürün Bilgileri */}
                <div className="product-info">
                  <h4 className="product-title">{product.title}</h4>
                  <p className="product-author">Yazar: {product.author}</p>
                  
                  <div className="product-meta">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <span className="product-category">{product.category}</span>
                  </div>

                  <div className="product-details">
                    <span className={`condition-badge ${getConditionColor(product.condition)}`}>
                      {product.condition}
                    </span>
                    <span className="product-date">{formatDate(product.createdAt)}</span>
                  </div>

                  {/* Satıcı Bilgisi */}
                  <div className="seller-info">
                    <span className="seller-label">Satıcı:</span>
                    <Link 
                      to={`/user/${product.seller._id}`}
                      className="seller-link"
                      target="_blank"
                    >
                      {product.seller.name}
                    </Link>
                    <span className={`seller-status ${product.seller.isActive ? 'active' : 'inactive'}`}>
                      {product.seller.isActive ? '●' : '○'}
                    </span>
                  </div>

                  <div className="university-info">
                    <small>{product.seller.university}</small>
                  </div>
                </div>

                {/* İşlem Butonları */}
                <div className="product-actions">
                  <Link
                    to={`/products/${product._id}`}
                    target="_blank"
                    className="action-btn view-btn"
                    title="İlanı Görüntüle"
                  >
                    👁️ Görüntüle
                  </Link>
                  
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="action-btn delete-btn"
                    title="İlanı Sil"
                  >
                    🗑️ Sil
                  </button>

                  <Link
                    to={`/user/${product.seller._id}`}
                    target="_blank"
                    className="action-btn seller-btn"
                    title="Satıcı Profili"
                  >
                    👤 Satıcı
                  </Link>
                </div>

                {/* Ek Bilgiler */}
                <div className="product-stats">
                  <span className="view-count">👁️ {product.viewCount || 0} görüntüleme</span>
                  {product.publishYear && (
                    <span className="publish-year">📅 {product.publishYear}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>İlan bulunamadı</h3>
            <p>Arama kriterlerinize uygun ilan bulunmuyor.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="page-btn"
            >
              ← Önceki
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.pages || 
                  Math.abs(page - pagination.current) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] < page - 1 && (
                      <span className="page-ellipsis">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`page-number ${page === pagination.current ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))
              }
            </div>

            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current >= pagination.pages}
              className="page-btn"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>

      {/* İlan Silme Modal */}
      {showDeleteModal && selectedProduct && (
        <DeleteProductModal
          product={selectedProduct}
          onConfirm={deleteProduct}
          onCancel={closeDeleteModal}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

// İlan Silme Modal Komponenti
const DeleteProductModal = ({ product, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    'Uygunsuz içerik',
    'Sahte/yanıltıcı ilan',
    'Telif hakkı ihlali',
    'Spam/tekrarlanan ilan',
    'Kullanıcı şikayeti',
    'Platform kuralları ihlali',
    'Diğer'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Diğer' ? reason : selectedReason;
    
    if (!finalReason.trim()) {
      alert('Lütfen bir sebep belirtin.');
      return;
    }
    
    onConfirm(finalReason.trim());
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <h3>İlanı Sil</h3>
        
        <div className="product-preview">
          <h4>{product.title}</h4>
          <p><strong>Yazar:</strong> {product.author}</p>
          <p><strong>Fiyat:</strong> {formatPrice(product.price)}</p>
          <p><strong>Kategori:</strong> {product.category}</p>
          <p><strong>Satıcı:</strong> {product.seller.name}</p>
        </div>

        <div className="warning-message">
          ⚠️ Bu işlem geri alınamaz. İlan kalıcı olarak silinecektir.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Silme sebebi: *</label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              required
              className="reason-select"
            >
              <option value="">Sebep seçin...</option>
              {predefinedReasons.map(reasonOption => (
                <option key={reasonOption} value={reasonOption}>
                  {reasonOption}
                </option>
              ))}
            </select>
          </div>

          {selectedReason === 'Diğer' && (
            <div className="form-group">
              <label htmlFor="custom-reason">Özel sebep:</label>
              <textarea
                id="custom-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Silme sebebinizi detaylı olarak açıklayın..."
                required
                rows={4}
                maxLength={500}
              />
              <small>{reason.length}/500 karakter</small>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Siliniyor...' : 'İlanı Sil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModeration;