// frontend/src/pages/AddProduct.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AddProduct.css';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    category: '',
    condition: '',
    price: '',
    publishYear: '',
    university: user?.university || '',
    department: ''
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Ders Kitabı', 'Not', 'Kırtasiye', 'Diğer'];
  const conditions = ['Yeni', 'Az Kullanılmış', 'Orta', 'Eski'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('En fazla 5 fotoğraf yükleyebilirsiniz');
      return;
    }
    setImages(files);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Form verilerini ekle
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Fotoğrafları ekle
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'İlan eklenirken bir hata oluştu');
      }

      alert('İlan başarıyla eklendi!');
      navigate('/my-products');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        <h2>Yeni İlan Ekle</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label htmlFor="title">Başlık *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Örn: Matematik Analiz Kitabı"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Kategori *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Kategori Seçin</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="condition">Durum *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
              >
                <option value="">Durum Seçin</option>
                {conditions.map(cond => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="author">Yazar</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Kitap yazarı (varsa)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Fiyat (₺) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="publishYear">Basım Yılı</label>
              <input
                type="number"
                id="publishYear"
                name="publishYear"
                value={formData.publishYear}
                onChange={handleInputChange}
                placeholder="2023"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="university">Üniversite *</label>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                placeholder="Üniversite adı"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Bölüm *</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Bölüm adı"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Açıklama *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ürün hakkında detaylı bilgi verin..."
              rows="4"
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="images">Fotoğraflar (En fazla 5)</label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            {images.length > 0 && (
              <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#f8f9fa' }}>
                <p>{images.length} fotoğraf seçildi</p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-cancel"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Ekleniyor...' : 'İlan Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;