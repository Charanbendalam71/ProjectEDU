const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Stub: Rate a Scholarship
router.post('/:id', auth, (req, res) => {
  // In real app, implement rating logic
  res.json({ message: 'Rating submitted (stub)' });
});

module.exports = router; 