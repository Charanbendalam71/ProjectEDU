const mongoose = require('mongoose');
const Scholarship = require('./models/Scholarship');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship-finder';

async function testEligibility() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all scholarships
    const scholarships = await Scholarship.find({ isActive: true });
    console.log(`Found ${scholarships.length} active scholarships`);

    // Test eligibility for a sample student
    const testStudent = {
      educationLevel: "Bachelor's Degree",
      gpa: 3.5,
      citizenship: "US Citizen",
      age: 22,
      fieldOfStudy: "Computer Science",
      category: "General"
    };

    console.log('\n=== Testing Eligibility for Sample Student ===');
    console.log('Student Profile:', testStudent);

    const eligible = scholarships.filter(scholarship => {
      // Education level check
      if (scholarship.level && scholarship.level !== 'Undergraduate') {
        return false;
      }

      // GPA check
      if (scholarship.eligibility?.gpa && testStudent.gpa < scholarship.eligibility.gpa) {
        return false;
      }

      // Age check
      if (scholarship.eligibility?.age && testStudent.age > scholarship.eligibility.age) {
        return false;
      }

      // Citizenship check
      if (scholarship.eligibility?.citizenship) {
        const citizenshipMatch = scholarship.eligibility.citizenship.some(citizen => 
          citizen.toLowerCase().includes(testStudent.citizenship.toLowerCase())
        );
        if (!citizenshipMatch) {
          return false;
        }
      }

      // Field of study check
      if (scholarship.field && scholarship.field !== 'All Fields') {
        const fieldMatch = scholarship.field.toLowerCase().includes(testStudent.fieldOfStudy.toLowerCase());
        if (!fieldMatch) {
          return false;
        }
      }

      return true;
    });

    console.log(`\n✅ Eligible Scholarships: ${eligible.length}`);
    eligible.forEach((scholarship, index) => {
      console.log(`${index + 1}. ${scholarship.title} - $${scholarship.amount} (${scholarship.level})`);
    });

    console.log(`\n❌ Ineligible Scholarships: ${scholarships.length - eligible.length}`);

    // Show some sample ineligible scholarships with reasons
    const ineligible = scholarships.filter(scholarship => !eligible.includes(scholarship));
    ineligible.slice(0, 3).forEach((scholarship, index) => {
      console.log(`${index + 1}. ${scholarship.title} - $${scholarship.amount}`);
      if (scholarship.level !== 'Undergraduate') {
        console.log(`   Reason: Education level mismatch (${scholarship.level} required)`);
      }
      if (scholarship.eligibility?.gpa && testStudent.gpa < scholarship.eligibility.gpa) {
        console.log(`   Reason: GPA below requirement (${scholarship.eligibility.gpa})`);
      }
    });

  } catch (error) {
    console.error('Error testing eligibility:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

testEligibility(); 