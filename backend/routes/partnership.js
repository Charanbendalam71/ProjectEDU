const express = require('express');
const Partnership = require('../models/Partnership');
const auth = require('../middleware/auth');

const router = express.Router();

// Public: Submit Partnership Request
router.post('/', async (req, res) => {
  try {
    const { name, type, contactEmail, description, website } = req.body;
    const partnership = new Partnership({ name, type, contactEmail, description, website });
    await partnership.save();
    res.status(201).json(partnership);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting partnership', error: err.message });
  }
});

// Admin: Get All Partnerships
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const partnerships = await Partnership.find();
    res.json(partnerships);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching partnerships', error: err.message });
  }
});

module.exports = router; 