import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    scholarshipId: ''
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'accepted', 'denied'
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'Pending',
    adminNotes: ''
  });

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.scholarshipId) params.append('scholarshipId', filters.scholarshipId);
      
      const response = await axios.get(`/api/applications?${params}`);
      setApplications(response.data.applications || response.data);
    } catch (error) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/applications/stats/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleStatusUpdate = async (applicationId) => {
    try {
      const response = await axios.put(`/api/applications/${applicationId}/status`, reviewData);
      
      // Update the application in the list
      setApplications(prev => prev.map(app => 
        app._id === applicationId ? response.data.application : app
      ));
      
      setShowModal(false);
      setSelectedApplication(null);
      setReviewData({ status: 'Pending', adminNotes: '' });
      
      // Refresh stats
      fetchStats();
      
      alert(`Application ${reviewData.status.toLowerCase()} successfully!`);
    } catch (error) {
      alert('Failed to update application status');
    }
  };

  const openReviewModal = (application) => {
    setSelectedApplication(application);
    setReviewData({
      status: application.status,
      adminNotes: application.adminNotes || ''
    });
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'bg-warning', icon: '⏳' },
      'Accepted': { class: 'bg-success', icon: '✅' },
      'Denied': { class: 'bg-danger', icon: '❌' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', icon: '❓' };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {status}
      </span>
    );
  };

  // Filter applications based on active tab
  const getFilteredApplications = () => {
    let filtered = Array.isArray(applications) ? applications : [];
    
    // Filter by active tab
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(app => app.status === 'Pending');
        break;
      case 'accepted':
        filtered = filtered.filter(app => app.status === 'Accepted');
        break;
      case 'denied':
        filtered = filtered.filter(app => app.status === 'Denied');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }
    
    // Apply additional filters
    if (filters.scholarshipId) {
      filtered = filtered.filter(app => app.scholarship?._id === filters.scholarshipId);
    }
    
    return filtered;
  };

  const getTabCount = (status) => {
    return (Array.isArray(applications) ? applications : []).filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error Loading Applications</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchApplications}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const safeApplications = Array.isArray(applications) ? applications : [];

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Applications Management</h2>
            <div className="btn-group">
              <button 
                className="btn btn-warning"
                onClick={() => setActiveTab('pending')}
                title="View Pending Applications"
              >
                <i className="fas fa-clock me-2"></i>
                Pending ({getTabCount('Pending')})
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={fetchStats}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Refresh Stats
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className={`card text-center ${activeTab === 'all' ? 'border-primary' : ''}`}>
                <div className="card-body">
                  <h3 className="text-primary">{stats.totalApplications || 0}</h3>
                  <p className="mb-0">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card text-center ${activeTab === 'pending' ? 'border-warning' : ''}`}>
                <div className="card-body">
                  <h3 className="text-warning">{stats.pendingApplications || 0}</h3>
                  <p className="mb-0">Pending Review</p>
                  {activeTab === 'pending' && (
                    <small className="text-warning">Currently viewing</small>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card text-center ${activeTab === 'accepted' ? 'border-success' : ''}`}>
                <div className="card-body">
                  <h3 className="text-success">{stats.acceptedApplications || 0}</h3>
                  <p className="mb-0">Accepted</p>
                  {activeTab === 'accepted' && (
                    <small className="text-success">Currently viewing</small>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card text-center ${activeTab === 'denied' ? 'border-danger' : ''}`}>
                <div className="card-body">
                  <h3 className="text-danger">{stats.deniedApplications || 0}</h3>
                  <p className="mb-0">Denied</p>
                  {activeTab === 'denied' && (
                    <small className="text-danger">Currently viewing</small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Tab Summary */}
          {activeTab !== 'all' && (
            <div className="alert alert-info mb-4">
              <div className="row">
                <div className="col-md-4">
                  <strong>Current View:</strong> 
                  {activeTab === 'pending' && ' Pending Applications'}
                  {activeTab === 'accepted' && ' Accepted Applications'}
                  {activeTab === 'denied' && ' Denied Applications'}
                </div>
                <div className="col-md-4">
                  <strong>Showing:</strong> {getFilteredApplications().length} applications
                </div>
                <div className="col-md-4">
                  <strong>Total:</strong> {safeApplications.length} applications
                </div>
              </div>
            </div>
          )}

          {/* Status Tabs */}
          <div className="card mb-4">
            <div className="card-body">
              <ul className="nav nav-tabs nav-fill" id="applicationTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                    type="button"
                    role="tab"
                  >
                    <i className="fas fa-list me-2"></i>
                    All Applications
                    <span className="badge bg-secondary ms-2">{safeApplications.length}</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                    type="button"
                    role="tab"
                  >
                    <i className="fas fa-clock me-2"></i>
                    Pending Review
                    <span className="badge bg-warning ms-2">{getTabCount('Pending')}</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'accepted' ? 'active' : ''}`}
                    onClick={() => setActiveTab('accepted')}
                    type="button"
                    role="tab"
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    Accepted
                    <span className="badge bg-success ms-2">{getTabCount('Accepted')}</span>
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'denied' ? 'active' : ''}`}
                    onClick={() => setActiveTab('denied')}
                    type="button"
                    role="tab"
                  >
                    <i className="fas fa-times-circle me-2"></i>
                    Denied
                    <span className="badge bg-danger ms-2">{getTabCount('Denied')}</span>
                  </button>
                </li>
              </ul>
              
              {/* Additional Filters */}
              <div className="row mt-3">
                <div className="col-md-6">
                  <label className="form-label">Filter by Scholarship</label>
                  <select
                    className="form-select"
                    value={filters.scholarshipId}
                    onChange={(e) => setFilters(prev => ({ ...prev, scholarshipId: e.target.value }))}
                  >
                    <option value="">All Scholarships</option>
                    {/* This would be populated with actual scholarship options */}
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setFilters({ status: '', scholarshipId: '' });
                      setActiveTab('all');
                    }}
                  >
                    <i className="fas fa-undo me-2"></i>
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="card">
            <div className="card-header">
              <h5>
                {activeTab === 'all' && 'All Applications'}
                {activeTab === 'pending' && 'Pending Applications'}
                {activeTab === 'accepted' && 'Accepted Applications'}
                {activeTab === 'denied' && 'Denied Applications'}
                <span className="badge bg-primary ms-2">{getFilteredApplications().length}</span>
              </h5>
            </div>
            <div className="card-body">
              {getFilteredApplications().length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="fas fa-inbox fa-3x text-muted"></i>
                  </div>
                  <h4>No Applications Found</h4>
                  <p className="text-muted">
                    {activeTab === 'all' && 'No applications found in the system.'}
                    {activeTab === 'pending' && 'No pending applications to review.'}
                    {activeTab === 'accepted' && 'No accepted applications found.'}
                    {activeTab === 'denied' && 'No denied applications found.'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Scholarship</th>
                        <th>Amount</th>
                        <th>Applied</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredApplications().map((application) => (
                        <tr key={application._id}>
                          <td>
                            <div>
                              <strong>{application.student?.name || 'N/A'}</strong>
                              <br />
                              <small className="text-muted">{application.student?.email || 'N/A'}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{application.scholarship?.title || 'N/A'}</strong>
                              <br />
                              <small className="text-muted">{application.scholarship?.organization || 'N/A'}</small>
                            </div>
                          </td>
                          <td>
                            <strong>{formatAmount(application.scholarship?.amount || 0)}</strong>
                          </td>
                          <td>
                            <small>{formatDate(application.appliedAt)}</small>
                          </td>
                          <td>
                            {getStatusBadge(application.status)}
                          </td>
                          <td>
                            <div className="btn-group">
                              {application.status === 'Pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => {
                                      setReviewData({ status: 'Accepted', adminNotes: '' });
                                      openReviewModal(application);
                                    }}
                                    title="Accept Application"
                                  >
                                    <i className="fas fa-check"></i> Accept
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => {
                                      setReviewData({ status: 'Denied', adminNotes: '' });
                                      openReviewModal(application);
                                    }}
                                    title="Deny Application"
                                  >
                                    <i className="fas fa-times"></i> Deny
                                  </button>
                                </>
                              )}
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openReviewModal(application)}
                                title="Review Application"
                              >
                                <i className="fas fa-eye"></i> Review
                              </button>
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => {
                                  alert('View full application details');
                                }}
                                title="View Details"
                              >
                                <i className="fas fa-info-circle"></i> Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedApplication && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Review Application</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Student Information</h6>
                    <p><strong>Name:</strong> {selectedApplication.student?.name}</p>
                    <p><strong>Email:</strong> {selectedApplication.student?.email}</p>
                    <p><strong>GPA:</strong> {selectedApplication.gpa}</p>
                    <p><strong>Academic Level:</strong> {selectedApplication.academicLevel}</p>
                    <p><strong>Citizenship:</strong> {selectedApplication.citizenship}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Scholarship Information</h6>
                    <p><strong>Title:</strong> {selectedApplication.scholarship?.title}</p>
                    <p><strong>Organization:</strong> {selectedApplication.scholarship?.organization}</p>
                    <p><strong>Amount:</strong> {formatAmount(selectedApplication.scholarship?.amount)}</p>
                    <p><strong>Applied:</strong> {formatDate(selectedApplication.appliedAt)}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h6>Personal Statement</h6>
                  <div className="p-3 bg-light rounded">
                    {selectedApplication.personalStatement}
                  </div>
                </div>

                <div className="mt-3">
                  <h6>Review Decision</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={reviewData.status}
                        onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Denied">Denied</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="form-label">Admin Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={reviewData.adminNotes}
                      onChange={(e) => setReviewData(prev => ({ ...prev, adminNotes: e.target.value }))}
                      placeholder="Add notes about your decision..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStatusUpdate(selectedApplication._id)}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default AdminApplications; 