// frontend/src/pages/UserProfile.js
import React from 'react';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Kullanıcı Profili</h1>
      <p>Kullanıcı ID: {id}</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '2rem', 
        borderRadius: '8px',
        margin: '2rem auto',
        maxWidth: '600px'
      }}>
        <h3>🚧 Geliştirme Aşamasında</h3>
        <p>Bu özellik Adım 8'de tamamlanacak</p>
      </div>
    </div>
  );
};

export default UserProfile;