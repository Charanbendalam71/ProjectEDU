// Backend seeding script - run this from the backend directory
const mongoose = require('mongoose');
require('dotenv').config();

// Use the same MongoDB connection as the server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship-finder';

// Connect to MongoDB first
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Import the seeding function
    const { seedAdminData } = require('./seed/adminData');
    
    console.log('🚀 Starting admin dashboard data seeding...');
    
    try {
      await seedAdminData();
      console.log('🎉 Seeding completed successfully!');
      console.log('\n📊 Your admin dashboard should now show:');
      console.log('   - 5 scholarships');
      console.log('   - 6 applications (3 pending, 2 accepted, 1 denied)');
      console.log('   - 4 queries (2 open, 1 closed, 1 in progress)');
      console.log('   - 3 admin activities');
      console.log('\n🔄 Please refresh the admin dashboard to see the changes.');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }); 