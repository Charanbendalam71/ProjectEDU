const express = require('express');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Student: Apply for Scholarship (Complete Application)
router.post('/', auth, async (req, res) => {
  // Check if user is a student
  if (req.user.role !== 'student') {
    return res.status(403).json({ 
      message: 'Only students can submit scholarship applications' 
    });
  }
  try {
    const {
      scholarshipId,
      personalStatement,
      gpa,
      citizenship,
      enrollmentStatus,
      academicLevel,
      phoneNumber,
      address,
      emergencyContact
    } = req.body;

    // Validate required fields
    if (!scholarshipId || !personalStatement || !gpa || !citizenship || !enrollmentStatus || !academicLevel || !phoneNumber || !address) {
      return res.status(400).json({
        message: 'All required fields must be provided'
      });
    }

    // Check if student already applied for this scholarship
    const existingApplication = await Application.findOne({
      student: req.user.userId,
      scholarship: scholarshipId
    });

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'You have already applied for this scholarship' 
      });
    }

    // Create new application
    const application = new Application({
      student: req.user.userId,
      scholarship: scholarshipId,
      status: 'Pending',
      personalStatement,
      gpa,
      citizenship,
      enrollmentStatus,
      academicLevel,
      phoneNumber,
      address,
      emergencyContact,
      appliedAt: new Date()
    });

    await application.save();

    // Populate scholarship details for response
    await application.populate('scholarship');
    res.status(201).json({
      message: 'Application submitted successfully!',
      application
    });
  } catch (err) {
    console.error('Application submission error:', err);
    res.status(400).json({ 
      message: 'Error submitting application', 
      error: err.message 
    });
  }
});

// Student: Get My Applications
router.get('/my', auth, async (req, res) => {
  try {
    const applications = await Application.find({ 
      student: req.user.userId 
    }).populate('scholarship');
    
    res.json(applications);
  } catch (err) {
    res.status(400).json({ 
      message: 'Error fetching applications', 
      error: err.message 
    });
  }
});

// Admin: Get Application Statistics (Moved to top to avoid route conflicts)
router.get('/stats/overview', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'Pending' });
    const acceptedApplications = await Application.countDocuments({ status: 'Accepted' });
    const deniedApplications = await Application.countDocuments({ status: 'Denied' });

    // Applications by scholarship
    const applicationsByScholarship = await Application.aggregate([
      {
        $lookup: {
          from: 'scholarships',
          localField: 'scholarship',
          foreignField: '_id',
          as: 'scholarshipInfo'
        }
      },
      {
        $group: {
          _id: '$scholarship',
          count: { $sum: 1 },
          scholarshipTitle: { $first: '$scholarshipInfo.title' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      totalApplications,
      pendingApplications,
      acceptedApplications,
      deniedApplications,
      applicationsByScholarship
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error fetching statistics', 
      error: err.message 
    });
  }
});

// Student: Get Application by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scholarship')
      .populate('adminReviewer', 'name email');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns this application or is admin
    if (application.student.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(application);
  } catch (err) {
    res.status(400).json({ 
      message: 'Error fetching application', 
      error: err.message 
    });
  }
});

// Admin: Get All Applications (with filtering)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const { status, scholarshipId, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (scholarshipId) query.scholarship = scholarshipId;

    const applications = await Application.find(query)
      .populate('student', 'name email')
      .populate('scholarship', 'title organization amount')
      .populate('adminReviewer', 'name')
      .sort({ appliedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalApplications: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error fetching applications', 
      error: err.message 
    });
  }
});

// Admin: Update Application Status (Accept/Deny/Pending)
router.put('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const { status, adminNotes } = req.body;
    
    if (!['Pending', 'Accepted', 'Denied'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be Pending, Accepted, or Denied' 
      });
    }

    const updateData = {
      status,
      adminReviewDate: new Date(),
      adminReviewer: req.user.userId
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('student', 'name email')
     .populate('scholarship', 'title organization');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      message: `Application ${status.toLowerCase()} successfully`,
      application
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error updating application status', 
      error: err.message 
    });
  }
});



// Student: Bookmark Scholarship
router.post('/bookmark', auth, async (req, res) => {
  try {
    const { scholarshipId } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user.bookmarks.includes(scholarshipId)) {
      user.bookmarks.push(scholarshipId);
      await user.save();
    }
    
    res.json({ message: 'Scholarship bookmarked successfully' });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error bookmarking scholarship', 
      error: err.message 
    });
  }
});

// Student: Remove Bookmark
router.delete('/bookmark/:scholarshipId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.bookmarks = user.bookmarks.filter(
      bookmark => bookmark.toString() !== req.params.scholarshipId
    );
    await user.save();
    
    res.json({ message: 'Bookmark removed successfully' });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error removing bookmark', 
      error: err.message 
    });
  }
});

module.exports = router; 