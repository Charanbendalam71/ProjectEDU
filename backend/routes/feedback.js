const express = require('express');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

const router = express.Router();

// Student: Submit Feedback/Query
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const feedback = new Feedback({ 
      user: req.user.userId, 
      subject,
      message, 
      category: category || 'General',
      priority: priority || 'Medium'
    });
    
    await feedback.save();
    
    // Populate user info for response
    await feedback.populate('user', 'name email');
    
    res.status(201).json({
      message: 'Query submitted successfully!',
      feedback
    });
  } catch (err) {
    res.status(400).json({ message: 'Error submitting query', error: err.message });
  }
});

// Admin: Respond to Feedback/Query
router.put('/:id/respond', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can respond to queries' });
  }
  
  try {
    const { response, status } = req.body;
    
    if (!response) {
      return res.status(400).json({ message: 'Response is required' });
    }

    const updateData = {
      response,
      adminResponder: req.user.userId,
      responseDate: new Date(),
      updatedAt: new Date()
    };

    if (status) {
      updateData.status = status;
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email')
     .populate('adminResponder', 'name');

    if (!feedback) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json({
      message: 'Response sent successfully!',
      feedback
    });
  } catch (err) {
    res.status(400).json({ message: 'Error responding to query', error: err.message });
  }
});

// Admin: Update Query Status
router.put('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update status' });
  }
  
  try {
    const { status } = req.body;
    
    if (!['Open', 'In Progress', 'Closed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('user', 'name email');

    if (!feedback) {
      return res.status(404).json({ message: 'Query not found' });
    }

    res.json({
      message: 'Status updated successfully!',
      feedback
    });
  } catch (err) {
    res.status(400).json({ message: 'Error updating status', error: err.message });
  }
});

// Get All Feedback/Queries (admin) or My Feedback/Queries (student)
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Students can only see their own queries
    if (req.user.role !== 'admin') {
      query.user = req.user.userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sortObject = {};
    sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const feedbacks = await Feedback.find(query)
      .populate('user', 'name email')
      .populate('adminResponder', 'name')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    res.json({
      feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalQueries: total,
        hasNextPage: skip + feedbacks.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    res.status(400).json({ message: 'Error fetching queries', error: err.message });
  }
});

// Get Query Statistics (Admin only)
router.get('/stats', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can view statistics' });
  }
  
  try {
    const [totalQueries, openQueries, inProgressQueries, closedQueries] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'Open' }),
      Feedback.countDocuments({ status: 'In Progress' }),
      Feedback.countDocuments({ status: 'Closed' })
    ]);

    // Queries by category
    const categoryStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Queries by priority
    const priorityStats = await Feedback.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentQueries = await Feedback.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Average response time
    const respondedQueries = await Feedback.find({
      responseDate: { $exists: true }
    }).populate('user', 'name email');

    let totalResponseTime = 0;
    let respondedCount = 0;

    respondedQueries.forEach(query => {
      if (query.responseDate && query.createdAt) {
        const responseTime = query.responseDate - query.createdAt;
        totalResponseTime += responseTime;
        respondedCount++;
      }
    });

    const averageResponseTime = respondedCount > 0 ? totalResponseTime / respondedCount : 0;

    res.json({
      totalQueries,
      openQueries,
      inProgressQueries,
      closedQueries,
      recentQueries,
      averageResponseTime: Math.round(averageResponseTime / (1000 * 60 * 60)), // in hours
      categoryStats,
      priorityStats
    });
  } catch (err) {
    res.status(400).json({ message: 'Error fetching statistics', error: err.message });
  }
});

// Get Single Query by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'name email')
      .populate('adminResponder', 'name');

    if (!feedback) {
      return res.status(404).json({ message: 'Query not found' });
    }

    // Check if user has permission to view this query
    if (req.user.role !== 'admin' && feedback.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(feedback);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching query', error: err.message });
  }
});

// Bulk actions (Admin only)
router.post('/bulk', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can perform bulk actions' });
  }

  try {
    const { action, queryIds } = req.body;

    if (!action || !queryIds || !Array.isArray(queryIds)) {
      return res.status(400).json({ message: 'Invalid bulk action parameters' });
    }

    let updateData = {};

    switch (action) {
      case 'close':
        updateData = { status: 'Closed', updatedAt: new Date() };
        break;
      case 'markInProgress':
        updateData = { status: 'In Progress', updatedAt: new Date() };
        break;
      case 'markOpen':
        updateData = { status: 'Open', updatedAt: new Date() };
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await Feedback.updateMany(
      { _id: { $in: queryIds } },
      updateData
    );

    res.json({
      message: `Bulk action '${action}' completed successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(400).json({ message: 'Error performing bulk action', error: err.message });
  }
});

module.exports = router; 