// Test script for the AI Chatbot
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Configure axios with timeout
axios.defaults.timeout = 10000; // 10 seconds timeout

async function testChatbot() {
  console.log('🤖 Testing ScholarBot AI Chatbot...\n');

  try {
    // Test 1: Get chatbot personality
    console.log('1. Testing chatbot personality endpoint...');
    const personalityResponse = await axios.get(`${API_BASE_URL}/chatbot/personality`);
    console.log('✅ Personality endpoint working:', personalityResponse.data);
    console.log('');

    // Test 2: Test public chatbot (unauthenticated)
    console.log('2. Testing public chatbot endpoint...');
    const publicResponse = await axios.post(`${API_BASE_URL}/chatbot/public`, {
      message: 'Tell me about popular scholarships in India',
      conversationHistory: []
    });
    console.log('✅ Public chatbot response:', publicResponse.data.reply);
    console.log('');

    // Test 3: Test authenticated chatbot (you'll need a valid token)
    console.log('3. Testing authenticated chatbot endpoint...');
    console.log('⚠️  This requires a valid JWT token. Please login first to test.');
    console.log('   You can test this manually through the frontend.');
    console.log('');

    console.log('🎉 Basic chatbot tests completed successfully!');
    console.log('');
    console.log('To test the full functionality:');
    console.log('1. Start the backend server: npm start (in backend directory)');
    console.log('2. Start the frontend: npm run dev (in scholarship-finder-react directory)');
    console.log('3. Open the application and try the floating chatbot');
    console.log('4. Test both authenticated and unauthenticated modes');

  } catch (error) {
    console.error('❌ Error testing chatbot:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the backend server first.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('❌ Request timed out. Server might be slow to respond.');
    }
  }
}

// Run the test
testChatbot(); 