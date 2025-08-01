const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Stub: Scholarship Status Dashboard
router.get('/', auth, (req, res) => {
  // In real app, implement dashboard logic
  res.json({ dashboard: {} });
});

module.exports = router; 