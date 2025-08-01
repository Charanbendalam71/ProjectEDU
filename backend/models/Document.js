const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Original filename
  filename: { type: String, required: true }, // Stored filename
  path: { type: String, required: true }, // File path on server
  size: { type: Number, required: true }, // File size in bytes
  mimetype: { type: String, required: true }, // File MIME type
  uploadDate: { type: Date, default: Date.now },
  // Optional fields for document categorization
  category: { 
    type: String, 
    default: 'other'
  },
  description: { type: String },
  isActive: { type: Boolean, default: true }
});

// Index for efficient queries
documentSchema.index({ user: 1, uploadDate: -1 });

module.exports = mongoose.model('Document', documentSchema); 