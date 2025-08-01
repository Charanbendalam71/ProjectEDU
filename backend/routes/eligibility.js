const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');

const router = express.Router();

// Check Eligibility for Scholarships
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ eligible: false, reasons: ['User not found'] });
    
    const scholarships = await Scholarship.find({ isActive: true });
    const eligibleScholarships = [];
    const ineligibleScholarships = [];

    scholarships.forEach(scholarship => {
      let eligible = true;
      const reasons = [];

      // GPA check
      if (scholarship.eligibility?.gpa && user.gpa) {
        if (user.gpa < scholarship.eligibility.gpa) {
          eligible = false;
          reasons.push(`GPA below requirement (${scholarship.eligibility.gpa})`);
        }
      }

      // Age check
      if (scholarship.eligibility?.age && user.age) {
        if (user.age > scholarship.eligibility.age) {
          eligible = false;
          reasons.push(`Age above limit (${scholarship.eligibility.age})`);
        }
      }

      // Citizenship check
      if (scholarship.eligibility?.citizenship && user.citizenship) {
        const citizenshipMatch = scholarship.eligibility.citizenship.some(citizen => 
          citizen.toLowerCase().includes(user.citizenship.toLowerCase()) ||
          user.citizenship.toLowerCase().includes(citizen.toLowerCase())
        );
        if (!citizenshipMatch) {
          eligible = false;
          reasons.push(`Citizenship not eligible (${scholarship.eligibility.citizenship.join(', ')})`);
        }
      }

      // Education level check
      if (scholarship.level && user.education) {
        const levelMapping = {
          'High School': 'Undergraduate',
          "Associate's Degree": 'Undergraduate',
          "Bachelor's Degree": 'Undergraduate',
          "Master's Degree": 'Graduate',
          'Doctorate': 'Graduate'
        };
        const mappedLevel = levelMapping[user.education];
        if (mappedLevel && scholarship.level !== mappedLevel) {
          eligible = false;
          reasons.push(`Education level mismatch (${scholarship.level} required)`);
        }
      }

      // Field of study check
      if (scholarship.field && scholarship.field !== 'All Fields' && user.interests) {
        const fieldMatch = scholarship.field.toLowerCase().includes(user.interests.toLowerCase()) ||
                          user.interests.toLowerCase().includes(scholarship.field.toLowerCase());
        if (!fieldMatch) {
          eligible = false;
          reasons.push(`Field of study mismatch (${scholarship.field})`);
        }
      }

      // Category check
      if (scholarship.category && scholarship.category !== 'General' && user.category) {
        if (scholarship.category !== user.category) {
          eligible = false;
          reasons.push(`Category mismatch (${scholarship.category})`);
        }
      }

      if (eligible) {
        eligibleScholarships.push({
          _id: scholarship._id,
          title: scholarship.title,
          organization: scholarship.organization,
          amount: scholarship.amount,
          currency: scholarship.currency,
          deadline: scholarship.deadline,
          field: scholarship.field,
          level: scholarship.level,
          country: scholarship.country,
          description: scholarship.description,
          applicationUrl: scholarship.applicationUrl,
          reasons: [],
        });
      } else {
        ineligibleScholarships.push({
          _id: scholarship._id,
          title: scholarship.title,
          organization: scholarship.organization,
          amount: scholarship.amount,
          reasons,
        });
      }
    });

    res.json({ 
      eligible: true, 
      eligibleScholarships, 
      ineligibleScholarships,
      totalScholarships: scholarships.length,
      eligibleCount: eligibleScholarships.length
    });
  } catch (err) {
    console.error('Eligibility check error:', err);
    res.status(500).json({ eligible: false, reasons: [err.message] });
  }
});

// Get eligibility statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalScholarships = await Scholarship.countDocuments({ isActive: true });
    
    // Get user's eligible scholarships count
    const scholarships = await Scholarship.find({ isActive: true });
    let eligibleCount = 0;

    scholarships.forEach(scholarship => {
      let eligible = true;

      // Basic checks
      if (scholarship.eligibility?.gpa && user.gpa && user.gpa < scholarship.eligibility.gpa) {
        eligible = false;
      }
      if (scholarship.eligibility?.age && user.age && user.age > scholarship.eligibility.age) {
        eligible = false;
      }
      if (eligible) eligibleCount++;
    });

    res.json({
      totalScholarships,
      eligibleCount,
      eligibilityPercentage: Math.round((eligibleCount / totalScholarships) * 100)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 