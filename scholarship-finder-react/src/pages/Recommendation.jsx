import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Recommendation = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    category: '',
    academicLevel: '',
    gender: '',
    state: '',
    income: '',
    preferences: [],
    gpa: ''
  });

  // Available options for form
  const categories = ['SC', 'ST', 'OBC', 'General'];
  const academicLevels = ['High School', 'Undergraduate', 'Graduate', 'PhD', 'Postgraduate'];
  const genders = ['Male', 'Female', 'Other'];
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];
  const availablePreferences = [
    'STEM', 'Engineering', 'Computer Science', 'Medicine', 'Arts', 'Commerce',
    'Law', 'Agriculture', 'Environmental Science', 'Social Work', 'Education',
    'Business', 'Economics', 'Psychology', 'Literature', 'Sports'
  ];

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      setError('Please log in to access personalized recommendations.');
      setLoading(false);
    }
  }, [user]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching recommendations...');
      console.log('User:', user);
      
      const response = await axios.get('/api/recommendations');
      console.log('Recommendations response:', response);
      
      setRecommendations(response.data.recommendations || []);
      setUserProfile(response.data.userProfile);
      
      // If user doesn't have a complete profile, show the form
      if (!response.data.userProfile?.category || !response.data.userProfile?.academicLevel) {
        setShowProfileForm(true);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      console.error('Error response:', error.response);
      setError(`Failed to load recommendations: ${error.response?.data?.message || error.message}`);
      setShowProfileForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Convert numeric fields to proper types
      const formData = {
        ...profileForm,
        income: profileForm.income ? parseInt(profileForm.income) : null,
        gpa: profileForm.gpa ? parseFloat(profileForm.gpa) : null
      };
      
      console.log('Submitting profile form:', formData);
      console.log('User:', user);
      
      const response = await axios.put('/api/recommendations/preferences', formData);
      console.log('Profile update response:', response);
      
      setShowProfileForm(false);
      fetchRecommendations(); // Refresh recommendations
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response);
      setError(`Failed to update profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceToggle = (preference) => {
    setProfileForm(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getDaysUntilDeadline = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getUrgencyColor = (deadline) => {
    const days = getDaysUntilDeadline(deadline);
    if (days <= 7) return 'danger';
    if (days <= 30) return 'warning';
    return 'success';
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading personalized recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h2 className="mb-2">🎯 Personalized Scholarship Recommendations</h2>
              <p className="mb-0">Scholarships tailored to your profile and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      {showProfileForm && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h4 className="mb-0">Complete Your Profile for Better Recommendations</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={profileForm.category}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Academic Level</label>
                      <select
                        className="form-select"
                        value={profileForm.academicLevel}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, academicLevel: e.target.value }))}
                        required
                      >
                        <option value="">Select Level</option>
                        {academicLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="">Select Gender</option>
                        {genders.map(gender => (
                          <option key={gender} value={gender}>{gender}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">State</label>
                      <select
                        className="form-select"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Annual Family Income (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={profileForm.income}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, income: e.target.value }))}
                        placeholder="Enter annual income"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">GPA (if applicable)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={profileForm.gpa}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, gpa: e.target.value }))}
                        placeholder="Enter GPA (0-10 scale)"
                        step="0.1"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Areas of Interest (Select all that apply)</label>
                    <div className="row">
                      {availablePreferences.map(pref => (
                        <div key={pref} className="col-md-3 mb-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={pref}
                              checked={profileForm.preferences.includes(pref)}
                              onChange={() => handlePreferenceToggle(pref)}
                            />
                            <label className="form-check-label" htmlFor={pref}>
                              {pref}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Profile & Get Recommendations'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Summary */}
      {userProfile && !showProfileForm && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Your Profile</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-2">
                    <strong>Category:</strong> {userProfile.category || 'Not set'}
                  </div>
                  <div className="col-md-2">
                    <strong>Level:</strong> {userProfile.academicLevel || 'Not set'}
                  </div>
                  <div className="col-md-2">
                    <strong>Gender:</strong> {userProfile.gender || 'Not set'}
                  </div>
                  <div className="col-md-2">
                    <strong>State:</strong> {userProfile.state || 'Not set'}
                  </div>
                  <div className="col-md-2">
                    <strong>Income:</strong> {userProfile.income ? `₹${userProfile.income}` : 'Not set'}
                  </div>
                  <div className="col-md-2">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setShowProfileForm(true)}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="row">
          <div className="col-12">
            <h4 className="mb-3">Top Recommendations for You ({recommendations.length})</h4>
            <div className="row">
              {recommendations.map((scholarship) => (
                <div key={scholarship._id} className="col-lg-6 col-md-12 mb-4">
                  <div className="card h-100 border-primary">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <span className={`badge bg-${getUrgencyColor(scholarship.deadline)}`}>
                        {getDaysUntilDeadline(scholarship.deadline)} days left
                      </span>
                      <div className="dropdown">
                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          Actions
                        </button>
                        <ul className="dropdown-menu">
                          <li><button className="dropdown-item" onClick={() => window.open(scholarship.applicationUrl, '_blank')}>
                            📝 Apply Now
                          </button></li>
                          <li><button className="dropdown-item" onClick={() => window.open(scholarship.applicationUrl, '_blank')}>
                            🌐 Visit Website
                          </button></li>
                        </ul>
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{scholarship.title}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{scholarship.organization}</h6>
                      <p className="card-text">{scholarship.description.substring(0, 150)}...</p>
                      
                      <div className="mb-3">
                        <span className="badge bg-primary me-1">{scholarship.field}</span>
                        <span className="badge bg-secondary me-1">{scholarship.level}</span>
                        <span className="badge bg-info">{scholarship.country}</span>
                      </div>

                      <div className="row text-center mb-3">
                        <div className="col-6">
                          <strong className="text-success fs-5">{formatAmount(scholarship.amount)}</strong>
                          <div className="small text-muted">Award Amount</div>
                        </div>
                        <div className="col-6">
                          <strong className="text-warning fs-5">{formatDate(scholarship.deadline)}</strong>
                          <div className="small text-muted">Deadline</div>
                        </div>
                      </div>

                      {/* Recommendation Score and Reasons */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>Match Score: {scholarship.recommendationScore}%</strong>
                          <div className="progress" style={{ width: '60%' }}>
                            <div 
                              className="progress-bar bg-success" 
                              style={{ width: `${Math.min(scholarship.recommendationScore, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="small text-muted">
                          <strong>Why this matches:</strong>
                          <ul className="mb-0 mt-1">
                            {scholarship.reasons.map((reason, index) => (
                              <li key={index}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="d-grid">
                        <button 
                          className="btn btn-primary"
                          onClick={() => window.open(scholarship.applicationUrl, '_blank')}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Recommendations or Not Logged In */}
      {recommendations.length === 0 && !showProfileForm && !loading && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center">
                <div className="fs-1 mb-3">🔍</div>
                <h4>{!user ? 'Login Required' : 'No Recommendations Found'}</h4>
                <p className="text-muted">
                  {!user 
                    ? 'Please log in to access personalized scholarship recommendations.'
                    : 'Complete your profile to get personalized scholarship recommendations.'
                  }
                </p>
                {!user ? (
                  <a href="/login" className="btn btn-primary">
                    Login
                  </a>
                ) : (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowProfileForm(true)}
                  >
                    Complete Profile
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

export default Recommendation; 