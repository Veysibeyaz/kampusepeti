// frontend/src/pages/MyProducts.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Düzeltildi
import './MyProducts.css';

const MyProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/products/user/my-products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('İlanlarınız yüklenemedi');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Durum güncellenemedi');
      }

      // Ürün listesini güncelle
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, status: newStatus }
          : product
      ));

      alert('İlan durumu başarıyla güncellendi');
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('İlan silinemedi');
      }

      // Ürünü listeden kaldır
      setProducts(prev => prev.filter(product => product._id !== productId));
      alert('İlan başarıyla silindi');
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      
      // Her seçili ürün için silme işlemi
      const deletePromises = selectedProducts.map(productId =>
        fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );

      await Promise.all(deletePromises);

      // Seçili ürünleri listeden kaldır
      setProducts(prev => prev.filter(product => !selectedProducts.includes(product._id)));
      setSelectedProducts([]);
      setShowDeleteModal(false);
      alert(`${selectedProducts.length} ilan başarıyla silindi`);
    } catch (err) {
      alert('Silme işlemi sırasında hata oluştu');
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aktif':
        return '#10b981';
      case 'pasif':
        return '#f59e0b';
      case 'satildi':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'aktif':
        return 'Aktif';
      case 'pasif':
        return 'Pasif';
      case 'satildi':
        return 'Satıldı';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="my-products-page">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>İlanlarınız yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-products-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>İlanlarım</h1>
            <p>{products.length} ilan listelendi</p>
          </div>
          <div className="header-actions">
            <Link to="/add-product" className="btn-add-product">
              ➕ Yeni İlan Ekle
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchMyProducts} className="retry-btn">
              Tekrar Dene
            </button>
          </div>
        )}

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Henüz hiç ilanınız yok</h3>
            <p>İlk ilanınızı oluşturmak için aşağıdaki butona tıklayın</p>
            <Link to="/add-product" className="btn-add-first">
              İlk İlanını Ekle
            </Link>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            <div className="bulk-actions">
              <div className="bulk-select">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length}
                  onChange={selectAllProducts}
                  id="select-all"
                />
                <label htmlFor="select-all">
                  {selectedProducts.length === products.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                </label>
              </div>
              
              {selectedProducts.length > 0 && (
                <div className="bulk-buttons">
                  <span>{selectedProducts.length} ilan seçildi</span>
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="btn-bulk-delete"
                  >
                    🗑 Seçilenleri Sil
                  </button>
                </div>
              )}
            </div>

            {/* Products List */}
            <div className="products-list">
              {products.map(product => (
                <div key={product._id} className="product-item">
                  <div className="product-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => toggleProductSelection(product._id)}
                    />
                  </div>

                  <div className="product-image">
                    <img
                      src={product.images?.[0] || '/api/placeholder/100/100'}
                      alt={product.title}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/100/100';
                      }}
                    />
                  </div>

                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="product-description">
                      {product.description.substring(0, 100)}...
                    </p>
                    <div className="product-meta">
                      <span className="category">{product.category}</span>
                      <span className="condition">{product.condition}</span>
                      <span className="views">👁 {product.viewCount} görüntülenme</span>
                    </div>
                  </div>

                  <div className="product-price">
                    {formatPrice(product.price)}
                  </div>

                  <div className="product-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(product.status) }}
                    >
                      {getStatusText(product.status)}
                    </span>
                  </div>

                  <div className="product-actions">
                    <Link 
                      to={`/products/${product._id}`}
                      className="btn-view"
                      title="Görüntüle"
                    >
                      👁
                    </Link>
                    
                    <button 
                      onClick={() => navigate(`/edit-product/${product._id}`)}
                      className="btn-edit"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    
                    <select
                      value={product.status}
                      onChange={(e) => handleStatusChange(product._id, e.target.value)}
                      className="status-select"
                      title="Durum Değiştir"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="pasif">Pasif</option>
                      <option value="satildi">Satıldı</option>
                    </select>
                    
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="btn-delete"
                      title="Sil"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>İlanları Sil</h3>
              <p>
                {selectedProducts.length} ilan silinecek. Bu işlem geri alınamaz.
                Devam etmek istiyor musunuz?
              </p>
              <div className="modal-actions">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-cancel"
                >
                  İptal
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="btn-confirm-delete"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;