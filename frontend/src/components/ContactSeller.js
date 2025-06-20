// frontend/src/components/ContactSeller.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';
import './ContactSeller.css';

const ContactSeller = ({ product, seller }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Kullanıcı giriş yapmamışsa
  if (!user) {
    return (
      <div className="contact-seller">
        <button 
          onClick={() => navigate('/login')}
          className="contact-btn login-required"
        >
          💬 Satıcıyla İletişim (Giriş Gerekli)
        </button>
      </div>
    );
  }

  // Kendi ilanı ise gösterme
  if (user._id === seller._id) {
    return null;
  }

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setMessage(`Merhaba, "${product.title}" ilanınız hakkında bilgi almak istiyorum.`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Mesaj boş olamaz');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      await messageService.sendMessage(seller._id, message.trim(), product._id);
      
      setIsModalOpen(false);
      setMessage('');
      
      // Mesajlar sayfasına yönlendir
      navigate('/messages');
    } catch (error) {
      setError(error.message || 'Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="contact-seller">
        <button 
          onClick={handleOpenModal}
          className="contact-btn primary"
        >
          💬 Satıcıyla İletişime Geç
        </button>
        
        <div className="seller-info">
          <div className="seller-avatar">
            {seller.name.charAt(0).toUpperCase()}
          </div>
          <div className="seller-details">
            <h4>{seller.name}</h4>
            <small>Satıcı</small>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💬 Mesaj Gönder</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="product-info">
                <img 
                  src={product.images?.[0] ? 
                    `http://localhost:5000${product.images[0]}` : 
                    '/placeholder.jpg'
                  } 
                  alt={product.title}
                  className="product-thumb"
                />
                <div>
                  <h4>{product.title}</h4>
                  <p className="price">{product.price} ₺</p>
                </div>
              </div>

              <form onSubmit={handleSendMessage}>
                <div className="form-group">
                  <label>Mesajınız:</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="İlan hakkında sormak istediğiniz soruları yazın..."
                    rows={4}
                    maxLength={1000}
                    required
                  />
                  <small>{message.length}/1000 karakter</small>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="modal-actions">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="btn-primary"
                  >
                    {sending ? 'Gönderiliyor...' : 'Mesaj Gönder'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactSeller;