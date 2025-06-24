// frontend/src/pages/admin/UserManagement.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
// import './UserManagement.css';

const UserManagement = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    university: '',
    role: '',
    status: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Kullanıcı listesi yükleme hatası:', error);
      setError(error.response?.data?.message || 'Kullanıcılar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/status`,
        { isActive: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Kullanıcı listesini güncelle
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, isActive: newStatus }
            : user
        ));
        alert(`Kullanıcı ${newStatus ? 'aktif' : 'pasif'} duruma getirildi`);
      }
    } catch (error) {
      console.error('Kullanıcı durumu güncelleme hatası:', error);
      alert(error.response?.data?.message || 'Durum güncellenirken hata oluştu');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Bu kullanıcının rolünü ${newRole} olarak değiştirmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/users/${userId}/status`,
        { role: newRole },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, role: newRole }
            : user
        ));
        alert(`Kullanıcı rolü ${newRole} olarak güncellendi`);
      }
    } catch (error) {
      console.error('Kullanıcı rolü güncelleme hatası:', error);
      alert(error.response?.data?.message || 'Rol güncellenirken hata oluştu');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="management-header">
        <h1>👥 Kullanıcı Yönetimi</h1>
        <Link to="/admin" className="btn-back">← Dashboard'a Dön</Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Kullanıcı ara (isim veya e-posta)"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-row">
          <select
            value={filters.university}
            onChange={(e) => handleFilterChange('university', e.target.value)}
            className="filter-select"
          >
            <option value="">🏫 Tüm Üniversiteler</option>
            <option value="İstanbul Üniversitesi">İstanbul Üniversitesi</option>
            <option value="Boğaziçi Üniversitesi">Boğaziçi Üniversitesi</option>
            <option value="ODTÜ">ODTÜ</option>
            <option value="ITÜ">ITÜ</option>
          </select>

          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="filter-select"
          >
            <option value="">👤 Tüm Roller</option>
            <option value="user">Kullanıcı</option>
            <option value="moderator">Moderatör</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">📊 Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>

          <button onClick={fetchUsers} className="btn-refresh">
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Kullanıcılar yükleniyor...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Kullanıcı</th>
                  <th>Üniversite</th>
                  <th>Bölüm</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className={!user.isActive ? 'user-inactive' : ''}>
                    <td>
                      <img 
                        src={user.avatar || `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`}
                        alt={user.name}
                        className="user-avatar-small"
                        onError={(e) => {
                          e.target.src = `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`;
                        }}
                      />
                    </td>
                    <td>
                      <div className="user-info">
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </div>
                    </td>
                    <td>{user.university}</td>
                    <td>{user.department}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`role-select role-${user.role}`}
                      >
                        <option value="user">Kullanıcı</option>
                        <option value="moderator">Moderatör</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleStatusChange(user._id, !user.isActive)}
                        className={`status-btn ${user.isActive ? 'active' : 'inactive'}`}
                      >
                        {user.isActive ? '✅ Aktif' : '❌ Pasif'}
                      </button>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/user/${user._id}`}
                          className="btn-view"
                          title="Profili Görüntüle"
                        >
                          👁️
                        </Link>
                        <button 
                          className="btn-message"
                          title="Mesaj Gönder"
                          onClick={() => {
                            // Mesaj gönderme modalı açılabilir
                            alert('Mesaj gönderme özelliği yakında eklenecek');
                          }}
                        >
                          💬
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Önceki
              </button>

              <span className="pagination-info">
                Sayfa {currentPage} / {pagination.pages} 
                ({pagination.total} kullanıcı)
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="pagination-btn"
              >
                Sonraki →
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="management-summary">
            <p>
              Toplam <strong>{pagination.total}</strong> kullanıcı bulundu.
              Sayfa başına <strong>{pagination.limit}</strong> kullanıcı gösteriliyor.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;