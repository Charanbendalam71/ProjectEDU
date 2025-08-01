const mongoose = require('mongoose');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const Feedback = require('../models/Feedback');
const AdminActivity = require('../models/AdminActivity');

// Sample data for seeding
const sampleScholarships = [
  {
    id: "PMSS001",
    title: "Prime Minister's Scholarship Scheme",
    category: "Government",
    amount: 50000,
    currency: "INR",
    deadline: new Date('2024-12-31'),
    organization: "Government of India",
    field: "All Fields",
    level: "Undergraduate",
    country: "India",
    description: "Merit-based scholarship for outstanding students from economically weaker sections.",
    eligibility: {
      gpa: 8.5,
      citizenship: ["Indian"],
      enrollment: "Full-time",
      year: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
      firstGeneration: true
    },
    requirements: ["Income Certificate", "Caste Certificate", "Academic Records"],
    tags: ["Government", "Merit-based", "Economically Weaker"],
    applicationUrl: "https://scholarships.gov.in/pmss",
    contactEmail: "pmss@gov.in"
  },
  {
    id: "TTS002",
    title: "Tata Trust Scholarship",
    category: "Private Foundation",
    amount: 75000,
    currency: "INR",
    deadline: new Date('2024-11-30'),
    organization: "Tata Trusts",
    field: "Engineering",
    level: "Undergraduate",
    country: "India",
    description: "Scholarship for students pursuing engineering and medical courses.",
    eligibility: {
      gpa: 8.0,
      citizenship: ["Indian"],
      enrollment: "Full-time",
      year: ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    },
    requirements: ["Academic Records", "Family Income Certificate", "Recommendation Letter"],
    tags: ["Engineering", "Medical", "Private Foundation"],
    applicationUrl: "https://tatatrusts.org/scholarships",
    contactEmail: "scholarships@tatatrusts.org"
  },
  {
    id: "RFS003",
    title: "Reliance Foundation Scholarship",
    category: "Corporate",
    amount: 100000,
    currency: "INR",
    deadline: new Date('2024-10-15'),
    organization: "Reliance Foundation",
    field: "All Fields",
    level: "Graduate",
    country: "India",
    description: "Comprehensive scholarship covering tuition fees and living expenses.",
    eligibility: {
      gpa: 8.2,
      citizenship: ["Indian"],
      enrollment: "Full-time",
      year: ["1st Year", "2nd Year"]
    },
    requirements: ["Academic Records", "Income Certificate", "Personal Statement"],
    tags: ["Corporate", "Comprehensive", "Graduate"],
    applicationUrl: "https://reliancefoundation.org/scholarships",
    contactEmail: "scholarships@reliancefoundation.org"
  },
  {
    id: "SMS004",
    title: "State Merit Scholarship",
    category: "State Government",
    amount: 25000,
    currency: "INR",
    deadline: new Date('2024-09-30'),
    organization: "State Education Department",
    field: "All Fields",
    level: "Undergraduate",
    country: "India",
    description: "Merit-based scholarship for state board toppers.",
    eligibility: {
      gpa: 9.0,
      citizenship: ["State Resident"],
      enrollment: "Full-time",
      year: ["1st Year"]
    },
    requirements: ["State Board Certificate", "Academic Records", "Domicile Certificate"],
    tags: ["State Government", "Merit-based", "State Board"],
    applicationUrl: "https://stateeducation.gov.in/scholarships",
    contactEmail: "scholarships@stateeducation.gov.in"
  },
  {
    id: "ISEP005",
    title: "International Student Exchange Program",
    category: "International",
    amount: 200000,
    currency: "INR",
    deadline: new Date('2024-08-31'),
    organization: "Ministry of Education",
    field: "All Fields",
    level: "Undergraduate",
    country: "Multiple Countries",
    description: "Exchange program for students to study abroad.",
    eligibility: {
      gpa: 8.8,
      citizenship: ["Indian"],
      enrollment: "Full-time",
      year: ["2nd Year", "3rd Year"]
    },
    requirements: ["Academic Records", "Language Proficiency", "Passport", "Visa Documents"],
    tags: ["International", "Exchange", "Study Abroad"],
    applicationUrl: "https://education.gov.in/international-programs",
    contactEmail: "international@education.gov.in"
  }
];

const sampleApplications = [
  {
    status: 'Pending',
    createdAt: new Date('2024-01-15')
  },
  {
    status: 'Accepted',
    createdAt: new Date('2024-01-10')
  },
  {
    status: 'Denied',
    createdAt: new Date('2024-01-05')
  },
  {
    status: 'Pending',
    createdAt: new Date('2024-01-20')
  },
  {
    status: 'Accepted',
    createdAt: new Date('2024-01-12')
  },
  {
    status: 'Pending',
    createdAt: new Date('2024-01-18')
  }
];

const sampleFeedback = [
  {
    subject: "Scholarship Application Query",
    message: "I need help with the application process for the Prime Minister's Scholarship.",
    category: "Application",
    priority: "High",
    status: "Open"
  },
  {
    subject: "Technical Issue",
    message: "I'm unable to upload my documents. Please help.",
    category: "Technical",
    priority: "Medium",
    status: "Open"
  },
  {
    subject: "Eligibility Question",
    message: "Am I eligible for the Tata Trust Scholarship?",
    category: "Scholarship",
    priority: "Low",
    status: "Closed"
  },
  {
    subject: "Account Access Issue",
    message: "I forgot my password and can't reset it.",
    category: "Account",
    priority: "High",
    status: "In Progress"
  }
];

const sampleAdminActivities = [
  {
    action: 'created',
    scholarshipTitle: 'Prime Minister\'s Scholarship Scheme',
    details: 'Added new government scholarship',
    adminName: 'Admin User'
  },
  {
    action: 'updated',
    scholarshipTitle: 'Tata Trust Scholarship',
    details: 'Updated eligibility criteria',
    adminName: 'Admin User'
  },
  {
    action: 'deleted',
    scholarshipTitle: 'Old Scholarship Program',
    details: 'Removed expired scholarship',
    adminName: 'Admin User'
  }
];

async function seedAdminData() {
  try {
    console.log('🌱 Seeding admin dashboard data...');

    // Clear existing data
    await Scholarship.deleteMany({});
    await Application.deleteMany({});
    await Feedback.deleteMany({});
    await AdminActivity.deleteMany({});

    // Create sample scholarships
    const createdScholarships = await Scholarship.insertMany(sampleScholarships);
    console.log(`✅ Created ${createdScholarships.length} scholarships`);

    // Create sample applications (link to first scholarship and a sample user)
    const sampleUser = await User.findOne();
    if (sampleUser) {
      const applicationsWithData = sampleApplications.map((app, index) => ({
        ...app,
        student: sampleUser._id,
        scholarship: createdScholarships[index % createdScholarships.length]._id
      }));
      await Application.insertMany(applicationsWithData);
      console.log(`✅ Created ${applicationsWithData.length} applications`);
    }

    // Create sample feedback
    const feedbackWithUser = sampleFeedback.map(feedback => ({
      ...feedback,
      user: sampleUser ? sampleUser._id : null
    }));
    await Feedback.insertMany(feedbackWithUser);
    console.log(`✅ Created ${feedbackWithUser.length} feedback entries`);

    // Create sample admin activities with adminId
    const adminUser = await User.findOne({ role: 'admin' }) || sampleUser;
    const adminActivitiesWithId = sampleAdminActivities.map(activity => ({
      ...activity,
      adminId: adminUser ? adminUser._id : sampleUser._id
    }));
    await AdminActivity.insertMany(adminActivitiesWithId);
    console.log(`✅ Created ${adminActivitiesWithId.length} admin activities`);

    console.log('🎉 Admin dashboard data seeded successfully!');
    console.log('\n📊 Dashboard should now show:');
    console.log(`   - ${createdScholarships.length} scholarships`);
    console.log(`   - ${sampleApplications.length} applications`);
    console.log(`   - ${sampleFeedback.filter(f => f.status === 'Open').length} open queries`);
    console.log(`   - ${sampleApplications.filter(a => a.status === 'Pending').length} pending applications`);

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
  }
}

// Run the seeding function only if this file is run directly
if (require.main === module) {
  require('dotenv').config();
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship-finder';
  
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return seedAdminData();
    })
    .then(() => {
      console.log('Seeding completed');
      return mongoose.connection.close();
    })
    .then(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAdminData }; 