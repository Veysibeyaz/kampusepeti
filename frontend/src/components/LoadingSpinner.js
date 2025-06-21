// frontend/src/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Yükleniyor...' }) => {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium', 
    large: 'spinner-large'
  };

  return (
    <div className="loading-spinner">
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;