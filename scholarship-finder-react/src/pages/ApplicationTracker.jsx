import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ApplicationTracker = () => {
  console.log('ApplicationTracker component rendered');
  
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('ApplicationTracker useEffect triggered');
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications for user:', user?.email);
      const response = await axios.get('/api/applications/my');
      console.log('Applications response:', response.data);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'bg-warning', icon: '⏳' },
      'Accepted': { class: 'bg-success', icon: '✅' },
      'Denied': { class: 'bg-danger', icon: '❌' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', icon: '❓' };
    
    return (
      <span className={`badge ${config.class} fs-6`}>
        {config.icon} {status}
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

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your applications...</p>
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

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Applications</h2>
            <a href="/scholarships" className="btn btn-primary">
              Browse More Scholarships
            </a>
          </div>

          {/* Application Statistics */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary">{applications.length}</h3>
                  <p className="mb-0">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-warning">
                    {applications.filter(app => app.status === 'Pending').length}
                  </h3>
                  <p className="mb-0">Pending Review</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-success">
                    {applications.filter(app => app.status === 'Accepted').length}
                  </h3>
                  <p className="mb-0">Accepted</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-danger">
                    {applications.filter(app => app.status === 'Denied').length}
                  </h3>
                  <p className="mb-0">Denied</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {applications.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i className="fas fa-file-alt fa-3x text-muted"></i>
              </div>
              <h4>No Applications Yet</h4>
              <p className="text-muted">
                You haven't applied for any scholarships yet. Start browsing and apply for scholarships that match your profile.
              </p>
              <a href="/scholarships" className="btn btn-primary btn-lg">
                Browse Scholarships
              </a>
            </div>
          ) : (
            <div className="row">
              {applications.map((application) => (
                <div key={application._id} className="col-12 mb-4">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{application.scholarship?.title || 'Unknown Scholarship'}</h5>
                      {getStatusBadge(application.status)}
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-8">
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Organization:</strong> {application.scholarship?.organization || 'N/A'}
                            </div>
                            <div className="col-md-6">
                              <strong>Amount:</strong> {application.scholarship?.amount ? formatAmount(application.scholarship.amount) : 'N/A'}
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Applied:</strong> {formatDate(application.appliedAt)}
                            </div>
                            <div className="col-md-6">
                              <strong>GPA:</strong> {application.gpa}
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Academic Level:</strong> {application.academicLevel}
                            </div>
                            <div className="col-md-6">
                              <strong>Citizenship:</strong> {application.citizenship}
                            </div>
                          </div>
                          
                          {/* Personal Statement Preview */}
                          <div className="mb-3">
                            <strong>Personal Statement:</strong>
                            <div className="mt-2 p-3 bg-light rounded">
                              {application.personalStatement && application.personalStatement.length > 200 
                                ? `${application.personalStatement.substring(0, 200)}...`
                                : application.personalStatement
                              }
                            </div>
                          </div>

                          {/* Admin Notes (if any) */}
                          {application.adminNotes && (
                            <div className="mb-3">
                              <strong>Admin Notes:</strong>
                              <div className="mt-2 p-3 bg-info bg-opacity-10 rounded">
                                {application.adminNotes}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="col-md-4">
                          <div className="card bg-light">
                            <div className="card-body">
                              <h6>Application Details</h6>
                              <ul className="list-unstyled">
                                <li><strong>Status:</strong> {application.status}</li>
                                <li><strong>Enrollment:</strong> {application.enrollmentStatus}</li>
                                <li><strong>Phone:</strong> {application.phoneNumber}</li>
                                {application.adminReviewDate && (
                                  <li><strong>Reviewed:</strong> {formatDate(application.adminReviewDate)}</li>
                                )}
                              </ul>
                              
                              {/* Action Buttons */}
                              <div className="d-grid gap-2">
                                <button 
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => {
                                    // View full application details
                                    alert('Full application details would be shown here');
                                  }}
                                >
                                  View Full Application
                                </button>
                                {application.status === 'Pending' && (
                                  <button 
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => {
                                      alert('Withdraw application feature coming soon');
                                    }}
                                  >
                                    Withdraw Application
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracker; 