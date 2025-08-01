const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const AdminActivity = require('../models/AdminActivity');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  
  try {
    // Get all statistics
    const [totalScholarships, totalApplications, pendingApplications, totalUsers, totalQueries, openQueries] = await Promise.all([
      Scholarship.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: 'Pending' }),
      User.countDocuments(),
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'Open' })
    ]);
    
    res.json({
      totalScholarships,
      totalApplications,
      pendingApplications,
      totalUsers,
      totalQueries,
      openQueries
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
});

// Get admin activity history
router.get('/history', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  
  try {
    const activities = await AdminActivity.find()
      .sort({ timestamp: -1 })
      .limit(50); // Get last 50 activities
    
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admin history', error: err.message });
  }
});

// Get all users (for admin)
router.get('/users', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Seed sample data for admin dashboard (development only)
router.post('/seed-data', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  
  try {
    const { seedAdminData } = require('../seed/adminData');
    await seedAdminData();
    res.json({ message: 'Sample data seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error seeding data', error: err.message });
  }
});

module.exports = router; 