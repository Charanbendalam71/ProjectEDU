const express = require('express');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Test route to verify the recommendation router is working
router.get('/test', (req, res) => {
  res.json({ message: 'Recommendation router is working!' });
});

// Test PUT route without authentication
router.put('/test-put', (req, res) => {
  res.json({ message: 'PUT route is working!', body: req.body });
});

// Get Recommendations for Student
router.get('/', auth, async (req, res) => {
  try {
    console.log('Recommendations request received');
    console.log('User from token:', req.user);
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get all scholarships
    const allScholarships = await Scholarship.find({ isActive: true });
    
    // Calculate recommendation scores for each scholarship
    const scoredScholarships = allScholarships.map(scholarship => {
      let score = 0;
      const reasons = [];

      // Category matching (high priority)
      if (user.category && scholarship.category === user.category) {
        score += 50;
        reasons.push(`Matches your category (${user.category})`);
      }

      // Academic level matching (high priority)
      if (user.academicLevel && scholarship.level === user.academicLevel) {
        score += 40;
        reasons.push(`Matches your academic level (${user.academicLevel})`);
      }

      // Gender matching
      if (user.gender && scholarship.eligibility?.gender && 
          (scholarship.eligibility.gender === user.gender || scholarship.eligibility.gender === 'Any')) {
        score += 30;
        reasons.push(`Matches your gender criteria`);
      }

      // State/Country matching
      if (user.state && scholarship.country === user.state) {
        score += 25;
        reasons.push(`Available in your state (${user.state})`);
      }

      // Income-based matching
      if (user.income && scholarship.amount) {
        if (user.income < 50000 && scholarship.amount >= 10000) {
          score += 20;
          reasons.push('High-value scholarship for low-income students');
        } else if (user.income < 100000 && scholarship.amount >= 5000) {
          score += 15;
          reasons.push('Good value scholarship for moderate-income students');
        }
      }

      // Field of study matching
      if (user.preferences && user.preferences.length > 0) {
        const matchingPreferences = user.preferences.filter(pref => 
          scholarship.field.toLowerCase().includes(pref.toLowerCase()) ||
          scholarship.tags?.some(tag => tag.toLowerCase().includes(pref.toLowerCase()))
        );
        if (matchingPreferences.length > 0) {
          score += matchingPreferences.length * 15;
          reasons.push(`Matches your interests: ${matchingPreferences.join(', ')}`);
        }
      }

      // GPA requirements matching
      if (user.gpa && scholarship.eligibility?.gpa) {
        if (user.gpa >= scholarship.eligibility.gpa) {
          score += 20;
          reasons.push(`Meets GPA requirement (${scholarship.eligibility.gpa})`);
        }
      }

      // Deadline urgency (sooner deadlines get higher scores)
      const daysUntilDeadline = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
        score += 25;
        reasons.push('Urgent deadline - apply soon!');
      } else if (daysUntilDeadline > 0 && daysUntilDeadline <= 90) {
        score += 15;
        reasons.push('Deadline approaching');
      }

      // Amount-based scoring
      if (scholarship.amount >= 20000) {
        score += 10;
        reasons.push('High-value scholarship');
      } else if (scholarship.amount >= 10000) {
        score += 5;
        reasons.push('Good value scholarship');
      }

      return {
        ...scholarship.toObject(),
        recommendationScore: score,
        reasons: reasons
      };
    });

    // Sort by recommendation score (highest first)
    const sortedScholarships = scoredScholarships
      .filter(scholarship => scholarship.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 20); // Return top 20 recommendations

    res.json({
      recommendations: sortedScholarships,
      userProfile: {
        category: user.category,
        academicLevel: user.academicLevel,
        gender: user.gender,
        state: user.state,
        preferences: user.preferences,
        income: user.income,
        gpa: user.gpa
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recommendations', error: err.message });
  }
});

// Update user preferences for better recommendations
router.put('/preferences', auth, async (req, res) => {
  try {
    console.log('Preferences update request received');
    console.log('User from token:', req.user);
    console.log('Request body:', req.body);
    
    const { preferences, category, academicLevel, gender, state, income, gpa } = req.body;
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      {
        preferences,
        category,
        academicLevel,
        gender,
        state,
        income,
        gpa
      },
      { new: true }
    );

    res.json({ 
      message: 'Preferences updated successfully',
      user: updatedUser 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating preferences', error: err.message });
  }
});

module.exports = router; 