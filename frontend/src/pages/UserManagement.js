// frontend/src/pages/UserManagement.js - Final Fixed Version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // fetchUsers function - TÜM HOOKS EN ÜSTTE
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      params.append('page', filters.page);
      params.append('limit', 10);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (error) {
      console.error('Kullanıcı listesi hatası:', error);
      setError('Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // useEffect - HOOKS'LAR EN ÜSTTE
  useEffect(() => {
    // Sadece admin ise fetch yap
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [fetchUsers, user]);

  // Event handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const openStatusModal = (userData) => {
    setSelectedUser(userData);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setSelectedUser(null);
    setShowStatusModal(false);
  };

  const updateUserStatus = async (isActive, reason) => {
    try {
      setStatusLoading(true);
      await api.put(`/admin/users/${selectedUser._id}/status`, {
        isActive,
        reason
      });

      // Listeyi güncelle
      setUsers(prev => prev.map(u => 
        u._id === selectedUser._id 
          ? { ...u, isActive }
          : u
      ));

      closeStatusModal();
      
      // Başarı mesajı göster
      alert(`Kullanıcı ${isActive ? 'aktif' : 'pasif'} hale getirildi.`);
      
    } catch (error) {
      console.error('Kullanıcı durumu güncelleme hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'role-admin' : 'role-user';
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'status-active' : 'status-inactive';
  };

  // Admin kontrolü - TÜM HOOKS'LARDAN SONRA
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading && users.length === 0) return <LoadingSpinner />;

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>Kullanıcı Yönetimi</h1>
        <p>Kayıtlı kullanıcıları yönetin ve durumlarını düzenleyin</p>
      </div>

      {/* Filtreler */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="İsim, e-posta veya üniversite ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            🔍 Ara
          </button>
        </form>

        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>

          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Roller</option>
            <option value="user">Kullanıcı</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={() => setFilters({ search: '', status: '', role: '', page: 1 })}
            className="clear-filters-btn"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchUsers}>Tekrar Dene</button>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="users-section">
        <div className="users-header">
          <h3>
            Kullanıcılar ({pagination.total || 0})
          </h3>
          <span className="results-info">
            Sayfa {pagination.current || 1} / {pagination.pages || 1}
          </span>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <LoadingSpinner />
          </div>
        ) : users.length > 0 ? (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>E-posta</th>
                  <th>Üniversite</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userData => (
                  <tr key={userData._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {userData.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{userData.name}</div>
                          <div className="user-department">{userData.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>{userData.email}</td>
                    <td>{userData.university}</td>
                    <td>
                      <span className={`role-badge ${getRoleColor(userData.role)}`}>
                        {userData.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(userData.isActive)}`}>
                        {userData.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>{formatDate(userData.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => openStatusModal(userData)}
                          className="action-btn status-btn"
                          disabled={userData.role === 'admin' && userData._id === user.id}
                          title={userData.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {userData.isActive ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={() => window.open(`/user/${userData._id}`, '_blank')}
                          className="action-btn view-btn"
                          title="Profili Görüntüle"
                        >
                          👁️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Kullanıcı bulunamadı</h3>
            <p>Arama kriterlerinize uygun kullanıcı bulunmuyor.</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="page-btn"
            >
              ← Önceki
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === pagination.pages || 
                  Math.abs(page - pagination.current) <= 2
                )
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] < page - 1 && (
                      <span className="page-ellipsis">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`page-number ${page === pagination.current ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))
              }
            </div>

            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current >= pagination.pages}
              className="page-btn"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>

      {/* Durum Değiştirme Modal */}
      {showStatusModal && selectedUser && (
        <StatusModal
          user={selectedUser}
          onConfirm={updateUserStatus}
          onCancel={closeStatusModal}
          loading={statusLoading}
        />
      )}
    </div>
  );
};

// Durum Değiştirme Modal Komponenti
const StatusModal = ({ user, onConfirm, onCancel, loading }) => {
  const [reason, setReason] = useState('');
  const newStatus = !user.isActive;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Lütfen bir sebep belirtin.');
      return;
    }
    onConfirm(newStatus, reason.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content status-modal">
        <h3>
          Kullanıcı Durumunu {newStatus ? 'Aktif' : 'Pasif'} Yap
        </h3>
        
        <div className="user-info">
          <p><strong>Kullanıcı:</strong> {user.name}</p>
          <p><strong>E-posta:</strong> {user.email}</p>
          <p><strong>Mevcut Durum:</strong> 
            <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
              {user.isActive ? 'Aktif' : 'Pasif'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reason">
              {newStatus ? 'Aktif yapma' : 'Pasif yapma'} sebebi: *
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Bu işlemi yapma sebebinizi açıklayın..."
              required
              rows={4}
              maxLength={500}
            />
            <small>{reason.length}/500 karakter</small>
          </div>

          <div className="modal-actions">
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
              className={`btn ${newStatus ? 'btn-success' : 'btn-danger'}`}
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : (newStatus ? 'Aktif Yap' : 'Pasif Yap')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;