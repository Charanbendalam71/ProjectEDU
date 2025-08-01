import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminFeedback = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showQueryDetailModal, setShowQueryDetailModal] = useState(false);
  const [responseData, setResponseData] = useState({
    response: '',
    status: 'Closed'
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchQueries();
    fetchStats();
  }, [filters, searchTerm, sortBy, sortOrder]);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      if (searchTerm) params.append('search', searchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      const response = await axios.get(`/api/feedback?${params}`);
      setQueries(response.data.feedbacks || response.data);
    } catch (error) {
      setError('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/feedback/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const openResponseModal = (query) => {
    setSelectedQuery(query);
    setResponseData({
      response: query.response || '',
      status: query.status === 'Open' ? 'In Progress' : query.status
    });
    setShowResponseModal(true);
  };

  const openQueryDetailModal = (query) => {
    setSelectedQuery(query);
    setShowQueryDetailModal(true);
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await axios.put(`/api/feedback/${selectedQuery._id}/respond`, responseData);
      
      // Update the query in the list
      setQueries(prev => prev.map(q => 
        q._id === selectedQuery._id ? response.data.feedback : q
      ));
      
      setShowResponseModal(false);
      setSelectedQuery(null);
      setResponseData({ response: '', status: 'Closed' });
      
      // Refresh stats
      fetchStats();
      
      alert('Response sent successfully!');
    } catch (error) {
      alert('Failed to send response: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (queryId, newStatus) => {
    try {
      await axios.put(`/api/feedback/${queryId}/status`, { status: newStatus });
      fetchQueries();
      fetchStats();
    } catch (error) {
      alert('Failed to update status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBulkAction = async (action, selectedIds) => {
    try {
      if (action === 'close') {
        await Promise.all(selectedIds.map(id => 
          axios.put(`/api/feedback/${id}/status`, { status: 'Closed' })
        ));
      }
      fetchQueries();
      fetchStats();
      alert('Bulk action completed successfully!');
    } catch (error) {
      alert('Failed to perform bulk action: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Open': { class: 'bg-warning', icon: '⏳' },
      'In Progress': { class: 'bg-info', icon: '🔄' },
      'Closed': { class: 'bg-success', icon: '✅' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', icon: '❓' };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'Low': { class: 'bg-success', icon: '🟢' },
      'Medium': { class: 'bg-warning', icon: '🟡' },
      'High': { class: 'bg-danger', icon: '🔴' },
      'Urgent': { class: 'bg-danger', icon: '🚨' }
    };
    
    const config = priorityConfig[priority] || { class: 'bg-secondary', icon: '❓' };
    
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {priority}
      </span>
    );
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

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading queries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error Loading Queries</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchQueries}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
                         <div className="d-flex justify-content-between align-items-center mb-4">
               <div>
                 <h2>📧 Support & Feedback Management</h2>
                 <p className="text-muted mb-0">Respond to student queries and manage support tickets</p>
               </div>
              <div className="btn-group">
                <button 
                  className="btn btn-outline-primary"
                  onClick={fetchStats}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </button>
                <button 
                  className="btn btn-outline-success"
                  onClick={() => window.print()}
                >
                  <i className="fas fa-print me-2"></i>
                  Print Report
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
              <div className="col-md-3">
                <motion.div 
                  className="card text-center border-primary"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-body">
                    <h3 className="text-primary">{stats.totalQueries || 0}</h3>
                    <p className="mb-0">Total Queries</p>
                  </div>
                </motion.div>
              </div>
              <div className="col-md-3">
                <motion.div 
                  className="card text-center border-warning"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-body">
                    <h3 className="text-warning">{stats.openQueries || 0}</h3>
                    <p className="mb-0">Open Queries</p>
                  </div>
                </motion.div>
              </div>
              <div className="col-md-3">
                <motion.div 
                  className="card text-center border-info"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-body">
                    <h3 className="text-info">{stats.inProgressQueries || 0}</h3>
                    <p className="mb-0">In Progress</p>
                  </div>
                </motion.div>
              </div>
              <div className="col-md-3">
                <motion.div 
                  className="card text-center border-success"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="card-body">
                    <h3 className="text-success">{stats.closedQueries || 0}</h3>
                    <p className="mb-0">Closed</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label">Search Queries</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by subject, student name, or message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Status</label>
                    <select 
                      className="form-select"
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="General">General</option>
                      <option value="Technical">Technical</option>
                      <option value="Application">Application</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Account">Account</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Priority</label>
                    <select 
                      className="form-select"
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                      <option value="">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Sort By</label>
                    <select 
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="createdAt">Date</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col-12">
                    <button 
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setFilters({ status: '', category: '', priority: '' })}
                    >
                      Clear Filters
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => {
                        const openQueries = queries.filter(q => q.status === 'Open').map(q => q._id);
                        if (openQueries.length > 0) {
                          if (confirm(`Close ${openQueries.length} open queries?`)) {
                            handleBulkAction('close', openQueries);
                          }
                        }
                      }}
                    >
                      Close All Open Queries
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Queries Table */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Student Queries ({queries.length})</h5>
              </div>
              <div className="card-body">
                {queries.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="fs-1 mb-3">📭</div>
                    <h5>No queries found</h5>
                    <p className="text-muted">No queries match the current filters.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Student</th>
                          <th>Subject</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Response</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queries.map(query => (
                          <motion.tr 
                            key={query._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileHover={{ backgroundColor: '#f8f9fa' }}
                          >
                            <td>
                              <strong>{query.user?.name || 'Unknown'}</strong>
                              <br />
                              <small className="text-muted">{query.user?.email}</small>
                            </td>
                            <td>
                              <strong>{query.subject}</strong>
                              <br />
                              <small className="text-muted">
                                {query.message.substring(0, 50)}...
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-secondary">
                                {query.category}
                              </span>
                            </td>
                            <td>
                              {getPriorityBadge(query.priority)}
                            </td>
                            <td>
                              {getStatusBadge(query.status)}
                            </td>
                            <td>
                              <small>{formatDate(query.createdAt)}</small>
                              <br />
                              <small className="text-muted">{getTimeAgo(query.createdAt)}</small>
                            </td>
                            <td>
                              {query.response ? (
                                <span className="badge bg-success">✅ Replied</span>
                              ) : (
                                <span className="badge bg-warning">⏳ Pending</span>
                              )}
                            </td>
                            <td>
                              <div className="btn-group">
                                <button 
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => openQueryDetailModal(query)}
                                  title="View Details"
                                >
                                  👁️ View
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openResponseModal(query)}
                                  disabled={query.status === 'Closed'}
                                  title={query.response ? 'Update Response' : 'Reply'}
                                >
                                  {query.response ? '✏️ Edit' : '💬 Reply'}
                                </button>
                                <select 
                                  className="form-select form-select-sm"
                                  value={query.status}
                                  onChange={(e) => handleStatusUpdate(query._id, e.target.value)}
                                  style={{ width: 'auto' }}
                                >
                                  <option value="Open">Open</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Closed">Closed</option>
                                </select>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {selectedQuery?.response ? 'Update Response' : 'Reply to Query'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowResponseModal(false)}
                ></button>
              </div>
              <form onSubmit={handleResponseSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Student</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={selectedQuery?.user?.name || 'Unknown'} 
                          readOnly 
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={selectedQuery?.user?.email || 'Unknown'} 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Subject</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={selectedQuery?.subject} 
                      readOnly 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Original Message</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      value={selectedQuery?.message} 
                      readOnly 
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Your Response to Student *</label>
                    <textarea 
                      className="form-control" 
                      rows="6" 
                      value={responseData.response}
                      onChange={(e) => setResponseData(prev => ({ ...prev, response: e.target.value }))}
                      required
                      placeholder="Provide a helpful and professional response to the student's query..."
                    />
                    <div className="form-text">
                      <strong>Admin Response:</strong> This response will be sent to the student and stored for future reference. Be professional and helpful.
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Status</label>
                        <select 
                          className="form-select"
                          value={responseData.status}
                          onChange={(e) => setResponseData(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Priority</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={selectedQuery?.priority} 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowResponseModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Response'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Query Detail Modal */}
      {showQueryDetailModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">Query Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowQueryDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Student Information</h6>
                    <p><strong>Name:</strong> {selectedQuery?.user?.name || 'Unknown'}</p>
                    <p><strong>Email:</strong> {selectedQuery?.user?.email || 'Unknown'}</p>
                    <p><strong>Submitted:</strong> {formatDate(selectedQuery?.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Query Information</h6>
                    <p><strong>Category:</strong> {selectedQuery?.category}</p>
                    <p><strong>Priority:</strong> {getPriorityBadge(selectedQuery?.priority)}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedQuery?.status)}</p>
                  </div>
                </div>
                <hr />
                <div className="mb-3">
                  <h6>Subject</h6>
                  <p className="fw-bold">{selectedQuery?.subject}</p>
                </div>
                <div className="mb-3">
                  <h6>Message</h6>
                  <div className="border rounded p-3 bg-light">
                    {selectedQuery?.message}
                  </div>
                </div>
                {selectedQuery?.response && (
                  <>
                    <hr />
                    <div className="mb-3">
                      <h6>Admin Response</h6>
                      <div className="border rounded p-3 bg-primary text-white">
                        {selectedQuery?.response}
                      </div>
                      <small className="text-muted">
                        Replied by: {selectedQuery?.adminResponder?.name || 'Admin'} on {formatDate(selectedQuery?.responseDate)}
                      </small>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowQueryDetailModal(false)}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowQueryDetailModal(false);
                    openResponseModal(selectedQuery);
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback; 