// frontend/src/pages/Reports.js - Final Fixed Version  
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [systemStats, setSystemStats] = useState(null);

  // fetchReports function - TÜM HOOKS EN ÜSTTE
  const fetchReports = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      params.append('page', filters.page);
      params.append('limit', 10);

      const response = await api.get(`/admin/reports?${params.toString()}`);
      setReports(response.data.data.reports);
      setPagination(response.data.data.pagination);
      setError('');
    } catch (error) {
      console.error('Şikayet listesi hatası:', error);
      setError('Şikayetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchSystemStats = React.useCallback(async () => {
    try {
      const response = await api.get('/admin/reports/system');
      setSystemStats(response.data.data);
    } catch (error) {
      console.error('Sistem istatistikleri hatası:', error);
    }
  }, []);

  // useEffects - HOOKS'LAR EN ÜSTTE
  useEffect(() => {
    // Sadece admin ise fetch yap
    if (user && user.role === 'admin') {
      fetchReports();
      fetchSystemStats();
    }
  }, [fetchReports, fetchSystemStats, user]);

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const openDetailModal = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const openUpdateModal = (report) => {
    setSelectedReport(report);
    setShowUpdateModal(true);
  };

  const closeModals = () => {
    setSelectedReport(null);
    setShowDetailModal(false);
    setShowUpdateModal(false);
  };

  const updateReportStatus = async (reportId, updateData) => {
    try {
      setUpdateLoading(true);
      const response = await api.put(`/admin/reports/${reportId}`, updateData);
      
      // Listeyi güncelle
      setReports(prev => prev.map(r => 
        r._id === reportId ? response.data.data : r
      ));
      
      closeModals();
      await fetchSystemStats(); // İstatistikleri güncelle
      alert('Şikayet başarıyla güncellendi.');
      
    } catch (error) {
      console.error('Şikayet güncelleme hatası:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUpdateLoading(false);
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

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': { label: 'Beklemede', color: 'status-pending', icon: '⏳' },
      'under_review': { label: 'İnceleniyor', color: 'status-reviewing', icon: '🔍' },
      'resolved': { label: 'Çözüldü', color: 'status-resolved', icon: '✅' },
      'rejected': { label: 'Reddedildi', color: 'status-rejected', icon: '❌' }
    };
    return statusMap[status] || { label: status, color: 'status-default', icon: '❓' };
  };

  const getPriorityInfo = (priority) => {
    const priorityMap = {
      'low': { label: 'Düşük', color: 'priority-low', icon: '🟢' },
      'medium': { label: 'Orta', color: 'priority-medium', icon: '🟡' },
      'high': { label: 'Yüksek', color: 'priority-high', icon: '🟠' },
      'urgent': { label: 'Acil', color: 'priority-urgent', icon: '🔴' }
    };
    return priorityMap[priority] || { label: priority, color: 'priority-default', icon: '⚪' };
  };

  const getCategoryInfo = (category) => {
    const categoryMap = {
      'product': { label: 'İlan', icon: '📚' },
      'user': { label: 'Kullanıcı', icon: '👤' },
      'message': { label: 'Mesaj', icon: '💬' }
    };
    return categoryMap[category] || { label: category, icon: '❓' };
  };

  const getReportTypeInfo = (type) => {
    const typeMap = {
      'spam': 'Spam/İstenmeyen İçerik',
      'fake': 'Sahte/Yanıltıcı',
      'inappropriate': 'Uygunsuz İçerik',
      'fraud': 'Dolandırıcılık',
      'other': 'Diğer'
    };
    return typeMap[type] || type;
  };

  // Admin kontrolü - TÜM HOOKS'LARDAN SONRA
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading && reports.length === 0) return <LoadingSpinner />;

  return (
    <div className="reports-management">
      <div className="page-header">
        <h1>Şikayet Yönetimi</h1>
        <p>Kullanıcı şikayetlerini inceleyin ve gerekli işlemleri gerçekleştirin</p>
      </div>

      {/* Sistem İstatistikleri */}
      {systemStats && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{systemStats.users.total}</h3>
              <p>Toplam Kullanıcı</p>
              <small>{systemStats.users.active} aktif</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{systemStats.products.reduce((sum, p) => sum + p.count, 0)}</h3>
              <p>Toplam İlan</p>
              <small>{systemStats.products.find(p => p._id === 'aktif')?.count || 0} aktif</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{systemStats.reports.reduce((sum, r) => sum + r.count, 0)}</h3>
              <p>Toplam Şikayet</p>
              <small>{systemStats.reports.find(r => r._id === 'pending')?.count || 0} beklemede</small>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{systemStats.ratings.averageRating?.toFixed(1) || '0.0'}</h3>
              <p>Ortalama Puan</p>
              <small>{systemStats.ratings.total} değerlendirme</small>
            </div>
          </div>
        </div>
      )}

      {/* Filtreler */}
      <div className="filters-section">
        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="under_review">İnceleniyor</option>
            <option value="resolved">Çözüldü</option>
            <option value="rejected">Reddedildi</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Kategoriler</option>
            <option value="product">İlan Şikayeti</option>
            <option value="user">Kullanıcı Şikayeti</option>
            <option value="message">Mesaj Şikayeti</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">Tüm Öncelikler</option>
            <option value="urgent">Acil</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>

          <button
            onClick={() => setFilters({ status: '', category: '', priority: '', page: 1 })}
            className="clear-filters-btn"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchReports}>Tekrar Dene</button>
        </div>
      )}

      {/* Şikayet Listesi - Basit Tablo */}
      <div className="reports-section">
        <div className="reports-header">
          <h3>
            Şikayetler ({pagination.total || 0})
          </h3>
          <span className="results-info">
            Sayfa {pagination.current || 1} / {pagination.pages || 1}
          </span>
        </div>

        {loading ? (
          <div className="loading-overlay">
            <LoadingSpinner />
          </div>
        ) : reports.length > 0 ? (
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Tür</th>
                  <th>Şikayetçi</th>
                  <th>Hedef</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => {
                  const statusInfo = getStatusInfo(report.status);
                  
                  return (
                    <tr key={report._id}>
                      <td>{getReportTypeInfo(report.reportType)}</td>
                      <td>
                        <Link to={`/user/${report.reporter._id}`} target="_blank">
                          {report.reporter.name}
                        </Link>
                      </td>
                      <td>
                        {report.reportedUser && (
                          <Link to={`/user/${report.reportedUser._id}`} target="_blank">
                            👤 {report.reportedUser.name}
                          </Link>
                        )}
                        {report.reportedProduct && (
                          <Link to={`/products/${report.reportedProduct._id}`} target="_blank">
                            📚 {report.reportedProduct.title.substring(0, 30)}...
                          </Link>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${statusInfo.color}`}>
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </td>
                      <td>{formatDate(report.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openDetailModal(report)}
                            className="action-btn view-btn"
                            title="Detayları Görüntüle"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => openUpdateModal(report)}
                            className="action-btn edit-btn"
                            title="Durumu Güncelle"
                          >
                            ✏️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Şikayet bulunamadı</h3>
            <p>Filtrelenen kriterlere uygun şikayet bulunmuyor.</p>
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

      {/* Basit Modaller */}
      {showDetailModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Şikayet Detayları</h3>
            <p><strong>Tür:</strong> {getReportTypeInfo(selectedReport.reportType)}</p>
            <p><strong>Sebep:</strong> {selectedReport.reason}</p>
            <p><strong>Durum:</strong> {getStatusInfo(selectedReport.status).label}</p>
            <button onClick={closeModals} className="btn btn-secondary">
              Kapat
            </button>
          </div>
        </div>
      )}

      {showUpdateModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Şikayet Güncelle</h3>
            <select
              defaultValue={selectedReport.status}
              onChange={(e) => {
                updateReportStatus(selectedReport._id, { status: e.target.value });
              }}
            >
              <option value="pending">Beklemede</option>
              <option value="under_review">İnceleniyor</option>
              <option value="resolved">Çözüldü</option>
              <option value="rejected">Reddedildi</option>
            </select>
            <div style={{marginTop: '20px'}}>
              <button onClick={closeModals} className="btn btn-secondary">
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;