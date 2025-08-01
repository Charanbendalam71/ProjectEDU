const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const auth = require('../middleware/auth');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  console.log('Document test endpoint hit');
  res.json({ 
    message: 'Document routes are working!',
    timestamp: new Date().toISOString(),
    routes: ['/upload', '/my', '/download/:id', '/delete/:id']
  });
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/documents';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  }
});

// Student: Upload Documents
router.post('/upload', auth, (req, res, next) => {
  console.log('Document upload request received');
  console.log('User from token:', req.user);
  
  upload.array('documents', 10)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum 10 files allowed.' });
      }
      return res.status(400).json({ message: 'Upload error: ' + err.message });
    } else if (err) {
      console.error('File filter error:', err);
      return res.status(400).json({ message: err.message });
    }
    console.log('Files uploaded successfully:', req.files);
    next();
  });
}, async (req, res) => {
  try {
    console.log('Processing uploaded files...');
    if (!req.files || req.files.length === 0) {
      console.log('No files found in request');
      return res.status(400).json({ message: 'No files uploaded' });
    }

    console.log('Files to process:', req.files.length);
    const uploadedFiles = [];
    
    for (const file of req.files) {
      try {
        console.log('Processing file:', file.originalname);
        const document = new Document({
          user: req.user.userId,
          name: file.originalname,
          filename: file.filename,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype,
          uploadDate: new Date()
        });
        
        console.log('Saving document to database...');
        const savedDocument = await document.save();
        console.log('Document saved successfully:', savedDocument._id);
        
        uploadedFiles.push({
          id: savedDocument._id,
          name: savedDocument.name,
          size: savedDocument.size,
          type: savedDocument.mimetype,
          uploadDate: savedDocument.uploadDate
        });
      } catch (fileError) {
        console.error('Error processing file:', file.originalname, fileError);
        // Continue with other files even if one fails
      }
    }

    console.log('All files processed successfully');
    res.status(201).json({
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (err) {
    console.error('Upload processing error:', err);
    res.status(500).json({ message: 'Error uploading documents', error: err.message });
  }
});

// Student: List My Documents
router.get('/my', auth, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.userId }).sort({ uploadDate: -1 });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
});

// Student: Download Document
router.get('/download/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.download(document.path, document.name);
  } catch (err) {
    res.status(500).json({ message: 'Error downloading document', error: err.message });
  }
});

// Student: Delete Document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting document', error: err.message });
  }
});

module.exports = router; 