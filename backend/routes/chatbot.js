const express = require('express');
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');
require('dotenv').config(); 
const router = express.Router();

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY // 
});

// Enhanced AI Chatbot Assistant with realistic personality and context awareness
router.post('/', auth, async (req, res) => {
  const { message, conversationHistory = [], userProfile = {} } = req.body;
  
  try {
    // Create a comprehensive system prompt for a realistic scholarship advisor
    const systemPrompt = `You are "ScholarBot", an empathetic and knowledgeable AI scholarship advisor for underprivileged students in India. You have a warm, encouraging personality and deep expertise in educational opportunities.

PERSONALITY TRAITS:
- Warm, supportive, and encouraging tone
- Patient and understanding of students' concerns
- Proactive in offering helpful suggestions
- Uses friendly language while maintaining professionalism
- Shows genuine interest in students' educational goals

EXPERTISE AREAS:
- Indian government scholarships (Central and State level)
- Private foundation scholarships
- University-specific scholarships
- International scholarship opportunities
- Application processes and requirements
- Document preparation guidance
- Financial aid resources
- Study abroad opportunities
- Career counseling related to education

CONVERSATION STYLE:
- Ask follow-up questions to better understand student needs
- Provide specific, actionable advice
- Share relevant examples and success stories
- Offer step-by-step guidance when appropriate
- Acknowledge the challenges students face
- Celebrate their achievements and potential

RESPONSE GUIDELINES:
- Keep responses conversational but informative
- Use bullet points for lists when helpful
- Include relevant deadlines and important dates
- Suggest next steps when appropriate
- Be encouraging about their educational journey
- If you don't know something specific, suggest where they can find more information

Remember: You're talking to students who may be the first in their family to pursue higher education. Be supportive, clear, and empowering in your responses.`;

    // Build conversation context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const reply = completion.choices[0].message.content;
    
    // Add typing simulation delay for realism
    const typingDelay = Math.min(reply.length * 50, 2000); // 50ms per character, max 2 seconds
    
    setTimeout(() => {
      res.json({ 
        reply,
        typingDelay,
        timestamp: new Date().toISOString(),
        suggestions: generateFollowUpSuggestions(message, reply)
      });
    }, typingDelay);

  } catch (err) {
    console.error('Chatbot error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: err.status
    });
    res.status(500).json({ 
      reply: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment, or feel free to contact our support team for immediate assistance.',
      error: true,
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Generate contextual follow-up suggestions
function generateFollowUpSuggestions(userMessage, botReply) {
  const suggestions = [];
  
  // Analyze user message and bot reply for better context
  const messageLower = userMessage.toLowerCase();
  const replyLower = botReply.toLowerCase();
  
  // Scholarship application context
  if (messageLower.includes('scholarship') || messageLower.includes('apply') || replyLower.includes('scholarship')) {
    suggestions.push('What documents do I need?', 'When is the deadline?', 'Am I eligible?');
  }
  
  // Eligibility context
  if (messageLower.includes('eligibility') || messageLower.includes('qualify') || messageLower.includes('eligible') || replyLower.includes('eligibility')) {
    suggestions.push('What are the income requirements?', 'Do I need good grades?', 'Can I apply for multiple scholarships?');
  }
  
  // Document context
  if (messageLower.includes('document') || messageLower.includes('paperwork') || messageLower.includes('certificate') || replyLower.includes('document')) {
    suggestions.push('How do I get income certificates?', 'What if I don\'t have all documents?', 'Where can I get help with documents?');
  }
  
  // Deadline context
  if (messageLower.includes('deadline') || messageLower.includes('time') || messageLower.includes('when') || replyLower.includes('deadline')) {
    suggestions.push('Can I apply late?', 'When do results come out?', 'What if I miss the deadline?');
  }
  
  // Financial aid context
  if (messageLower.includes('money') || messageLower.includes('financial') || messageLower.includes('cost') || replyLower.includes('financial')) {
    suggestions.push('Are there other financial aid options?', 'What about education loans?', 'How much can I get?');
  }
  
  // Study abroad context
  if (messageLower.includes('abroad') || messageLower.includes('international') || messageLower.includes('foreign') || replyLower.includes('international')) {
    suggestions.push('What are the visa requirements?', 'How much does it cost?', 'Are there language requirements?');
  }
  
  // Engineering/Medical context
  if (messageLower.includes('engineering') || messageLower.includes('medical') || messageLower.includes('doctor') || replyLower.includes('engineering') || replyLower.includes('medical')) {
    suggestions.push('What are the best colleges?', 'How competitive is it?', 'What are the career prospects?');
  }
  
  // Government scholarship context
  if (messageLower.includes('government') || messageLower.includes('central') || messageLower.includes('state') || replyLower.includes('government')) {
    suggestions.push('What are the state scholarships?', 'How do I apply online?', 'What documents are required?');
  }
  
  // Default suggestions if no specific context
  if (suggestions.length === 0) {
    const defaultSuggestions = [
      'Tell me about popular scholarships',
      'How do I improve my chances?',
      'What if I need financial help?',
      'Which scholarships are easiest to get?',
      'How do I write a good application?',
      'What are the most common mistakes?'
    ];
    suggestions.push(...defaultSuggestions.slice(0, 3));
  }
  
  return suggestions.slice(0, 3); // Return max 3 suggestions
}

// Get chatbot personality info
router.get('/personality', (req, res) => {
  res.json({
    name: 'ScholarBot',
    avatar: '🎓',
    description: 'Your friendly scholarship advisor',
    capabilities: [
      'Scholarship recommendations',
      'Application guidance',
      'Document assistance',
      'Eligibility checking',
      'Deadline reminders',
      'Success tips'
    ]
  });
});

// Public chatbot endpoint for unauthenticated users (limited functionality)
router.post('/public', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  
  try {
    const systemPrompt = `You are "ScholarBot", a helpful AI scholarship advisor. You can provide general information about scholarships but should encourage users to sign up for personalized assistance.

RESPONSE GUIDELINES:
- Provide helpful general information about scholarships
- Be encouraging and supportive
- Suggest signing up for personalized help
- Keep responses concise and informative
- Focus on Indian scholarship opportunities

Remember: You're helping students who may need guidance. Be supportive and encouraging.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-5), // Keep last 5 messages for context
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;
    
    res.json({ 
      reply,
      timestamp: new Date().toISOString(),
      suggestions: ['Sign up for personalized help', 'Learn about popular scholarships', 'Check eligibility criteria']
    });

  } catch (err) {
    console.error('Public chatbot error:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: err.status
    });
    res.status(500).json({ 
      reply: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
      error: true,
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 