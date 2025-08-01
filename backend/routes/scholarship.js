const express = require('express');
const Scholarship = require('../models/Scholarship');
const AdminActivity = require('../models/AdminActivity');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to log admin activity
const logAdminActivity = async (adminId, adminName, action, scholarshipId, scholarshipTitle, details) => {
  try {
    await AdminActivity.create({
      adminId,
      adminName,
      action,
      scholarshipId,
      scholarshipTitle,
      details,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// Admin: Add Scholarship
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const scholarship = new Scholarship(req.body);
    await scholarship.save();
    
    // Log the activity
    await logAdminActivity(
      req.user._id,
      req.user.name,
      'created',
      scholarship._id,
      scholarship.title,
      `Created scholarship: ${scholarship.title} with amount $${scholarship.amount}`
    );
    
    res.status(201).json(scholarship);
  } catch (err) {
    res.status(400).json({ message: 'Error creating scholarship', error: err.message });
  }
});

// Admin: Edit Scholarship
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Log the activity
    await logAdminActivity(
      req.user._id,
      req.user.name,
      'updated',
      scholarship._id,
      scholarship.title,
      `Updated scholarship: ${scholarship.title}`
    );
    
    res.json(scholarship);
  } catch (err) {
    res.status(400).json({ message: 'Error updating scholarship', error: err.message });
  }
});

// Admin: Delete Scholarship
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    
    await Scholarship.findByIdAndDelete(req.params.id);
    
    // Log the activity
    await logAdminActivity(
      req.user._id,
      req.user.name,
      'deleted',
      scholarship._id,
      scholarship.title,
      `Deleted scholarship: ${scholarship.title}`
    );
    
    res.json({ message: 'Scholarship deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Error deleting scholarship', error: err.message });
  }
});

// Public: Get All Scholarships (with advanced filtering)
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };
    const { 
      field, 
      level, 
      country, 
      minAmount, 
      maxAmount, 
      minGPA, 
      citizenship, 
      gender, 
      search, 
      sortBy, 
      sortOrder = 'asc',
      limit = 20,
      page = 1
    } = req.query;

    // Field filter
    if (field && field !== 'All Fields') {
      query.field = field;
    }

    // Level filter
    if (level) {
      query.level = level;
    }

    // Country filter
    if (country) {
      query.country = country;
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    // GPA filter
    if (minGPA) {
      query['eligibility.gpa'] = { $lte: Number(minGPA) };
    }

    // Citizenship filter
    if (citizenship) {
      query['eligibility.citizenship'] = citizenship;
    }

    // Gender filter
    if (gender) {
      query['eligibility.gender'] = gender;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObject = {};
    if (sortBy) {
      sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortObject = { deadline: 1 }; // Default sort by deadline
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const scholarships = await Scholarship.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Scholarship.countDocuments(query);

    res.json({
      scholarships,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalScholarships: total,
        hasNextPage: skip + scholarships.length < total,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching scholarships', error: err.message });
  }
});

// Test endpoint for eligibility checker
router.get('/test', async (req, res) => {
  try {
    const count = await Scholarship.countDocuments({ isActive: true });
    const sample = await Scholarship.findOne({ isActive: true });
    res.json({
      message: 'Scholarship API is working',
      totalScholarships: count,
      sampleScholarship: sample,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ message: 'Error testing scholarship API', error: err.message });
  }
});

// Public: Get scholarship statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalScholarships = await Scholarship.countDocuments({ isActive: true });
    const totalAmount = await Scholarship.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const fields = await Scholarship.distinct('field');
    const levels = await Scholarship.distinct('level');
    const countries = await Scholarship.distinct('country');

    res.json({
      totalScholarships,
      totalAmount: totalAmount[0]?.total || 0,
      fields,
      levels,
      countries
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching statistics', error: err.message });
  }
});

// Public: Get Scholarship by ID
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({ message: 'Scholarship not found' });
    }
    res.json(scholarship);
  } catch (err) {
    res.status(404).json({ message: 'Scholarship not found' });
  }
});

module.exports = router; 