const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  organization: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  deadline: { type: Date, required: true },
  field: { type: String, required: true },
  level: { type: String, required: true },
  country: { type: String, required: true },
  category: { type: String, required: true },
  eligibility: {
    gpa: { type: Number },
    citizenship: [{ type: String }],
    enrollment: { type: String },
    year: [{ type: String }],
    gender: { type: String },
    firstGeneration: { type: Boolean },
    underrepresented: { type: Boolean }
  },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  tags: [{ type: String }],
  applicationUrl: { type: String },
  contactEmail: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
scholarshipSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Scholarship', scholarshipSchema); 