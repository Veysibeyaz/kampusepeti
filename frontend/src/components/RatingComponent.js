// frontend/src/components/RatingComponent.js
import React, { useState } from 'react';
import './RatingComponent.css';

const RatingComponent = ({ onSubmit, onCancel, existingRating = null, productId = null }) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Lütfen bir puan seçin');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Yorum en az 10 karakter olmalıdır');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        rating,
        comment: comment.trim(),
        productId
      });
    } catch (error) {
      setError('Değerlendirme gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const getRatingText = (ratingValue) => {
    switch (ratingValue) {
      case 1: return 'Çok Kötü';
      case 2: return 'Kötü';
      case 3: return 'Orta';
      case 4: return 'İyi';
      case 5: return 'Mükemmel';
      default: return 'Puan seçin';
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="rating-component">
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        
        {/* Yıldız Puanlama */}
        <div className="rating-section">
          <label>Puanınız:</label>
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((starRating) => (
              <button
                key={starRating}
                type="button"
                className={`star ${starRating <= displayRating ? 'active' : ''}`}
                onClick={() => handleStarClick(starRating)}
                onMouseEnter={() => handleStarHover(starRating)}
                onMouseLeave={handleStarLeave}
                disabled={loading}
              >
                ⭐
              </button>
            ))}
          </div>
          <span className="rating-text">
            {getRatingText(displayRating)}
          </span>
        </div>

        {/* Yorum Alanı */}
        <div className="comment-section">
          <label htmlFor="comment">Yorumunuz:</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bu kullanıcı hakkında deneyiminizi paylaşın... (En az 10 karakter)"
            maxLength={500}
            rows={4}
            disabled={loading}
            required
          />
          <div className="char-counter">
            {comment.length}/500
          </div>
        </div>

        {/* Değerlendirme Kriterleri */}
        <div className="rating-criteria">
          <h4>Değerlendirme Kriterleri:</h4>
          <ul>
            <li>İletişim kalitesi</li>
            <li>Ürün açıklamasının doğruluğu</li>
            <li>Teslimat hızı ve güvenilirliği</li>
            <li>Genel memnuniyet</li>
          </ul>
        </div>

        {/* Butonlar */}
        <div className="rating-actions">
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
            className="btn btn-primary"
            disabled={loading || rating === 0}
          >
            {loading ? 'Gönderiliyor...' : (existingRating ? 'Güncelle' : 'Değerlendir')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingComponent;