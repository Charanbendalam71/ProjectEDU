import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Alerts = () => {
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Generate sample alerts for demonstration
    generateSampleAlerts();
  }, []);

  const generateSampleAlerts = () => {
    const sampleAlerts = [
      {
        id: 1,
        type: 'deadline',
        priority: 'high',
        title: 'Deadline Approaching!',
        message: 'Merit Scholarship for Engineering Excellence closes in 2 days',
        scholarship: 'Merit Scholarship for Engineering Excellence',
        deadline: '2024-01-15',
        daysLeft: 2,
        isRead: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: '⏰',
        color: 'danger'
      },
      {
        id: 2,
        type: 'new_scholarship',
        priority: 'medium',
        title: 'New Scholarship Available',
        message: 'Women in Technology Scholarship is now open for applications',
        scholarship: 'Women in Technology Scholarship',
        deadline: '2024-02-28',
        daysLeft: 45,
        isRead: false,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        icon: '🎯',
        color: 'primary'
      },
      {
        id: 3,
        type: 'application_status',
        priority: 'medium',
        title: 'Application Status Updated',
        message: 'Your application for STEM Excellence Award is under review',
        scholarship: 'STEM Excellence Award',
        status: 'Under Review',
        isRead: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        icon: '📋',
        color: 'info'
      },
      {
        id: 4,
        type: 'deadline',
        priority: 'medium',
        title: 'Deadline Reminder',
        message: 'Community Service Grant closes in 1 week',
        scholarship: 'Community Service Grant',
        deadline: '2024-01-22',
        daysLeft: 7,
        isRead: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        icon: '⏰',
        color: 'warning'
      },
      {
        id: 5,
        type: 'recommendation',
        priority: 'low',
        title: 'Personalized Recommendation',
        message: 'Based on your profile, you might be eligible for 3 new scholarships',
        scholarship: 'Multiple Scholarships',
        count: 3,
        isRead: false,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        icon: '💡',
        color: 'success'
      },
      {
        id: 6,
        type: 'document_reminder',
        priority: 'high',
        title: 'Document Upload Required',
        message: 'Please upload your latest academic transcript for pending applications',
        scholarship: 'Multiple Applications',
        isRead: false,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        icon: '📄',
        color: 'warning'
      },
      {
        id: 7,
        type: 'success',
        priority: 'medium',
        title: 'Congratulations!',
        message: 'Your application for Leadership Development Grant has been approved',
        scholarship: 'Leadership Development Grant',
        status: 'Approved',
        isRead: false,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        icon: '🎉',
        color: 'success'
      },
      {
        id: 8,
        type: 'system',
        priority: 'low',
        title: 'System Update',
        message: 'New features added to the scholarship finder. Check out the improved eligibility checker!',
        isRead: true,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        icon: '🔧',
        color: 'secondary'
      }
    ];

    setAlerts(sampleAlerts);
  };

  const markAsRead = (alertId) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert => ({ ...alert, isRead: true }))
    );
  };

  const deleteAlert = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  const getFilteredAlerts = () => {
    switch (selectedFilter) {
      case 'unread':
        return alerts.filter(alert => !alert.isRead);
      case 'deadline':
        return alerts.filter(alert => alert.type === 'deadline');
      case 'high_priority':
        return alerts.filter(alert => alert.priority === 'high');
      default:
        return alerts;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const filteredAlerts = getFilteredAlerts();

  return (
    <div className="container-fluid">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card mb-4"
      >
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-0">🔔 Alerts & Notifications</h3>
            <p className="text-muted mb-0">Stay updated with important scholarship information</p>
          </div>
          <div className="d-flex gap-2">
            {unreadCount > 0 && (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </button>
            )}
            <span className="badge bg-danger fs-6">
              {unreadCount} New
            </span>
          </div>
        </div>
        <div className="card-body">
          {/* Statistics */}
          <div className="row text-center mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h4>{alerts.length}</h4>
                  <p className="mb-0">Total Alerts</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger text-white">
                <div className="card-body">
                  <h4>{alerts.filter(a => a.priority === 'high').length}</h4>
                  <p className="mb-0">High Priority</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h4>{alerts.filter(a => a.type === 'deadline').length}</h4>
                  <p className="mb-0">Deadlines</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h4>{alerts.filter(a => a.type === 'success').length}</h4>
                  <p className="mb-0">Success</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-4">
            <h5>Filter Alerts:</h5>
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn ${selectedFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                onClick={() => setSelectedFilter('all')}
              >
                📋 All ({alerts.length})
              </button>
              <button
                className={`btn ${selectedFilter === 'unread' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                onClick={() => setSelectedFilter('unread')}
              >
                🔴 Unread ({unreadCount})
              </button>
              <button
                className={`btn ${selectedFilter === 'deadline' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                onClick={() => setSelectedFilter('deadline')}
              >
                ⏰ Deadlines ({alerts.filter(a => a.type === 'deadline').length})
              </button>
              <button
                className={`btn ${selectedFilter === 'high_priority' ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                onClick={() => setSelectedFilter('high_priority')}
              >
                🚨 High Priority ({alerts.filter(a => a.priority === 'high').length})
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alerts List */}
      <div className="row">
        <div className="col-12">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card"
              >
                <div className="card-body text-center py-5">
                  <div className="fs-1 mb-3">📭</div>
                  <h4>No alerts to show</h4>
                  <p className="text-muted">You're all caught up! Check back later for new notifications.</p>
                </div>
              </motion.div>
            ) : (
              filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`card mb-3 ${!alert.isRead ? 'border-start border-4 border-danger' : ''}`}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex align-items-start flex-grow-1">
                        <div className={`fs-2 me-3 ${alert.isRead ? 'text-muted' : ''}`}>
                          {alert.icon}
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <h6 className={`mb-0 me-2 ${alert.isRead ? 'text-muted' : ''}`}>
                              {alert.title}
                            </h6>
                            <span className={`badge bg-${getPriorityColor(alert.priority)} me-2`}>
                              {alert.priority.toUpperCase()}
                            </span>
                            {!alert.isRead && (
                              <span className="badge bg-danger">NEW</span>
                            )}
                          </div>
                          <p className={`mb-2 ${alert.isRead ? 'text-muted' : ''}`}>
                            {alert.message}
                          </p>
                          <div className="small text-muted">
                            {alert.scholarship && (
                              <span className="me-3">
                                <strong>Scholarship:</strong> {alert.scholarship}
                              </span>
                            )}
                            {alert.deadline && (
                              <span className="me-3">
                                <strong>Deadline:</strong> {new Date(alert.deadline).toLocaleDateString()}
                                {alert.daysLeft <= 7 && (
                                  <span className="text-danger ms-1">
                                    ({alert.daysLeft} day{alert.daysLeft > 1 ? 's' : ''} left)
                                  </span>
                                )}
                              </span>
                            )}
                            <span>
                              <strong>Time:</strong> {getTimeAgo(alert.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        {!alert.isRead && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => markAsRead(alert.id)}
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => deleteAlert(alert.id)}
                          title="Delete alert"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card mt-4"
      >
        <div className="card-header">
          <h5 className="mb-0">⚡ Quick Actions</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <button className="btn btn-outline-primary w-100">
                🔍 View All Scholarships
              </button>
            </div>
            <div className="col-md-3 mb-3">
              <button className="btn btn-outline-success w-100">
                ✅ Check Eligibility
              </button>
            </div>
            <div className="col-md-3 mb-3">
              <button className="btn btn-outline-warning w-100">
                📄 Upload Documents
              </button>
            </div>
            <div className="col-md-3 mb-3">
              <button className="btn btn-outline-info w-100">
                📊 View Applications
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Alerts; 