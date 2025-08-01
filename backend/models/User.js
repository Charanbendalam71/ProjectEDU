const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  
  // Enhanced profile fields
  profilePicture: { type: String }, // URL to profile picture
  phone: { type: String },
  address: { type: String },
  bio: { type: String },
  education: { type: String },
  interests: { type: String },
  
  // Profile fields for recommendations
  income: { type: Number },
  category: { type: String, enum: ['SC', 'ST', 'OBC', 'General'] },
  academicLevel: { type: String },
  gender: { type: String },
  state: { type: String },
  gpa: { type: Number, min: 0, max: 10 },
  preferences: { type: [String] }, // tags or keywords
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }],
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema); 