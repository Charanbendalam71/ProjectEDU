// Debug script to test OpenAI API directly
const { OpenAI } = require('openai');
require('dotenv').config(); // Load environment variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  console.log('🔍 Testing OpenAI API directly...\n');

  try {
    console.log('1. Testing with gpt-3.5-turbo...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, how are you?' }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    console.log('✅ gpt-3.5-turbo working:', completion.choices[0].message.content);

  } catch (error) {
    console.error('❌ Error with gpt-3.5-turbo:', error.message);
  }

  try {
    console.log('\n2. Testing with gpt-4o-mini...');
    const completion2 = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, how are you?' }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    console.log('✅ gpt-4o-mini working:', completion2.choices[0].message.content);

  } catch (error) {
    console.error('❌ Error with gpt-4o-mini:', error.message);
  }
}

testOpenAI();
