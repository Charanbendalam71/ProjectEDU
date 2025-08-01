const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the Scholarship model
const Scholarship = require('../models/Scholarship');

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship-finder';

async function importScholarships() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Read the real scholarships JSON file
    const scholarshipsPath = path.join(__dirname, 'real_scholarships.json');
    const scholarshipsData = JSON.parse(fs.readFileSync(scholarshipsPath, 'utf8'));

    // Clear existing scholarships
    await Scholarship.deleteMany({});
    console.log('Cleared existing scholarships');

    // Insert new scholarships
    const result = await Scholarship.insertMany(scholarshipsData);
    console.log(`Successfully imported ${result.length} scholarships`);

    // Display some statistics
    const totalAmount = result.reduce((sum, scholarship) => sum + scholarship.amount, 0);
    const fields = [...new Set(result.map(s => s.field))];
    const levels = [...new Set(result.map(s => s.level))];

    console.log('\n=== Scholarship Import Summary ===');
    console.log(`Total Scholarships: ${result.length}`);
    console.log(`Total Amount Available: $${totalAmount.toLocaleString()}`);
    console.log(`Fields Covered: ${fields.join(', ')}`);
    console.log(`Education Levels: ${levels.join(', ')}`);

    // Show some sample scholarships
    console.log('\n=== Sample Scholarships ===');
    result.slice(0, 3).forEach(scholarship => {
      console.log(`- ${scholarship.title} ($${scholarship.amount})`);
    });

  } catch (error) {
    console.error('Error importing scholarships:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  importScholarships();
}

module.exports = importScholarships; 