// Standalone script to seed admin dashboard data
const { seedAdminData } = require('./backend/seed/adminData');

console.log('🚀 Starting admin dashboard data seeding...');

// Connect to MongoDB and seed data
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship-finder';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return seedAdminData();
  })
  .then(() => {
    console.log('🎉 Seeding completed successfully!');
    console.log('\n📊 Your admin dashboard should now show:');
    console.log('   - 5 scholarships');
    console.log('   - 6 applications (3 pending, 2 accepted, 1 denied)');
    console.log('   - 4 queries (2 open, 1 closed, 1 in progress)');
    console.log('   - 3 admin activities');
    console.log('\n🔄 Please restart your backend server and refresh the admin dashboard.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }); 