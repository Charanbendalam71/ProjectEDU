const mongoose = require('mongoose');
const Feedback = require('./models/Feedback');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship-finder';

async function createSampleFeedback() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a student user to create feedback for
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log('No student found. Creating a sample student...');
      const sampleStudent = new User({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        education: "Bachelor's Degree",
        interests: 'Computer Science'
      });
      await sampleStudent.save();
      console.log('Sample student created');
    }

    // Clear existing feedback
    await Feedback.deleteMany({});
    console.log('Cleared existing feedback');

    // Create sample feedback entries
    const sampleFeedback = [
      {
        user: student ? student._id : (await User.findOne({ role: 'student' }))._id,
        subject: 'Scholarship Application Issue',
        message: 'I am having trouble submitting my scholarship application. The form keeps showing an error when I try to upload my documents. Can you help me resolve this issue?',
        category: 'Application',
        priority: 'High',
        status: 'Open'
      },
      {
        user: student ? student._id : (await User.findOne({ role: 'student' }))._id,
        subject: 'Eligibility Question',
        message: 'I want to know if I am eligible for the Rhodes Scholarship. I have a 3.8 GPA and I am a US citizen. What are the specific requirements?',
        category: 'Scholarship',
        priority: 'Medium',
        status: 'Open'
      },
      {
        user: student ? student._id : (await User.findOne({ role: 'student' }))._id,
        subject: 'Account Login Problem',
        message: 'I cannot log into my account. It says my password is incorrect, but I am sure I am using the right password. Can you help me reset it?',
        category: 'Account',
        priority: 'Urgent',
        status: 'Open'
      },
      {
        user: student ? student._id : (await User.findOne({ role: 'student' }))._id,
        subject: 'General Inquiry',
        message: 'I would like to know more about the scholarship opportunities available for international students. Are there any specific scholarships for students from India?',
        category: 'General',
        priority: 'Low',
        status: 'Open'
      }
    ];

    const createdFeedback = await Feedback.insertMany(sampleFeedback);
    console.log(`Created ${createdFeedback.length} sample feedback entries`);

    // Display the created feedback
    console.log('\n=== Sample Feedback Created ===');
    createdFeedback.forEach((feedback, index) => {
      console.log(`${index + 1}. Subject: ${feedback.subject}`);
      console.log(`   Category: ${feedback.category}`);
      console.log(`   Priority: ${feedback.priority}`);
      console.log(`   Status: ${feedback.status}`);
      console.log(`   Message: ${feedback.message.substring(0, 100)}...`);
      console.log('');
    });

    console.log('✅ Sample feedback data created successfully!');
    console.log('📝 Admin can now log in and respond to these queries at /admin/feedback');

  } catch (error) {
    console.error('Error creating sample feedback:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createSampleFeedback(); 