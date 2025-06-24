// frontend/src/components/ReportForm.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './ReportForm.css';

const ReportForm = ({ 
  targetType, // 'user' or 'product'
  targetId, 
  targetName,
  onSuccess, 
  onCancel 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reportType: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { value: 'spam', label: 'Spam/İstenmeyen İçerik' },
    { value: 'fake', label: 'Sahte/Yanıltıcı İlan' },
    { value: 'inappropriate', label: 'Uygunsuz İçerik' },
    { value: 'fraud', label: 'Dolandırıcılık' },
    { value: 'other', label: 'Diğer' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Şikayet göndermek için giriş yapmanız gerekiyor.');
      return;
    }

    if (!formData.reportType) {
      setError('Lütfen şikayet türünü seçin.');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Lütfen şikayet sebebinizi açıklayın.');
      return;
    }

    if (formData.reason.trim().length < 10) {
      setError('Şikayet açıklaması en az 10 karakter olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const reportData = {
        reportType: formData.reportType,
        category: targetType,
        reason: formData.reason.trim()
      };

      if (targetType === 'user') {
        reportData.reportedUser = targetId;
      } else if (targetType === 'product') {
        reportData.reportedProduct = targetId;
      }

      const response = await api.post('/reports', reportData);

      if (response.data.success) {
        onSuccess?.(response.data.message);
      }

    } catch (error) {
      console.error('Şikayet gönderme hatası:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Şikayet gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-form">
      <div className="form-header">
        <h3>Şikayet Bildirimi</h3>
        <p>
          {targetType === 'user' ? 'Kullanıcı' : 'İlan'}: <strong>{targetName}</strong>
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="reportType">
            Şikayet Türü: *
          </label>
          <select
            id="reportType"
            name="reportType"
            value={formData.reportType}
            onChange={handleChange}
            required
            disabled={loading}
            className="form-select"
          >
            <option value="">Şikayet türünü seçin...</option>
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="reason">
            Şikayet Açıklaması: *
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Lütfen şikayetinizin detaylarını açıklayın... (En az 10 karakter)"
            required
            minLength={10}
            maxLength={500}
            rows={5}
            disabled={loading}
            className="form-textarea"
          />
          <div className="char-counter">
            {formData.reason.length}/500 karakter
          </div>
        </div>

        {/* Şikayet Kuralları */}
        <div className="report-guidelines">
          <h4>Şikayet Kuralları:</h4>
          <ul>
            <li>Şikayetiniz gerçek ve somut sebeplere dayalı olmalıdır</li>
            <li>Kişisel anlaşmazlıklar şikayet sebebi değildir</li>
            <li>Yanlış şikayet bildirimi hesabınızın kısıtlanmasına yol açabilir</li>
            <li>Şikayetiniz 24-48 saat içinde incelenecektir</li>
          </ul>
        </div>

        <div className="form-actions">
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
            {loading ? 'Gönderiliyor...' : 'Şikayet Gönder'}
          </button>
        </div>
      </form>

      <div className="privacy-notice">
        <small>
          Bu şikayet sistemi yöneticilerimiz tarafından incelenecektir. 
          Kişisel bilgileriniz gizli tutulacaktır.
        </small>
      </div>
    </div>
  );
};

export default ReportForm;