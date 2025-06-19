// frontend/src/components/ProductCard.js (src/components/ altına koyun)
import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
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

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      border: '1px solid #e5e7eb',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Link 
        to={`/products/${product._id}`} 
        style={{ 
          textDecoration: 'none', 
          color: 'inherit', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <div style={{
          position: 'relative',
          width: '100%',
          height: '200px',
          overflow: 'hidden',
          backgroundColor: '#f3f4f6'
        }}>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2
          }}>
            <span style={{
              backgroundColor: getConditionColor(product.condition),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {product.condition}
            </span>
          </div>
        </div>

        <div style={{
          padding: '1.25rem',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 0.75rem 0',
            lineHeight: '1.4',
            height: '2.8rem',
            overflow: 'hidden'
          }}>
            {product.title}
          </h3>
          
          <div style={{ marginBottom: '0.75rem', flex: 1 }}>
            {product.author && (
              <p style={{
                margin: '0 0 0.25rem 0',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <strong>Yazar:</strong> {product.author}
              </p>
            )}
            <p style={{
              margin: '0 0 0.25rem 0',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <strong>Kategori:</strong> {product.category}
            </p>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#6b7280',
            padding: '0.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '6px'
          }}>
            <span>📍</span>
            <span>{product.university}</span>
            {product.department && <span> • {product.department}</span>}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: 'auto',
            gap: '1rem'
          }}>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#059669'
            }}>
              {formatPrice(product.price)}
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.25rem',
              fontSize: '0.75rem',
              color: '#9ca3af'
            }}>
              <span>👁 {product.viewCount || 0}</span>
              <span>
                {new Date(product.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;