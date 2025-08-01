const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  story: { type: String, required: true },
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SuccessStory', successStorySchema); 