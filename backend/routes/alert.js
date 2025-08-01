const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Stub: Get Scholarship Alerts for Student
router.get('/', auth, (req, res) => {
  // In real app, implement alert logic
  res.json({ alerts: [] });
});

module.exports = router; 