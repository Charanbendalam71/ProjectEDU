const fs = require('fs');
const path = require('path');

// Read the existing scholarships
const scholarshipsPath = path.join(__dirname, 'real_scholarships.json');
const scholarshipsData = JSON.parse(fs.readFileSync(scholarshipsPath, 'utf8'));

// Function to determine category based on field and level
function determineCategory(field, level) {
  if (field === 'All Fields') {
    return 'General';
  }
  
  const fieldLower = field.toLowerCase();
  
  if (fieldLower.includes('engineering') || fieldLower.includes('technology')) {
    return 'Engineering & Technology';
  } else if (fieldLower.includes('science') || fieldLower.includes('research')) {
    return 'Science & Research';
  } else if (fieldLower.includes('business') || fieldLower.includes('management') || fieldLower.includes('economics')) {
    return 'Business & Economics';
  } else if (fieldLower.includes('arts') || fieldLower.includes('humanities') || fieldLower.includes('literature')) {
    return 'Arts & Humanities';
  } else if (fieldLower.includes('medicine') || fieldLower.includes('health') || fieldLower.includes('medical')) {
    return 'Medicine & Health';
  } else if (fieldLower.includes('education') || fieldLower.includes('teaching')) {
    return 'Education';
  } else if (fieldLower.includes('law') || fieldLower.includes('legal')) {
    return 'Law & Legal Studies';
  } else if (fieldLower.includes('social') || fieldLower.includes('psychology') || fieldLower.includes('sociology')) {
    return 'Social Sciences';
  } else if (fieldLower.includes('computer') || fieldLower.includes('software') || fieldLower.includes('programming')) {
    return 'Computer Science';
  } else if (fieldLower.includes('environment') || fieldLower.includes('sustainability')) {
    return 'Environment & Sustainability';
  } else {
    return 'General';
  }
}

// Add category field to each scholarship
const updatedScholarships = scholarshipsData.map(scholarship => ({
  ...scholarship,
  category: determineCategory(scholarship.field, scholarship.level)
}));

// Write the updated data back to the file
fs.writeFileSync(scholarshipsPath, JSON.stringify(updatedScholarships, null, 2));

console.log(`Updated ${updatedScholarships.length} scholarships with category field`);
console.log('Categories added:', [...new Set(updatedScholarships.map(s => s.category))]); 