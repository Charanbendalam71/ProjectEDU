const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Denied'], 
    default: 'Pending' 
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  adminNotes: { type: String },
  adminReviewDate: { type: Date },
  adminReviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Student application details
  personalStatement: { type: String },
  academicTranscript: { type: String }, // URL to uploaded file
  lettersOfRecommendation: [{ type: String }], // URLs to uploaded files
  resume: { type: String }, // URL to uploaded file
  additionalDocuments: [{ type: String }], // URLs to additional files
  // Eligibility verification
  gpa: { type: Number },
  citizenship: { type: String },
  enrollmentStatus: { type: String },
  academicLevel: { type: String },
  // Contact information
  phoneNumber: { type: String },
  address: { type: String },
  emergencyContact: { type: String }
});

// Update the updatedAt field before saving
applicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Application', applicationSchema); 