import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ApplicationForm = () => {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    personalStatement: '',
    gpa: '',
    citizenship: '',
    enrollmentStatus: 'Full-time',
    academicLevel: '',
    phoneNumber: '',
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    fetchScholarship();
  }, [scholarshipId]);

  const fetchScholarship = async () => {
    try {
      const response = await axios.get(`/api/scholarships/${scholarshipId}`);
      setScholarship(response.data);
    } catch (error) {
      setError('Failed to load scholarship details');
    } finally {
      setLoading(false);
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
    setSubmitting(true);
    setError(null);

    // Check if user is logged in
    if (!user) {
      setError('Please log in to submit an application');
      setSubmitting(false);
      return;
    }

    try {
      console.log('Submitting application for scholarship:', scholarshipId);
      console.log('Form data:', formData);
      
      const response = await axios.post('/api/applications', {
        scholarshipId,
        ...formData
      });

      console.log('Application submission successful:', response.data);
      alert('Application submitted successfully!');
      
      // Navigate to applications page
      console.log('Navigating to /applications');
      navigate('/applications');
    } catch (error) {
      console.error('Application submission error:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        setError('Please log in to submit an application');
      } else if (error.response?.status === 400) {
        setError(error.response?.data?.message || 'Invalid application data');
      } else {
        setError(error.response?.data?.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>Please log in to submit a scholarship application.</p>
          <a href="/login" className="btn btn-primary">Go to Login</a>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Scholarship not found or you don't have permission to view it.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* Scholarship Summary */}
          <div className="card mb-4">
            <div className="card-header">
              <h4>Scholarship Application</h4>
            </div>
            <div className="card-body">
              <h5>{scholarship.title}</h5>
              <p className="text-muted">{scholarship.organization}</p>
              <div className="row">
                <div className="col-md-6">
                  <strong>Amount:</strong> {scholarship.amount !== undefined && scholarship.amount !== null ? `$${Number(scholarship.amount).toLocaleString()}` : 'N/A'}
                </div>
                <div className="col-md-6">
                  <strong>Deadline:</strong> {new Date(scholarship.deadline).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="card">
            <div className="card-header">
              <h5>Application Form</h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Personal Statement */}
                <div className="mb-3">
                  <label htmlFor="personalStatement" className="form-label">
                    Personal Statement *
                  </label>
                  <textarea
                    className="form-control"
                    id="personalStatement"
                    name="personalStatement"
                    rows="6"
                    value={formData.personalStatement}
                    onChange={handleInputChange}
                    required
                    placeholder="Please write a personal statement explaining why you deserve this scholarship, your academic achievements, career goals, and how this scholarship will help you achieve them..."
                  />
                  <div className="form-text">
                    Write a compelling personal statement (500-1000 words recommended)
                  </div>
                </div>

                {/* Academic Information */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="gpa" className="form-label">
                      Current GPA *
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="gpa"
                      name="gpa"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., 3.75"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="academicLevel" className="form-label">
                      Academic Level *
                    </label>
                    <select
                      className="form-select"
                      id="academicLevel"
                      name="academicLevel"
                      value={formData.academicLevel}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="High School Senior">High School Senior</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Graduate">Graduate</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                </div>

                {/* Citizenship and Enrollment */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="citizenship" className="form-label">
                      Citizenship *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="citizenship"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., US Citizen, International Student"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="enrollmentStatus" className="form-label">
                      Enrollment Status *
                    </label>
                    <select
                      className="form-select"
                      id="enrollmentStatus"
                      name="enrollmentStatus"
                      value={formData.enrollmentStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Not Enrolled">Not Enrolled</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="phoneNumber" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., +1 (555) 123-4567"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="emergencyContact" className="form-label">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Name and phone number"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Address *
                  </label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    rows="3"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full address including city, state, and zip code"
                  />
                </div>

                {/* Submit Button */}
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/scholarships')}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>



          {/* Application Guidelines */}
          <div className="card mt-4">
            <div className="card-header">
              <h6>Application Guidelines</h6>
            </div>
            <div className="card-body">
              <ul className="mb-0">
                <li>Ensure all required fields are completed accurately</li>
                <li>Your personal statement should be compelling and well-written</li>
                <li>Provide current and accurate contact information</li>
                <li>Applications will be reviewed by administrators</li>
                <li>You will be notified of the decision via email</li>
                <li>You can track your application status in your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm; 