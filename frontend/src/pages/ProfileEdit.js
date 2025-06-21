// frontend/src/pages/ProfileEdit.js - Final Version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import './ProfileEdit.css';

const ProfileEdit = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    university: '',
    department: ''
  });
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profil resmi URL'i oluştur
  const getProfileImageUrl = (profilePhoto) => {
    if (!profilePhoto || profilePhoto === 'default-avatar.png') {
      return '/default-avatar.png';
    }
    return `http://localhost:5000/uploads/profiles/${profilePhoto}`;
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        university: user.university || '',
        department: user.department || ''
      });
      
      if (user.profilePhoto) {
        setPhotoPreview(getProfileImageUrl(user.profilePhoto));
      }
    }
    
    // Mock üniversite verileri
    setUniversities([
      { _id: '1', name: 'İstanbul Üniversitesi' },
      { _id: '2', name: 'Boğaziçi Üniversitesi' },
      { _id: '3', name: 'ODTÜ' },
      { _id: '4', name: 'İTÜ' },
      { _id: '5', name: 'Hacettepe Üniversitesi' },
      { _id: '6', name: 'Bursa Teknik Üniversitesi' }
    ]);
    
    setLoading(false);
  }, [user]);

  const fetchDepartments = async (universityId) => {
    try {
      const mockDepartments = [
        { _id: '1', name: 'Bilgisayar Mühendisliği' },
        { _id: '2', name: 'Elektrik Elektronik Mühendisliği' },
        { _id: '3', name: 'Makine Mühendisliği' },
        { _id: '4', name: 'İşletme' },
        { _id: '5', name: 'İktisat' },
        { _id: '6', name: 'Endüstri Mühendisliği' }
      ];
      setDepartments(mockDepartments);
    } catch (error) {
      console.error('Bölümler yüklenemedi:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'university' && value) {
      fetchDepartments(value);
      setFormData(prev => ({
        ...prev,
        department: ''
      }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Sadece resim dosyaları yüklenebilir');
        return;
      }

      setProfilePhoto(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Profile update started:', formData);

      // Profil bilgilerini güncelle
      const profileResponse = await api.put('/users/profile', formData);
      console.log('✅ Profile updated:', profileResponse.data);
      
      let updatedUser = profileResponse.data.user;

      // Profil fotoğrafı varsa yükle
      if (profilePhoto) {
        console.log('📸 Uploading profile photo...');
        const photoFormData = new FormData();
        photoFormData.append('profilePhoto', profilePhoto);
        
        const photoResponse = await api.post('/users/profile-photo', photoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('✅ Photo uploaded:', photoResponse.data);
        
        // User objesine yeni fotoğraf bilgisini ekle
        updatedUser = {
          ...updatedUser,
          profilePhoto: photoResponse.data.profilePhoto
        };
      }

      // Context'teki kullanıcıyı güncelle
      if (updateUser && updatedUser) {
        updateUser(updatedUser);
        console.log('✅ User context updated');
      }
      
      setSuccess('Profil başarıyla güncellendi');
      
      // 2 saniye sonra profil sayfasına yönlendir
      setTimeout(() => {
        navigate(`/users/${user.id}`);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Profil güncelleme hatası:', error);
      setError(error.response?.data?.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="profile-edit">
      <div className="container">
        <div className="edit-header">
          <h1>Profili Düzenle</h1>
          <button 
            onClick={() => navigate(`/users/${user?.id || ''}`)}
            className="btn btn-secondary"
          >
            Geri Dön
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Profil Fotoğrafı */}
          <div className="photo-section">
            <label>Profil Fotoğrafı</label>
            <div className="photo-upload">
              <div className="photo-preview">
                <img 
                  src={photoPreview || '/default-avatar.png'} 
                  alt="Profil fotoğrafı önizleme"
                  onLoad={() => console.log('✅ Preview image loaded')}
                  onError={(e) => {
                    console.error('❌ Preview image failed to load');
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
              <div className="photo-controls">
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profilePhoto" className="btn btn-secondary">
                  Fotoğraf Seç
                </label>
                <small>JPG, PNG veya GIF. Maksimum 5MB.</small>
              </div>
            </div>
          </div>

          {/* Kişisel Bilgiler */}
          <div className="form-section">
            <h3>Kişisel Bilgiler</h3>
            
            <div className="form-group">
              <label htmlFor="name">Ad Soyad *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefon</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="05XX XXX XX XX"
                maxLength={15}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Hakkımda</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Kendinizi kısaca tanıtın..."
                maxLength={300}
                rows={4}
              />
              <small>{formData.bio.length}/300 karakter</small>
            </div>
          </div>

          {/* Eğitim Bilgileri */}
          <div className="form-section">
            <h3>Eğitim Bilgileri</h3>
            
            <div className="form-group">
              <label htmlFor="university">Üniversite *</label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                required
              >
                <option value="">Üniversite seçin</option>
                {universities.map(uni => (
                  <option key={uni._id} value={uni._id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department">Bölüm *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                disabled={!formData.university}
              >
                <option value="">Bölüm seçin</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;