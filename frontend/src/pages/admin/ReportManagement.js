// frontend/src/pages/admin/ReportManagement.js
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
// import './ReportManagement.css';

const ReportManagement = () => {
  const { token, user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [currentPage, filters]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/reports?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setReports(response.data.reports);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Şikayet listesi yükleme hatası:', error);
      setError(error.response?.data?.message || 'Şikayetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleReportUpdate = async (reportId, updateData) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/reports/${reportId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setReports(reports.map(report => 
          report._id === reportId 
            ? response.data.report
            : report
        ));
        setShowModal(false);
        alert('Şikayet güncellendi');
      }
    } catch (error) {
      console.error('Şikayet güncelleme hatası:', error);
      alert(error.response?.data?.message || 'Güncelleme yapılamadı');
    }
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Bekliyor', class: 'status-pending', icon: '⏳' },
      reviewing: { text: 'İnceleniyor', class: 'status-reviewing', icon: '👀' },
      resolved: { text: 'Çözüldü', class: 'status-resolved', icon: '✅' },
      dismissed: { text: 'Reddedildi', class: 'status-dismissed', icon: '❌' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown', icon: '❓' };
    
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.icon} {statusInfo.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      low: { text: 'Düşük', class: 'priority-low', icon: '🟢' },
      medium: { text: 'Orta', class: 'priority-medium', icon: '🟡' },
      high: { text: 'Yüksek', class: 'priority-high', icon: '🟠' },
      urgent: { text: 'Acil', class: 'priority-urgent', icon: '🔴' }
    };
    
    const priorityInfo = priorityMap[priority] || { text: priority, class: 'priority-unknown', icon: '⚪' };
    
    return (
      <span className={`priority-badge ${priorityInfo.class}`}>
        {priorityInfo.icon} {priorityInfo.text}
      </span>
    );
  };

  const getCategoryText = (category) => {
    const categoryMap = {
      spam: 'Spam',
      inappropriate_content: 'Uygunsuz İçerik',
      fake_product: 'Sahte Ürün',
      harassment: 'Taciz',
      fraud: 'Dolandırıcılık',
      violation: 'Kural İhlali',
      other: 'Diğer'
    };
    
    return categoryMap[category] || category;
  };

  return (
    <div className="report-management">
      {/* Header */}
      <div className="management-header">
        <h1>📊 Şikayet Yönetimi</h1>
        <Link to="/admin" className="btn-back">← Dashboard'a Dön</Link>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">📊 Tüm Durumlar</option>
            <option value="pending">⏳ Bekliyor</option>
            <option value="reviewing">👀 İnceleniyor</option>
            <option value="resolved">✅ Çözüldü</option>
            <option value="dismissed">❌ Reddedildi</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">📂 Tüm Kategoriler</option>
            <option value="spam">Spam</option>
            <option value="inappropriate_content">Uygunsuz İçerik</option>
            <option value="fake_product">Sahte Ürün</option>
            <option value="harassment">Taciz</option>
            <option value="fraud">Dolandırıcılık</option>
            <option value="violation">Kural İhlali</option>
            <option value="other">Diğer</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="filter-select"
          >
            <option value="">🎯 Tüm Öncelikler</option>
            <option value="low">🟢 Düşük</option>
            <option value="medium">🟡 Orta</option>
            <option value="high">🟠 Yüksek</option>
            <option value="urgent">🔴 Acil</option>
          </select>

          <button onClick={fetchReports} className="btn-refresh">
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Şikayetler yükleniyor...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Reports Table */}
      {!loading && !error && (
        <>
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Şikayetçi</th>
                  <th>Konu</th>
                  <th>Kategori</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id} className={`report-row priority-${report.priority}`}>
                    <td>
                      <code>#{report._id.slice(-6)}</code>
                    </td>
                    <td>
                      <div className="reporter-info">
                        <strong>{report.reporter?.name}</strong>
                        <small>{report.reporter?.university}</small>
                      </div>
                    </td>
                    <td>
                      <div className="report-subject">
                        <strong>{report.reportType.toUpperCase()}</strong>
                        <small>{report.description.substring(0, 50)}...</small>
                      </div>
                    </td>
                    <td>{getCategoryText(report.category)}</td>
                    <td>{getPriorityBadge(report.priority)}</td>
                    <td>{getStatusBadge(report.status)}</td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => openReportModal(report)}
                          className="btn-review"
                          title="Şikayeti İncele"
                        >
                          👁️ İncele
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
                ({pagination.total} şikayet)
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
              Toplam <strong>{pagination.total}</strong> şikayet bulundu.
              Sayfa başına <strong>{pagination.limit}</strong> şikayet gösteriliyor.
            </p>
          </div>
        </>
      )}

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Şikayet Detayı</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✖️
              </button>
            </div>

            <div className="modal-body">
              <div className="report-details">
                <div className="detail-row">
                  <label>Şikayet ID:</label>
                  <span>#{selectedReport._id}</span>
                </div>

                <div className="detail-row">
                  <label>Şikayetçi:</label>
                  <span>
                    {selectedReport.reporter?.name} 
                    ({selectedReport.reporter?.email})
                  </span>
                </div>

                <div className="detail-row">
                  <label>Konu Türü:</label>
                  <span>{selectedReport.reportType.toUpperCase()}</span>
                </div>

                <div className="detail-row">
                  <label>Kategori:</label>
                  <span>{getCategoryText(selectedReport.category)}</span>
                </div>

                <div className="detail-row">
                  <label>Açıklama:</label>
                  <div className="description-box">
                    {selectedReport.description}
                  </div>
                </div>

                <div className="detail-row">
                  <label>Mevcut Durum:</label>
                  <span>{getStatusBadge(selectedReport.status)}</span>
                </div>

                <div className="detail-row">
                  <label>Öncelik:</label>
                  <span>{getPriorityBadge(selectedReport.priority)}</span>
                </div>

                <div className="detail-row">
                  <label>Tarih:</label>
                  <span>{formatDate(selectedReport.createdAt)}</span>
                </div>

                {selectedReport.reviewedBy && (
                  <div className="detail-row">
                    <label>İncelenen:</label>
                    <span>
                      {selectedReport.reviewedBy.name} - 
                      {formatDate(selectedReport.reviewedAt)}
                    </span>
                  </div>
                )}

                {selectedReport.adminNotes && (
                  <div className="detail-row">
                    <label>Admin Notları:</label>
                    <div className="admin-notes">
                      {selectedReport.adminNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updateData = {
                    status: formData.get('status'),
                    priority: formData.get('priority'),
                    adminNotes: formData.get('adminNotes'),
                    actionTaken: formData.get('actionTaken')
                  };
                  handleReportUpdate(selectedReport._id, updateData);
                }}
                className="action-form"
              >
                <h3>🛠️ İşlem Yap</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Durum:</label>
                    <select name="status" defaultValue={selectedReport.status}>
                      <option value="pending">⏳ Bekliyor</option>
                      <option value="reviewing">👀 İnceleniyor</option>
                      <option value="resolved">✅ Çözüldü</option>
                      <option value="dismissed">❌ Reddedildi</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Öncelik:</label>
                    <select name="priority" defaultValue={selectedReport.priority}>
                      <option value="low">🟢 Düşük</option>
                      <option value="medium">🟡 Orta</option>
                      <option value="high">🟠 Yüksek</option>
                      <option value="urgent">🔴 Acil</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Alınan Aksiyon:</label>
                  <select name="actionTaken" defaultValue={selectedReport.actionTaken}>
                    <option value="none">Hiçbiri</option>
                    <option value="warning">Uyarı Verildi</option>
                    <option value="content_removed">İçerik Kaldırıldı</option>
                    <option value="user_suspended">Kullanıcı Askıya Alındı</option>
                    <option value="user_banned">Kullanıcı Yasaklandı</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Admin Notları:</label>
                  <textarea
                    name="adminNotes"
                    defaultValue={selectedReport.adminNotes || ''}
                    placeholder="Bu şikayetle ilgili notlarınızı yazın..."
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    💾 Güncelle
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn-cancel"
                  >
                    ❌ İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;