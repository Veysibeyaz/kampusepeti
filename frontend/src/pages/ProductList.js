// frontend/src/pages/ProductList.js
import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard'; // Doğrudan components'den
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    university: ''
  });

  const categories = ['Ders Kitabı', 'Not', 'Kırtasiye', 'Diğer'];
  const conditions = ['Yeni', 'Az Kullanılmış', 'Orta', 'Eski'];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Query string oluştur
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await fetch(`http://localhost:5000/api/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Ürünler yüklenemedi');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]); // Dependencies eklendi

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // fetchProducts'ı dependency olarak ekledik

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Filtreleme yapınca ilk sayfaya dön
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      university: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1>İlanlar</h1>
          <p>Öğrencilerden öğrencilere ders kitapları ve eğitim materyalleri</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-header">
            <h3>🔍 Filtrele</h3>
            <button 
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Filtreleri Temizle
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Arama</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Kitap adı, yazar..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Kategori</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Durum</label>
              <select
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tüm Durumlar</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Min Fiyat (₺)</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                min="0"
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Max Fiyat (₺)</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="1000"
                min="0"
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Üniversite</label>
              <input
                type="text"
                name="university"
                value={filters.university}
                onChange={handleFilterChange}
                placeholder="Üniversite adı"
                className="filter-input"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="results-section">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Ürünler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>❌ {error}</p>
              <button onClick={fetchProducts} className="retry-btn">
                Tekrar Dene
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>Ürün bulunamadı</h3>
              <p>Arama kriterlerinize uygun ürün bulunmuyor.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <>
              <div className="results-header">
                <h3>{products.length} ürün listeleniyor</h3>
              </div>

              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Önceki
                  </button>

                  <div className="pagination-info">
                    Sayfa {currentPage} / {totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Sonraki →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;