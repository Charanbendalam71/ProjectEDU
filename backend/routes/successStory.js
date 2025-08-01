const express = require('express');
const SuccessStory = require('../models/SuccessStory');
const auth = require('../middleware/auth');

const router = express.Router();

// Student: Submit Success Story
router.post('/', auth, async (req, res) => {
  try {
    const { title, story, scholarship } = req.body;
    const successStory = new SuccessStory({
      user: req.user.userId,
      title,
      story,
      scholarship,
    });
    await successStory.save();
    res.status(201).json(successStory);
  } catch (err) {
    res.status(400).json({ message: 'Error submitting success story', error: err.message });
  }
});

// Public: Get All Success Stories
router.get('/', async (req, res) => {
  try {
    const stories = await SuccessStory.find().populate('user scholarship');
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching success stories', error: err.message });
  }
});

module.exports = router; 