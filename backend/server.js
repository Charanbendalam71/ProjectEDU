require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship-finder';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));
app.use('/uploads/profile-pictures', express.static('uploads/profile-pictures'));

// --- ROUTES PLACEHOLDER ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scholarships', require('./routes/scholarship'));
app.use('/api/applications', require('./routes/application'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/recommendations', require('./routes/recommendation'));
app.use('/api/success-stories', require('./routes/successStory'));
app.use('/api/documents', require('./routes/document'));
app.use('/api/partnerships', require('./routes/partnership'));
app.use('/api/admin', require('./routes/admin'));
// Enhancements
app.use('/api/alerts', require('./routes/alert'));
app.use('/api/eligibility', require('./routes/eligibility'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/ratings', require('./routes/rating'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/multilingual', require('./routes/multilingual'));

// MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Scholarship Finder API Running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/auth',
      '/api/scholarships', 
      '/api/applications',
      '/api/documents',
      '/api/admin'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 