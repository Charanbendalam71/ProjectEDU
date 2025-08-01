import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScholarships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalUsers: 0,
    totalQueries: 0,
    openQueries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Welcome, {user.name || 'Admin'}</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mb-4">
        <div className="col-md-2 mb-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{stats.totalScholarships}</h4>
              <p>Scholarships</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{stats.totalApplications}</h4>
              <p>Applications</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h4>{stats.pendingApplications}</h4>
              <p>Pending</p>
            </div>
          </div>
        </div>

        <div className="col-md-2 mb-3">
          <div className="card bg-secondary text-white">
            <div className="card-body text-center">
              <h4>{stats.totalQueries}</h4>
              <p>Queries</p>
            </div>
          </div>
        </div>
        <div className="col-md-2 mb-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h4>{stats.openQueries}</h4>
              <p>Open Queries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Links */}
      <div className="row">
        <div className="col-md-3 mb-3">
          <a href="/admin/applications" className="btn btn-primary w-100 p-3">
            <h5>📋 Applications</h5>
            <small>Manage applications</small>
          </a>
        </div>
        <div className="col-md-3 mb-3">
          <a href="/admin/feedback" className="btn btn-info w-100 p-3">
            <h5>💬 Feedback</h5>
            <small>Handle queries</small>
          </a>
        </div>
        <div className="col-md-3 mb-3">
          <a href="/scholarships" className="btn btn-success w-100 p-3">
            <h5>🎓 Scholarships</h5>
            <small>Manage scholarships</small>
          </a>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard; 