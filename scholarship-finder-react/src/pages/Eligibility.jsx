import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Eligibility = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [eligibleScholarships, setEligibleScholarships] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    educationLevel: '',
    gpa: '',
    income: '',
    category: '',
    fieldOfStudy: '',
    location: '',
    age: '',
    gender: '',
    citizenship: '',
    disability: false,
    firstGeneration: false,
    militaryService: false,
    communityService: false,
    leadershipExperience: false,
    researchExperience: false,
    internationalStudent: false
  });

  useEffect(() => {
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        educationLevel: user.education || '',
        fieldOfStudy: user.interests || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  const testApiConnection = async () => {
    try {
      console.log('Testing scholarship API connection...');
      const response = await axios.get('/api/scholarships');
      console.log('API test response:', response.data);
      alert(`API Test: ${response.data.scholarships?.length || 0} scholarships found`);
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      alert('API connection failed. Please check backend.');
      return false;
    }
  };

  const checkEligibility = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // First, get all scholarships
      const scholarshipsResponse = await axios.get('/api/scholarships?limit=1000');
      console.log('Scholarships response:', scholarshipsResponse.data);
      const allScholarships = scholarshipsResponse.data.scholarships || [];
      console.log('All scholarships:', allScholarships);

      // Filter scholarships based on eligibility criteria
      const eligible = allScholarships.filter(scholarship => {
        // Basic education level check (level field)
        if (scholarship.level && scholarship.level !== formData.educationLevel) {
          // Map education levels to scholarship levels
          const levelMapping = {
            'High School': 'Undergraduate',
            "Associate's Degree": 'Undergraduate',
            "Bachelor's Degree": 'Undergraduate',
            "Master's Degree": 'Graduate',
            'Doctorate': 'Graduate'
          };
          const mappedLevel = levelMapping[formData.educationLevel];
          if (mappedLevel && scholarship.level !== mappedLevel) {
            return false;
          }
        }

        // GPA check (from eligibility.gpa)
        if (scholarship.eligibility?.gpa && parseFloat(formData.gpa) < parseFloat(scholarship.eligibility.gpa)) {
          return false;
        }

        // Age check (from eligibility.age)
        if (scholarship.eligibility?.age && parseInt(formData.age) > parseInt(scholarship.eligibility.age)) {
          return false;
        }

        // Citizenship check (from eligibility.citizenship)
        if (scholarship.eligibility?.citizenship && formData.citizenship) {
          const citizenshipMatch = scholarship.eligibility.citizenship.some(citizen => 
            citizen.toLowerCase().includes(formData.citizenship.toLowerCase()) ||
            formData.citizenship.toLowerCase().includes(citizen.toLowerCase())
          );
          if (!citizenshipMatch) {
            return false;
          }
        }

        // Field of study check (field field)
        if (scholarship.field && scholarship.field !== 'All Fields' && formData.fieldOfStudy) {
          const fieldMatch = scholarship.field.toLowerCase().includes(formData.fieldOfStudy.toLowerCase()) ||
                            formData.fieldOfStudy.toLowerCase().includes(scholarship.field.toLowerCase());
          if (!fieldMatch) {
            return false;
          }
        }

        // Category check (category field)
        if (scholarship.category && scholarship.category !== 'General' && formData.category) {
          if (scholarship.category !== formData.category) {
            return false;
          }
        }

        // Country check (for international students)
        if (formData.internationalStudent && scholarship.country) {
          // If user is international student, they should be eligible for international scholarships
          if (scholarship.country === 'United States' && formData.citizenship === 'US Citizen') {
            return false; // US citizens shouldn't get international student scholarships
          }
        }

        return true;
      });

      setEligibleScholarships(eligible);
      
      if (eligible.length > 0) {
        setMessage({ 
          type: 'success', 
          text: `Great! You're eligible for ${eligible.length} scholarship(s).` 
        });
      } else {
        setMessage({ 
          type: 'warning', 
          text: 'No scholarships match your current criteria. Try adjusting your information or check back later for new opportunities.' 
        });
      }

    } catch (error) {
      console.error('Error checking eligibility:', error);
      console.error('Error details:', error.response?.data || error.message);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error checking eligibility. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchPercentage = (scholarship) => {
    let matchScore = 0;
    let totalCriteria = 0;

    // Education level match
    if (scholarship.level) {
      totalCriteria++;
      const levelMapping = {
        'High School': 'Undergraduate',
        "Associate's Degree": 'Undergraduate',
        "Bachelor's Degree": 'Undergraduate',
        "Master's Degree": 'Graduate',
        'Doctorate': 'Graduate'
      };
      const mappedLevel = levelMapping[formData.educationLevel];
      if (mappedLevel && scholarship.level === mappedLevel) matchScore++;
    }

    // GPA match
    if (scholarship.eligibility?.gpa) {
      totalCriteria++;
      if (parseFloat(formData.gpa) >= parseFloat(scholarship.eligibility.gpa)) matchScore++;
    }

    // Field of study match
    if (scholarship.field && scholarship.field !== 'All Fields') {
      totalCriteria++;
      if (formData.fieldOfStudy && scholarship.field.toLowerCase().includes(formData.fieldOfStudy.toLowerCase())) matchScore++;
    }

    // Category match
    if (scholarship.category && scholarship.category !== 'General') {
      totalCriteria++;
      if (scholarship.category === formData.category) matchScore++;
    }

    return totalCriteria > 0 ? Math.round((matchScore / totalCriteria) * 100) : 100;
  };

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (message.type === 'success') {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="card-header">
              <h3 className="mb-0">✅ Eligibility Checker</h3>
              <p className="text-muted mb-0">Find scholarships that match your profile</p>
            </div>
            <div className="card-body">
              {/* Message Display */}
              {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'} alert-dismissible fade show`} role="alert">
                  {message.text}
                  <button type="button" className="btn-close" onClick={clearMessage}></button>
                </div>
              )}

              <form onSubmit={checkEligibility}>
                <div className="row">
                  {/* Basic Information */}
                  <div className="col-md-6 mb-3">
                    <label htmlFor="educationLevel" className="form-label">Education Level *</label>
                    <select
                      className="form-select"
                      id="educationLevel"
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Education Level</option>
                      <option value="High School">High School</option>
                      <option value="Associate's Degree">Associate's Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate">Doctorate</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="gpa" className="form-label">Current GPA</label>
                    <input
                      type="number"
                      className="form-control"
                      id="gpa"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleInputChange}
                      min="0"
                      max="4"
                      step="0.01"
                      placeholder="e.g., 3.5"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="income" className="form-label">Annual Family Income (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="income"
                      name="income"
                      value={formData.income}
                      onChange={handleInputChange}
                      placeholder="e.g., 500000"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="category" className="form-label">Category</label>
                    <select
                      className="form-select"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                      <option value="OBC">OBC (Other Backward Class)</option>
                      <option value="EWS">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="fieldOfStudy" className="form-label">Field of Study</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fieldOfStudy"
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleInputChange}
                      placeholder="e.g., Computer Science, Medicine"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="citizenship" className="form-label">Citizenship</label>
                    <input
                      type="text"
                      className="form-control"
                      id="citizenship"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleInputChange}
                      placeholder="e.g., US Citizen, Indian Citizen"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="age" className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      min="16"
                      max="100"
                      placeholder="e.g., 20"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="gender" className="form-label">Gender</label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Special Criteria */}
                <div className="mb-4">
                  <h5>Special Criteria</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="disability"
                          name="disability"
                          checked={formData.disability}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="disability">
                          Person with Disability
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="firstGeneration"
                          name="firstGeneration"
                          checked={formData.firstGeneration}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="firstGeneration">
                          First Generation Student
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="militaryService"
                          name="militaryService"
                          checked={formData.militaryService}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="militaryService">
                          Military Service
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="communityService"
                          name="communityService"
                          checked={formData.communityService}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="communityService">
                          Community Service Experience
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="leadershipExperience"
                          name="leadershipExperience"
                          checked={formData.leadershipExperience}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="leadershipExperience">
                          Leadership Experience
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="researchExperience"
                          name="researchExperience"
                          checked={formData.researchExperience}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="researchExperience">
                          Research Experience
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="internationalStudent"
                          name="internationalStudent"
                          checked={formData.internationalStudent}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="internationalStudent">
                          International Student
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg me-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Checking Eligibility...
                      </>
                    ) : (
                      '🔍 Check Eligibility'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-info btn-lg"
                    onClick={testApiConnection}
                    disabled={loading}
                  >
                    🧪 Test API
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Results Sidebar */}
        <div className="col-lg-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card"
          >
            <div className="card-header">
              <h5 className="mb-0">🎯 Eligible Scholarships</h5>
            </div>
            <div className="card-body">
              {eligibleScholarships.length === 0 ? (
                <div className="text-center text-muted">
                  <div className="fs-1 mb-3">📋</div>
                  <p>Fill out the form and check your eligibility to see matching scholarships</p>
                </div>
              ) : (
                <div>
                  <div className="alert alert-success mb-3">
                    <strong>Great news!</strong> You're eligible for {eligibleScholarships.length} scholarship(s).
                  </div>
                  {eligibleScholarships.map((scholarship, index) => (
                    <motion.div
                      key={scholarship._id || index}
                      className="card mb-3 border"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title mb-0">{scholarship.title}</h6>
                          <span className={`badge bg-${calculateMatchPercentage(scholarship) >= 80 ? 'success' : calculateMatchPercentage(scholarship) >= 60 ? 'warning' : 'info'}`}>
                            {calculateMatchPercentage(scholarship)}% Match
                          </span>
                        </div>
                        <p className="card-text small text-muted mb-2">
                          {scholarship.description?.substring(0, 100)}...
                        </p>
                        <div className="small text-muted mb-2">
                          <div>💰 Amount: ${scholarship.amount?.toLocaleString() || 'Not specified'}</div>
                          <div>📅 Deadline: {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'Not specified'}</div>
                          <div>🎓 Level: {scholarship.level || 'Not specified'}</div>
                          <div>🌍 Country: {scholarship.country || 'Not specified'}</div>
                        </div>
                        <button className="btn btn-outline-primary btn-sm">
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Eligibility; 