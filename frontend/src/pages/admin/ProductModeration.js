// frontend/src/pages/admin/ProductModeration.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
// import './ProductModeration.css';

const ProductModeration = () => {
  const { token } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    seller: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/products?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('İlan listesi yükleme hatası:', error);
      setError(error.response?.data?.message || 'İlanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleProductAction = async (productId, action) => {
    const actionText = action === 'hide' ? 'gizle' : 'sil';
    
    if (!window.confirm(`Bu ilanı ${actionText}mek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/admin/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { action }
        }
      );

      if (response.data.success) {
        if (action === 'delete') {
          setProducts(products.filter(product => product._id !== productId));
        } else {
          setProducts(products.map(product => 
            product._id === productId 
              ? { ...product, status: 'removed' }
              : product
          ));
        }
        alert(`İlan başarıyla ${actionText}di`);
      }
    } catch (error) {
      console.error('İlan işlemi hatası:', error);
      alert(error.response?.data?.message || 'İşlem gerçekleştirilemedi');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProducts.length === 0) {
      alert('Lütfen işlem yapılacak ilanları seçin');
      return;
    }

    const actionText = action === 'hide' ? 'gizle' : 'sil';
    
    if (!window.confirm(`Seçili ${selectedProducts.length} ilanı ${actionText}mek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const promises = selectedProducts.map(productId =>
        axios.delete(
          `${process.env.REACT_APP_API_URL}/api/admin/products/${productId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            data: { action }
          }
        )
      );

      await Promise.all(promises);
      
      if (action === 'delete') {
        setProducts(products.filter(product => !selectedProducts.includes(product._id)));
      } else {
        setProducts(products.map(product => 
          selectedProducts.includes(product._id)
            ? { ...product, status: 'removed' }
            : product
        ));
      }
      
      setSelectedProducts([]);
      alert(`${selectedProducts.length} ilan başarıyla ${actionText}di`);
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
      alert('Bazı işlemler gerçekleştirilemedi');
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product._id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { text: 'Satılık', class: 'status-available', icon: '✅' },
      sold: { text: 'Satıldı', class: 'status-sold', icon: '✔️' },
      removed: { text: 'Kaldırıldı', class: 'status-removed', icon: '❌' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown', icon: '❓' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  return (
    <div className="product-moderation">
      {/* Header */}
      <div className="management-header">
        <h1>📋 İlan Moderasyonu</h1>
        <Link to="/admin" className="btn-back">← Dashboard'a Dön</Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 İlan ara (başlık veya açıklama)"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-row">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">📚 Tüm Kategoriler</option>
            <option value="Ders Kitabı">Ders Kitabı</option>
            <option value="Roman">Roman</option>
            <option value="Kırtasiye">Kırtasiye</option>
            <option value="Elektronik">Elektronik</option>
            <option value="Diğer">Diğer</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">📊 Tüm Durumlar</option>
            <option value="available">Satılık</option>
            <option value="sold">Satıldı</option>
            <option value="removed">Kaldırıldı</option>
          </select>

          <button onClick={fetchProducts} className="btn-refresh">
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bulk-actions">
          <span className="selection-count">
            {selectedProducts.length} ilan seçili
          </span>
          <button 
            onClick={() => handleBulkAction('hide')}
            className="btn-bulk-hide"
          >
            👁️‍🗨️ Gizle
          </button>
          <button 
            onClick={() => handleBulkAction('delete')}
            className="btn-bulk-delete"
          >
            🗑️ Sil
          </button>
          <button 
            onClick={() => setSelectedProducts([])}
            className="btn-clear-selection"
          >
            ✖️ Seçimi Temizle
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>İlanlar yükleniyor...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Resim</th>
                  <th>İlan</th>
                  <th>Satıcı</th>
                  <th>Kategori</th>
                  <th>Fiyat</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className={product.status === 'removed' ? 'product-removed' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => toggleProductSelection(product._id)}
                      />
                    </td>
                    <td>
                      <img 
                        src={product.image || '/api/placeholder/60/60'}
                        alt={product.title}
                        className="product-image-small"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/60';
                        }}
                      />
                    </td>
                    <td>
                      <div className="product-info">
                        <strong>{product.title}</strong>
                        <small>{product.description?.substring(0, 60)}...</small>
                      </div>
                    </td>
                    <td>
                      <div className="seller-info">
                        <strong>{product.seller?.name}</strong>
                        <small>{product.seller?.university}</small>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td className="price">₺{product.price}</td>
                    <td>{getStatusBadge(product.status)}</td>
                    <td>{formatDate(product.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/product/${product._id}`}
                          className="btn-view"
                          title="İlanı Görüntüle"
                        >
                          👁️
                        </Link>
                        {product.status !== 'removed' && (
                          <>
                            <button 
                              onClick={() => handleProductAction(product._id, 'hide')}
                              className="btn-hide"
                              title="İlanı Gizle"
                            >
                              👁️‍🗨️
                            </button>
                            <button 
                              onClick={() => handleProductAction(product._id, 'delete')}
                              className="btn-delete"
                              title="İlanı Sil"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Önceki
              </button>

              <span className="pagination-info">
                Sayfa {currentPage} / {pagination.pages} 
                ({pagination.total} ilan)
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="pagination-btn"
              >
                Sonraki →
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="management-summary">
            <p>
              Toplam <strong>{pagination.total}</strong> ilan bulundu.
              Sayfa başına <strong>{pagination.limit}</strong> ilan gösteriliyor.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductModeration;