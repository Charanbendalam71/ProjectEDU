import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    education: user?.education || '',
    interests: user?.interests || ''
  });

  useEffect(() => {
    fetchDocuments();
    console.log('Current user data:', user);
    console.log('Profile picture URL:', user?.profilePicture);
  }, []);

  useEffect(() => {
    // Update form data when user data changes
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
      education: user?.education || '',
      interests: user?.interests || ''
    });
  }, [user]);

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await axios.get('/api/documents/my');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setMessage({ type: 'error', text: 'Failed to load documents' });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please select a valid image file (JPEG, PNG, or GIF)' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setUploadingPicture(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post('/api/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

             if (response.data.success) {
         console.log('Profile picture upload successful:', response.data);
         // Update user context with new profile picture
         updateUser({ ...user, profilePicture: response.data.profilePicture });
         setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
       } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to upload profile picture' });
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error uploading profile picture. Please try again.' 
      });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await axios.get(`/api/documents/download/${documentId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setMessage({ type: 'error', text: 'Error downloading document. Please try again.' });
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await axios.delete(`/api/documents/${documentId}`);
        setDocuments(documents.filter(doc => doc._id !== documentId));
        setMessage({ type: 'success', text: 'Document deleted successfully!' });
      } catch (error) {
        console.error('Error deleting document:', error);
        setMessage({ type: 'error', text: 'Error deleting document. Please try again.' });
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('image')) return '🖼️';
    return '📎';
  };

  const getFileType = (mimetype) => {
    if (mimetype.includes('pdf')) return 'PDF';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'Document';
    if (mimetype.includes('image')) return 'Image';
    return 'File';
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
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.put('/api/auth/profile', formData);
      
      if (response.data.success) {
        // Update the user context with new data
        updateUser(response.data.user);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: response.data.message || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error updating profile. Please try again.' 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      bio: user?.bio || '',
      education: user?.education || '',
      interests: user?.interests || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  // Auto-clear success messages after 5 seconds
  useEffect(() => {
    if (message.type === 'success') {
      const timer = setTimeout(clearMessage, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="row justify-content-center">
      <div className="col-md-10">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="mb-0">Profile Settings</h3>
            {!isEditing && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>
          <div className="card-body">
            {/* Message Display */}
            {message.text && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={clearMessage}></button>
              </div>
            )}

            <div className="text-center mb-4">
              {/* Profile Picture Section */}
              <div className="position-relative d-inline-block mb-3">
                                 <div className="profile-picture-container">
                   {user?.profilePicture ? (
                     <img 
                       src={user.profilePicture} 
                       alt="Profile" 
                       className="profile-picture"
                       onError={(e) => {
                         console.log('Image failed to load:', user.profilePicture);
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'flex';
                       }}
                     />
                   ) : null}
                   <div className={`profile-picture-placeholder ${user?.profilePicture ? 'd-none' : 'd-flex'} align-items-center justify-content-center`}>
                     <span className="fs-1">👤</span>
                   </div>
                  
                  {/* Upload Overlay */}
                  <div className="profile-picture-overlay">
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPicture}
                    >
                      {uploadingPicture ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        '📷'
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              <h4>{user?.name || 'User Profile'}</h4>
              <p className="text-muted">{user?.email}</p>
              <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="education" className="form-label">Education Level</label>
                    <select
                      className="form-select"
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Education Level</option>
                      <option value="High School">High School</option>
                      <option value="Associate's Degree">Associate's Degree</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate">Doctorate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    rows="2"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    className="form-control"
                    id="bio"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="interests" className="form-label">Academic Interests</label>
                  <textarea
                    className="form-control"
                    id="interests"
                    name="interests"
                    rows="2"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g., Computer Science, Medicine, Arts, Engineering..."
                  />
                </div>
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      '💾 Save Changes'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCancel}
                    disabled={updating}
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Full Name:</strong>
                  <p>{user?.name || 'Not provided'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Email:</strong>
                  <p>{user?.email}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Phone:</strong>
                  <p>{user?.phone || 'Not provided'}</p>
                </div>
                <div className="col-md-6 mb-3">
                  <strong>Education Level:</strong>
                  <p>{user?.education || 'Not specified'}</p>
                </div>
                <div className="col-12 mb-3">
                  <strong>Address:</strong>
                  <p>{user?.address || 'Not provided'}</p>
                </div>
                {user?.bio && (
                  <div className="col-12 mb-3">
                    <strong>Bio:</strong>
                    <p>{user.bio}</p>
                  </div>
                )}
                {user?.interests && (
                  <div className="col-12 mb-3">
                    <strong>Academic Interests:</strong>
                    <p>{user.interests}</p>
                  </div>
                )}
              </div>
            )}

            <hr />
            
            {/* Documents Section */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>📁 My Documents ({documents.length})</h5>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Upload New Documents
                </button>
              </div>
              
              {loadingDocuments ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-4">
                  <div className="fs-1 mb-3">📄</div>
                  <h6>No documents uploaded yet</h6>
                  <p className="text-muted">Upload your documents to keep them organized in your profile</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Upload Your First Document
                  </button>
                </div>
              ) : (
                <div className="row">
                  {documents.map((doc) => (
                    <div key={doc._id} className="col-md-6 col-lg-4 mb-3">
                      <div className="card h-100 border">
                        <div className="card-body">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-2">
                                <span className="fs-4 me-2">{getFileIcon(doc.mimetype)}</span>
                                <div>
                                  <h6 className="mb-0 text-truncate" title={doc.name}>
                                    {doc.name}
                                  </h6>
                                  <small className="text-muted">{getFileType(doc.mimetype)}</small>
                                </div>
                              </div>
                              <div className="small text-muted">
                                <div>📏 {formatFileSize(doc.size)}</div>
                                <div>📅 {new Date(doc.uploadDate).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card-footer bg-transparent">
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-outline-primary btn-sm flex-fill"
                              onClick={() => handleDownload(doc._id, doc.name)}
                              title="Download document"
                            >
                              📥 Download
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteDocument(doc._id)}
                              title="Delete document"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr />
            
            <div className="row">
              <div className="col-md-6">
                <h5>Account Statistics</h5>
                <ul className="list-unstyled">
                  <li>📊 Applications Submitted: {user?.applications?.length || 0}</li>
                  <li>📚 Scholarships Bookmarked: {user?.bookmarks?.length || 0}</li>
                  <li>📄 Documents Uploaded: {documents.length}</li>
                  <li>📅 Member Since: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</li>
                </ul>
              </div>
              <div className="col-md-6">
                <h5>Quick Actions</h5>
                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary btn-sm">
                    View My Applications
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Upload Documents
                  </button>
                  <button className="btn btn-outline-warning btn-sm">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 