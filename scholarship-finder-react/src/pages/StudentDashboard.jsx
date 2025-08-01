import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    savedScholarships: 0,
    recommendations: 0,
    alerts: 0
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [recentDocuments, setRecentDocuments] = useState([]);

  useEffect(() => {
    // Mock data - in a real app, this would fetch from the API
    setStats({
      applications: 5,
      savedScholarships: 12,
      recommendations: 8,
      alerts: 3
    });
    
    // Fetch recent documents
    fetchRecentDocuments();
  }, []);

  const fetchRecentDocuments = async () => {
    try {
      const response = await axios.get('/api/documents/my');
      setRecentDocuments(response.data.slice(0, 5)); // Show last 5 documents
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await axios.get('/api/documents/test');
      console.log('API test response:', response.data);
      alert('API connection successful!');
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      alert('API connection failed. Please check backend.');
      return false;
    }
  };

  const dashboardCards = [
    {
      title: 'My Applications',
      count: stats.applications,
      icon: '📝',
      color: 'primary',
      link: '/applications',
      description: 'Track your scholarship applications'
    },
    {
      title: 'Saved Scholarships',
      count: stats.savedScholarships,
      icon: '💾',
      color: 'success',
      link: '/scholarships',
      description: 'View your saved opportunities'
    },
    {
      title: 'Recommendations',
      count: stats.recommendations,
      icon: '🎯',
      color: 'info',
      link: '/recommendations',
      description: 'Personalized scholarship matches'
    },
    {
      title: 'New Alerts',
      count: stats.alerts,
      icon: '🔔',
      color: 'warning',
      link: '/alerts',
      description: 'Stay updated with notifications'
    }
  ];

  const quickActions = [
    { name: 'Find Scholarships', icon: '🔍', link: '/scholarships' },
    { name: 'Check Eligibility', icon: '✅', link: '/eligibility' },
    { name: 'Upload Documents', icon: '📄', action: 'upload' },
    { name: 'Get Help', icon: '💬', link: '/chatbot' }
  ];

  const handleUploadDocuments = async () => {
    setShowUploadModal(true);
    setUploadError('');
    
    // Test API connection first
    const isConnected = await testApiConnection();
    if (!isConnected) {
      setUploadError('Cannot connect to server. Please check if the backend is running.');
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    setUploading(true);
    setUploadError('');

    try {
      console.log('Starting file upload...');
      console.log('Files to upload:', files);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
        console.log('Added file to FormData:', file.name, file.type, file.size);
      });

      console.log('FormData created, sending request...');
      console.log('Auth header:', axios.defaults.headers.common['Authorization']);

      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      setUploadedFiles(prev => [...prev, ...response.data.files]);
      alert('Documents uploaded successfully!');
      setShowUploadModal(false);
      fetchRecentDocuments(); // Refresh the documents list
    } catch (error) {
      console.error('Upload error details:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setUploadError(`Failed to upload documents: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.action === 'upload') {
      handleUploadDocuments();
    }
  };


  return (
    <div className="container-fluid">


      {/* Welcome Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h2 className="mb-2">Welcome back, {user?.name || 'Student'}! 👋</h2>
                  <p className="mb-0">Ready to find your next scholarship opportunity?</p>
                </div>
                <div className="col-md-4 text-end">
                  <div className="fs-1">🎓</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {dashboardCards.map((card, index) => (
          <div key={index} className="col-md-3 col-sm-6 mb-3">
            <div className={`card border-${card.color} h-100`}>
              <div className="card-body text-center">
                <div className="fs-1 mb-2">{card.icon}</div>
                <h3 className="text-primary mb-1">{card.count}</h3>
                <h6 className="card-title">{card.title}</h6>
                <p className="card-text small text-muted">{card.description}</p>
                <Link to={card.link} className={`btn btn-outline-${card.color} btn-sm`}>
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {quickActions.map((action, index) => (
                  <div key={index} className="col-md-3 col-sm-6 mb-3">
                    {action.link ? (
                      <Link to={action.link} className="text-decoration-none">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body text-center">
                            <div className="fs-2 mb-2">{action.icon}</div>
                            <h6 className="card-title text-dark">{action.name}</h6>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => handleQuickAction(action)}
                        className="btn btn-link text-decoration-none p-0"
                        style={{ border: 'none', background: 'none' }}
                      >
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body text-center">
                            <div className="fs-2 mb-2">{action.icon}</div>
                            <h6 className="card-title text-dark">{action.name}</h6>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Applications</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Merit Scholarship Program</h6>
                    <small className="text-muted">Applied 2 days ago</small>
                  </div>
                  <span className="badge bg-warning">Pending</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">STEM Excellence Award</h6>
                    <small className="text-muted">Applied 1 week ago</small>
                  </div>
                  <span className="badge bg-success">Submitted</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Community Service Grant</h6>
                    <small className="text-muted">Applied 2 weeks ago</small>
                  </div>
                  <span className="badge bg-info">Under Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Deadlines</h5>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                Upload New
              </button>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Academic Excellence Scholarship</h6>
                    <small className="text-muted">Due in 3 days</small>
                  </div>
                  <span className="badge bg-danger">Urgent</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Leadership Development Grant</h6>
                    <small className="text-muted">Due in 1 week</small>
                  </div>
                  <span className="badge bg-warning">Soon</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">International Student Fund</h6>
                    <small className="text-muted">Due in 2 weeks</small>
                  </div>
                  <span className="badge bg-info">Planning</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Documents</h5>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                Upload New
              </button>
            </div>
            <div className="card-body">
              {recentDocuments.length > 0 ? (
                <div className="list-group list-group-flush">
                  {recentDocuments.map((doc) => (
                    <div key={doc._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{doc.name}</h6>
                        <small className="text-muted">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB • {new Date(doc.uploadDate).toLocaleDateString()}
                        </small>
                      </div>
                      <div>
                        <span className={`badge bg-${
                          doc.category === 'transcript' ? 'primary' :
                          doc.category === 'personal_statement' ? 'success' :
                          doc.category === 'recommendation' ? 'warning' :
                          doc.category === 'resume' ? 'info' :
                          'secondary'
                        }`}>
                          {doc.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <div className="fs-1 mb-2">📄</div>
                  <p>No documents uploaded yet</p>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload Your First Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Documents</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                ></button>
              </div>
              <div className="modal-body">
                {uploadError && (
                  <div className="alert alert-danger" role="alert">
                    {uploadError}
                  </div>
                )}
                
                <div className="mb-4">
                  <h6>Supported Document Types:</h6>
                  <ul className="list-unstyled">
                    <li>📄 Academic Transcripts (PDF, DOC, DOCX)</li>
                    <li>📝 Personal Statements (PDF, DOC, DOCX)</li>
                    <li>📋 Letters of Recommendation (PDF, DOC, DOCX)</li>
                    <li>📊 Resume/CV (PDF, DOC, DOCX)</li>
                    <li>🆔 ID Documents (PDF, JPG, PNG)</li>
                    <li>📈 Financial Documents (PDF, JPG, PNG)</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <label htmlFor="fileUpload" className="form-label">
                    Select Documents to Upload
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="fileUpload"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <div className="form-text">
                    You can select multiple files. Maximum file size: 10MB per file.
                  </div>
                </div>

                {uploading && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Uploading...</span>
                    </div>
                    <p className="mt-2">Uploading documents...</p>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="mb-4">
                    <h6>Recently Uploaded Files:</h6>
                    <div className="list-group">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{file.name}</strong>
                            <br />
                            <small className="text-muted">
                              {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                            </small>
                          </div>
                          <span className="badge bg-success">Uploaded</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-info me-2" 
                  onClick={testApiConnection}
                  disabled={uploading}
                >
                  Test Connection
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => document.getElementById('fileUpload').click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Choose Files'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard; 