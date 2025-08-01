import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const DocumentVault = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/documents/my');
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setMessage({ type: 'error', text: 'Failed to load documents' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setMessage({ type: '', text: '' });
    setUploadedFiles([]);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('document', file);

        const response = await axios.post('/api/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size
          }]);
        }
      }

      // Refresh documents list
      await fetchDocuments();
      setMessage({ type: 'success', text: 'Documents uploaded successfully!' });
      setShowUploadModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error uploading documents. Please try again.'
      });
    } finally {
      setUploading(false);
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
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">📁 Document Vault</h3>
                <p className="text-muted mb-0">Store and manage your scholarship documents</p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowUploadModal(true)}
              >
                📤 Upload Documents
              </button>
            </div>
            <div className="card-body">
              {/* Message Display */}
              {message.text && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                  {message.text}
                  <button type="button" className="btn-close" onClick={clearMessage}></button>
                </div>
              )}

              {/* Statistics */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <h4>{documents.length}</h4>
                      <p className="mb-0">Total Documents</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <h4>{documents.filter(doc => doc.category === 'transcript').length}</h4>
                      <p className="mb-0">Transcripts</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <h4>{documents.filter(doc => doc.category === 'personal_statement').length}</h4>
                      <p className="mb-0">Personal Statements</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body text-center">
                      <h4>{documents.filter(doc => doc.category === 'recommendation').length}</h4>
                      <p className="mb-0">Recommendations</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents List */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading your documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-3">📄</div>
                  <h4>No documents uploaded yet</h4>
                  <p className="text-muted mb-4">Upload your scholarship documents to keep them organized and easily accessible</p>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowUploadModal(true)}
                  >
                    📤 Upload Your First Document
                  </button>
                </div>
              ) : (
                <div className="row">
                  {documents.map((doc) => (
                    <motion.div
                      key={doc._id}
                      className="col-md-6 col-lg-4 mb-4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="card h-100 border shadow-sm">
                        <div className="card-body">
                          <div className="d-flex align-items-start justify-content-between">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center mb-3">
                                <span className="fs-2 me-3">{getFileIcon(doc.mimetype)}</span>
                                <div>
                                  <h6 className="mb-1 text-truncate" title={doc.name}>
                                    {doc.name}
                                  </h6>
                                  <small className="text-muted">{getFileType(doc.mimetype)}</small>
                                </div>
                              </div>
                              <div className="small text-muted mb-3">
                                <div>📏 {formatFileSize(doc.size)}</div>
                                <div>📅 {new Date(doc.uploadDate).toLocaleDateString()}</div>
                                {doc.category && (
                                  <div>📂 {doc.category.replace('_', ' ')}</div>
                                )}
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
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showUploadModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">📤 Upload Documents</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                ></button>
              </div>
              <div className="modal-body">
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
                              {file.type} • {formatFileSize(file.size)}
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

export default DocumentVault; 