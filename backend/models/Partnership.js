const mongoose = require('mongoose');

const partnershipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Institution', 'NGO'], required: true },
  contactEmail: { type: String, required: true },
  description: { type: String },
  website: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Partnership', partnershipSchema); 