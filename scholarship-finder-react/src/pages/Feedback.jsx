import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Feedback = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('submit');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myQueries, setMyQueries] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'General',
    priority: 'Medium'
  });

  const categories = [
    'General',
    'Technical',
    'Application',
    'Scholarship',
    'Account',
    'Other'
  ];

  const priorities = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];

  useEffect(() => {
    if (user) {
      fetchMyQueries();
    }
  }, [user]);

  const fetchMyQueries = async () => {
    try {
      setLoadingQueries(true);
      const response = await axios.get('/api/feedback');
      setMyQueries(response.data.feedbacks || response.data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoadingQueries(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!user) {
      setError('Please log in to submit a query');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/feedback', formData);
      setSuccess(response.data.message || 'Query submitted successfully!');
      setFormData({
        subject: '',
        message: '',
        category: 'General',
        priority: 'Medium'
      });
      fetchMyQueries(); // Refresh the queries list
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting query');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (query) => {
    setSelectedQuery(query);
    setShowDetailModal(true);
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

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>Please log in to submit queries and view your query history.</p>
          <a href="/login" className="btn btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2>📧 Support & Feedback</h2>
                <p className="text-muted mb-0">Submit queries and track their status</p>
              </div>
              <div className="btn-group">
                <button 
                  className={`btn ${activeTab === 'submit' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('submit')}
                >
                  📝 Submit Query
                </button>
                <button 
                  className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setActiveTab('history')}
                >
                  📋 My Queries ({myQueries.length})
                </button>
              </div>
            </div>

            {activeTab === 'submit' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="card"
              >
                <div className="card-header">
                  <h4 className="mb-0">Submit a Query</h4>
                </div>
                <div className="card-body">
                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="alert alert-success">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label htmlFor="subject" className="form-label">
                            Subject *
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            placeholder="Brief description of your query"
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label htmlFor="category" className="form-label">
                            Category
                          </label>
                          <select
                            className="form-select"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label htmlFor="message" className="form-label">
                            Message *
                          </label>
                          <textarea
                            className="form-control"
                            id="message"
                            name="message"
                            rows="6"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            placeholder="Please provide detailed information about your query..."
                          />
                          <div className="form-text">
                            Be as specific as possible to help us assist you better.
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="mb-3">
                          <label htmlFor="priority" className="form-label">
                            Priority
                          </label>
                          <select
                            className="form-select"
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                          >
                            {priorities.map(priority => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                          <div className="form-text">
                            Select urgency level of your query
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit Query'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="card"
              >
                <div className="card-header">
                  <h4 className="mb-0">My Query History</h4>
                </div>
                <div className="card-body">
                  {loadingQueries ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Loading your queries...</p>
                    </div>
                  ) : myQueries.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="fs-1 mb-3">📭</div>
                      <h5>No queries yet</h5>
                      <p className="text-muted">You haven't submitted any queries yet.</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => setActiveTab('submit')}
                      >
                        Submit Your First Query
                      </button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Subject</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Response</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myQueries.map(query => (
                            <motion.tr 
                              key={query._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ backgroundColor: '#f8f9fa' }}
                            >
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
                                {query.response ? (
                                  <span className="badge bg-success">✅ Replied</span>
                                ) : (
                                  <span className="badge bg-warning">⏳ Pending</span>
                                )}
                              </td>
                              <td>
                                <small>{formatDate(query.createdAt)}</small>
                                <br />
                                <small className="text-muted">{getTimeAgo(query.createdAt)}</small>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => openDetailModal(query)}
                                >
                                  👁️ View Details
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Query Detail Modal */}
      {showDetailModal && selectedQuery && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Query Details</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6>Query Information</h6>
                    <p><strong>Subject:</strong> {selectedQuery.subject}</p>
                    <p><strong>Category:</strong> {selectedQuery.category}</p>
                    <p><strong>Priority:</strong> {getPriorityBadge(selectedQuery.priority)}</p>
                    <p><strong>Status:</strong> {getStatusBadge(selectedQuery.status)}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Timeline</h6>
                    <p><strong>Submitted:</strong> {formatDate(selectedQuery.createdAt)}</p>
                    {selectedQuery.responseDate && (
                      <p><strong>Replied:</strong> {formatDate(selectedQuery.responseDate)}</p>
                    )}
                    <p><strong>Last Updated:</strong> {formatDate(selectedQuery.updatedAt)}</p>
                  </div>
                </div>
                
                <hr />
                
                <div className="mb-3">
                  <h6>Your Message</h6>
                  <div className="border rounded p-3 bg-light">
                    {selectedQuery.message}
                  </div>
                </div>

                {selectedQuery.response ? (
                  <>
                    <hr />
                    <div className="mb-3">
                      <h6>Admin Response</h6>
                      <div className="border rounded p-3 bg-primary text-white">
                        {selectedQuery.response}
                      </div>
                      <small className="text-muted">
                        Replied by: {selectedQuery.adminResponder?.name || 'Admin'} on {formatDate(selectedQuery.responseDate)}
                      </small>
                    </div>
                  </>
                ) : (
                  <>
                    <hr />
                    <div className="alert alert-info">
                      <h6>⏳ Waiting for Response</h6>
                      <p className="mb-0">Your query is being reviewed by our support team. We'll respond as soon as possible.</p>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
                {!selectedQuery.response && (
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setShowDetailModal(false);
                      setActiveTab('submit');
                    }}
                  >
                    Submit New Query
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback; 