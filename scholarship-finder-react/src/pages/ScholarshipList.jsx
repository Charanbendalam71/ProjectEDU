import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ScholarshipList = () => {
  const { user } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    field: '',
    level: '',
    country: '',
    minAmount: '',
    maxAmount: '',
    minGPA: '',
    citizenship: '',
    gender: '',
    category: '',
    state: '',
    search: '',
    sortBy: 'deadline',
    sortOrder: 'asc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalScholarships: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [stats, setStats] = useState({
    totalScholarships: 0,
    totalAmount: 0,
    fields: [],
    levels: [],
    countries: []
  });
  // State for applications
  const [applications, setApplications] = useState([]);
  // Add modal state for admin edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState(null);
  // Add state for create new scholarship modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Add state for search query
  const [searchTitle, setSearchTitle] = useState('');

  useEffect(() => {
    fetchScholarships();
    setStats({
      totalScholarships: 20,
      totalAmount: 1319500,
      fields: ['All Fields', 'Public Service', 'STEM'],
      levels: ['Undergraduate', 'Graduate'],
      countries: ['United States', 'United Kingdom', 'Ireland']
    });
    // Fetch applications if user is logged in and is a student
    if (user && user.role === 'student') {
      fetchApplications();
    }
  }, []);

  useEffect(() => {
    fetchScholarships();
  }, [filters, pagination.currentPage]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/scholarships');
      const scholarshipsData = response.data.scholarships || response.data;
      setScholarships(scholarshipsData);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      setError(`Failed to load scholarships: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications for the logged-in student
  const fetchApplications = async () => {
    try {
      const response = await axios.get('/api/applications/my');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleApply = async (scholarshipId) => {
    if (!user) {
      alert('Please log in to apply for scholarships.');
      return;
    }
    // Navigate to application form
    window.location.href = `/apply/${scholarshipId}`;
  };

  const handleBookmark = async (scholarshipId) => {
    if (!user) {
      alert('Please login to bookmark scholarships. Feature coming soon!');
      return;
    }

    try {
      await axios.post('/api/scholarships/bookmark', { scholarshipId });
      alert('Scholarship bookmarked!');
    } catch (error) {
      console.error('Error bookmarking scholarship:', error);
      alert('Bookmark feature coming soon!');
    }
  };

  const handleOpenEditScholarship = (scholarship) => {
    setEditingScholarship(scholarship);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingScholarship(null);
  };
  
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };
  
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };
  
  const handleCreateScholarship = async (formData) => {
    try {
      // Generate a unique ID for the scholarship
      const uniqueId = 'SCH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Prepare the data with required fields
      const scholarshipData = {
        ...formData,
        id: uniqueId,
        isActive: true,
        // Ensure amount is a number
        amount: Number(formData.amount),
        // Ensure deadline is a proper date
        deadline: new Date(formData.deadline).toISOString(),
        // Convert tags array to proper format
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        // Ensure eligibility object is properly formatted
        eligibility: {
          ...formData.eligibility,
          gpa: formData.eligibility.gpa ? Number(formData.eligibility.gpa) : undefined
        }
      };
      
      await axios.post('/api/scholarships', scholarshipData);
      fetchScholarships();
      handleCloseCreateModal();
      alert('Scholarship created successfully!');
    } catch (error) {
      console.error('Error creating scholarship:', error);
      alert('Error creating scholarship: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleEditScholarshipSubmit = async (formData) => {
    try {
      await axios.put(`/api/scholarships/${editingScholarship._id}`, formData);
      fetchScholarships();
      handleCloseEditModal();
    } catch (error) {
      alert('Error updating scholarship: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteScholarship = async (scholarshipId) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      try {
        await axios.delete(`/api/scholarships/${scholarshipId}`);
        fetchScholarships();
      } catch (error) {
        alert('Error deleting scholarship: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (deadline) => {
    const days = getDaysUntilDeadline(deadline);
    if (days <= 7) return 'danger';
    if (days <= 30) return 'warning';
    return 'success';
  };

  // Add logic to separate scholarships
  // Get applied scholarship IDs (as strings)
  const appliedScholarshipIds = new Set(applications.map(app => String(app.scholarship?._id)));
  const appliedScholarships = scholarships.filter(s => appliedScholarshipIds.has(String(s._id)));
  const availableScholarships = scholarships.filter(s => !appliedScholarshipIds.has(String(s._id)));

  // Enhanced filtering and sorting logic
  const applyFiltersAndSort = (scholarshipList) => {
    let filtered = scholarshipList.filter(scholarship => {
      // Title search
      if (searchTitle && !scholarship.title.toLowerCase().includes(searchTitle.toLowerCase())) {
        return false;
      }
      
      // Field filter
      if (filters.field && scholarship.field !== filters.field) {
        return false;
      }
      
      // Level filter
      if (filters.level && scholarship.level !== filters.level) {
        return false;
      }
      
      // Country filter
      if (filters.country && scholarship.country !== filters.country) {
        return false;
      }
      
      // Amount range filter
      if (filters.minAmount && scholarship.amount < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && scholarship.amount > parseFloat(filters.maxAmount)) {
        return false;
      }
      
      // GPA filter
      if (filters.minGPA && scholarship.eligibility?.gpa && scholarship.eligibility.gpa < parseFloat(filters.minGPA)) {
        return false;
      }
      
      // Gender filter
      if (filters.gender && scholarship.eligibility?.gender && scholarship.eligibility.gender !== filters.gender) {
        return false;
      }
      
      // Category filter (SC/ST/OBC/General)
      if (filters.category && scholarship.category !== filters.category) {
        return false;
      }
      
      // State filter (using country as proxy for now, can be enhanced later)
      if (filters.state && scholarship.country !== filters.state) {
        return false;
      }
      
      return true;
    });
    
    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'deadline':
        default:
          aValue = new Date(a.deadline);
          bValue = new Date(b.deadline);
          break;
      }
      
      if (filters.sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  // Apply filters to the scholarship list (no more tabs)
  const filteredScholarships = applyFiltersAndSort(scholarships);

  if (loading && scholarships.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading scholarships...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4>Error Loading Scholarships</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchScholarships}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">

      {/* Header with Stats */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <h4>{stats.totalScholarships}</h4>
                  <p className="mb-0">Total Scholarships</p>
                </div>
                <div className="col-md-3">
                  <h4>{formatAmount(stats.totalAmount)}</h4>
                  <p className="mb-0">Total Available</p>
                </div>
                <div className="col-md-3">
                  <h4>{stats.fields.length}</h4>
                  <p className="mb-0">Fields of Study</p>
                </div>
                <div className="col-md-3">
                  <h4>{stats.countries.length}</h4>
                  <p className="mb-0">Countries</p>
                </div>
              </div>
              {/* Add Create New Scholarship button for admins */}
              {user?.role === 'admin' && (
                <div className="row mt-3">
                  <div className="col-12 text-center">
                    <button
                      className="btn btn-light btn-lg"
                      onClick={handleOpenCreateModal}
                    >
                      ➕ Create New Scholarship
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Search & Filters</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Search */}
                <div className="col-md-3 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search scholarships by title..."
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </div>
                
                {/* Field */}
                <div className="col-md-2 mb-3">
                  <select
                    className="form-select"
                    value={filters.field}
                    onChange={(e) => handleFilterChange('field', e.target.value)}
                  >
                    <option value="">All Fields</option>
                    {stats.fields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                
                {/* Level */}
                <div className="col-md-2 mb-3">
                  <select
                    className="form-select"
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                  >
                    <option value="">All Levels</option>
                    {stats.levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                
                {/* Category */}
                <div className="col-md-2 mb-3">
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="General">General</option>
                    <option value="All">All Categories</option>
                  </select>
                </div>
                
                {/* Gender */}
                <div className="col-md-2 mb-3">
                  <select
                    className="form-select"
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Any">Any Gender</option>
                  </select>
                </div>
                
                {/* Country/State */}
                <div className="col-md-2 mb-3">
                  <select
                    className="form-select"
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {stats.countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                {/* Amount Range */}
                <div className="col-md-3 mb-3">
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min Amount"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max Amount"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    />
                  </div>
                </div>
                
                {/* GPA */}
                <div className="col-md-2 mb-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min GPA"
                    step="0.1"
                    min="0"
                    max="4"
                    value={filters.minGPA}
                    onChange={(e) => handleFilterChange('minGPA', e.target.value)}
                  />
                </div>
                
                {/* Sort By */}
                <div className="col-md-2 mb-3">
                  <select
                    className="form-select"
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="deadline">Deadline</option>
                    <option value="amount">Amount</option>
                    <option value="title">Title</option>
                  </select>
                </div>
                
                {/* Sort Order */}
                <div className="col-md-2 mb-3">
                  <select
                    className="form-select"
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                
                {/* Clear Filters */}
                <div className="col-md-1 mb-3">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setFilters({
                        field: '',
                        level: '',
                        country: '',
                        minAmount: '',
                        maxAmount: '',
                        minGPA: '',
                        citizenship: '',
                        gender: '',
                        category: '',
                        state: '',
                        search: '',
                        sortBy: 'deadline',
                        sortOrder: 'asc'
                      });
                      setSearchTitle('');
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="row mb-3">
        <div className="col-12">
          <p className="text-muted">
            Showing {filteredScholarships.length} of {scholarships.length} scholarships
          </p>
        </div>
      </div>

      {/* Remove the duplicate search bar since we have enhanced filters above */}

      {/* Sort Options */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h5>Scholarships ({filteredScholarships.length})</h5>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="amount">Sort by Amount</option>
                <option value="title">Sort by Title</option>
              </select>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Scholarships Grid */}
      <div className="row">
        {filteredScholarships.map((scholarship) => (
          <div key={scholarship._id} className="col-lg-4 col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span className={`badge bg-${getUrgencyColor(scholarship.deadline)}`}>
                  {getDaysUntilDeadline(scholarship.deadline)} days left
                </span>
                {/* Remove the dropdown menu that was covering the description */}
              </div>
              <div className="card-body">
                <h5 className="card-title">{scholarship.title}</h5>
                <h6 className="card-subtitle mb-2 text-muted">{scholarship.organization}</h6>
                <p className="card-text">{scholarship.description}</p>
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
                {scholarship.eligibility?.gpa && (
                  <div className="mb-2">
                    <small className="text-muted">Minimum GPA: {scholarship.eligibility.gpa}</small>
                  </div>
                )}
                {scholarship.tags && scholarship.tags.length > 0 && (
                  <div className="mb-3">
                    {scholarship.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="badge bg-light text-dark me-1">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-footer">
                <div className="d-grid gap-2">
                  {user && user.role === 'student' && (
                    <>
                      {appliedScholarshipIds.has(String(scholarship._id)) ? (
                        <button className="btn btn-success" disabled>
                          ✓ Already Applied
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleApply(scholarship._id)}
                        >
                          Apply Now
                        </button>
                      )}
                    </>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => handleOpenEditScholarship(scholarship)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteScholarship(scholarship._id)}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
                  {scholarship.applicationUrl && (
                    <a 
                      href={scholarship.applicationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary btn-sm"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav aria-label="Scholarship pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </button>
                </li>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                    <button 
                      className="page-link"
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {showEditModal && (
        <ScholarshipEditModal
          show={showEditModal}
          onClose={handleCloseEditModal}
          onSubmit={handleEditScholarshipSubmit}
          scholarship={editingScholarship}
        />
      )}

      {showCreateModal && (
        <ScholarshipCreateModal
          show={showCreateModal}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateScholarship}
        />
      )}
    </div>
  );
};

export default ScholarshipList; 

function ScholarshipEditModal({ show, onClose, onSubmit, scholarship }) {
  const [form, setForm] = useState({
    title: scholarship?.title || '',
    category: scholarship?.category || '',
    amount: scholarship?.amount || '',
    deadline: scholarship?.deadline ? new Date(scholarship.deadline).toISOString().slice(0, 10) : '',
    organization: scholarship?.organization || '',
    applicationUrl: scholarship?.applicationUrl || '',
    description: scholarship?.description || '',
    eligibility: scholarship?.eligibility || {},
  });
  useEffect(() => {
    setForm({
      title: scholarship?.title || '',
      category: scholarship?.category || '',
      amount: scholarship?.amount || '',
      deadline: scholarship?.deadline ? new Date(scholarship.deadline).toISOString().slice(0, 10) : '',
      organization: scholarship?.organization || '',
      applicationUrl: scholarship?.applicationUrl || '',
      description: scholarship?.description || '',
      eligibility: scholarship?.eligibility || {},
    });
  }, [scholarship]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleEligibilityChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, eligibility: { ...prev.eligibility, [name]: value } }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };
  if (!show) return null;
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Scholarship</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-2">
                <label className="form-label">Title</label>
                <input className="form-control" name="title" value={form.title} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Category</label>
                <input className="form-control" name="category" value={form.category} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Amount</label>
                <input className="form-control" name="amount" type="number" value={form.amount} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Deadline</label>
                <input className="form-control" name="deadline" type="date" value={form.deadline} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Provider</label>
                <input className="form-control" name="organization" value={form.organization} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Link</label>
                <input className="form-control" name="applicationUrl" value={form.applicationUrl} onChange={handleChange} />
              </div>
              <div className="mb-2">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={form.description} onChange={handleChange} required />
              </div>
              <div className="mb-2">
                <label className="form-label">Eligibility (GPA)</label>
                <input className="form-control" name="gpa" type="number" value={form.eligibility.gpa || ''} onChange={handleEligibilityChange} />
              </div>
              <div className="mb-2">
                <label className="form-label">Eligibility (Citizenship)</label>
                <input className="form-control" name="citizenship" value={form.eligibility.citizenship || ''} onChange={handleEligibilityChange} />
              </div>
              {/* Add more eligibility fields as needed */}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 

function ScholarshipCreateModal({ show, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    category: '',
    amount: '',
    deadline: '',
    organization: '',
    applicationUrl: '',
    description: '',
    field: '',
    level: '',
    country: '',
    eligibility: {},
    tags: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEligibilityChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, eligibility: { ...prev.eligibility, [name]: value } }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setForm((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!form.title || !form.organization || !form.amount || !form.deadline || 
        !form.field || !form.level || !form.country || !form.description) {
      alert('Please fill in all required fields marked with *');
      return;
    }
    
    // Validate amount is a positive number
    if (isNaN(form.amount) || Number(form.amount) <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }
    
    // Validate deadline is in the future
    const deadlineDate = new Date(form.deadline);
    const today = new Date();
    if (deadlineDate <= today) {
      alert('Deadline must be in the future');
      return;
    }
    
    onSubmit(form);
  };

  const resetForm = () => {
    setForm({
      title: '',
      category: '',
      amount: '',
      deadline: '',
      organization: '',
      applicationUrl: '',
      description: '',
      field: '',
      level: '',
      country: '',
      eligibility: {},
      tags: []
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Create New Scholarship</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input 
                      className="form-control" 
                      name="title" 
                      value={form.title} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Organization/Provider *</label>
                    <input 
                      className="form-control" 
                      name="organization" 
                      value={form.organization} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Field of Study *</label>
                    <select 
                      className="form-select" 
                      name="field" 
                      value={form.field} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">Select Field</option>
                      <option value="All Fields">All Fields</option>
                      <option value="STEM">STEM</option>
                      <option value="Public Service">Public Service</option>
                      <option value="Business">Business</option>
                      <option value="Arts">Arts</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Law">Law</option>
                      <option value="Education">Education</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Level *</label>
                    <select 
                      className="form-select" 
                      name="level" 
                      value={form.level} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Graduate">Graduate</option>
                      <option value="PhD">PhD</option>
                      <option value="Postdoctoral">Postdoctoral</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Amount ($) *</label>
                    <input 
                      className="form-control" 
                      name="amount" 
                      type="number" 
                      value={form.amount} 
                      onChange={handleChange} 
                      min="1"
                      max="10000000"
                      step="0.01"
                      required 
                      placeholder="Enter amount (e.g., 5000)"
                    />
                    <small className="form-text text-muted">Maximum amount: $10,000,000</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Deadline *</label>
                    <input 
                      className="form-control" 
                      name="deadline" 
                      type="date" 
                      value={form.deadline} 
                      onChange={handleChange} 
                      min={new Date().toISOString().split('T')[0]}
                      required 
                    />
                    <small className="form-text text-muted">Deadline must be in the future</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Country *</label>
                    <select 
                      className="form-select" 
                      name="country" 
                      value={form.country} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="India">India</option>
                      <option value="Ireland">Ireland</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select" 
                      name="category" 
                      value={form.category} 
                      onChange={handleChange}
                    >
                      <option value="">Select Category</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="General">General</option>
                      <option value="All">All Categories</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Application URL</label>
                    <input 
                      className="form-control" 
                      name="applicationUrl" 
                      type="url" 
                      value={form.applicationUrl} 
                      onChange={handleChange} 
                      placeholder="https://example.com/apply"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-control" 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  rows="4"
                  required 
                />
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Minimum GPA</label>
                    <input 
                      className="form-control" 
                      name="gpa" 
                      type="number" 
                      step="0.1"
                      min="0"
                      max="4"
                      value={form.eligibility.gpa || ''} 
                      onChange={handleEligibilityChange} 
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Citizenship</label>
                    <input 
                      className="form-control" 
                      name="citizenship" 
                      value={form.eligibility.citizenship || ''} 
                      onChange={handleEligibilityChange} 
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input 
                      className="form-control" 
                      name="tags" 
                      value={form.tags.join(', ')} 
                      onChange={handleTagsChange} 
                      placeholder="DIVERSITY, FINANCIAL NEED, MINORITY"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Scholarship
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 