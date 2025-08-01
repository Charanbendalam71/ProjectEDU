const express = require('express');
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');

require('dotenv').config(); // Ensure environment variables are loaded

const router = express.Router();

// Initialize OpenAI client with API key from environment variable
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} catch (error) {
  console.warn('OpenAI client initialization failed:', error.message);
  openai = null;
}

// Enhanced AI Chatbot Assistant with realistic personality and context awareness
router.post('/', auth, async (req, res) => {
  const { message, conversationHistory = [], userProfile = {} } = req.body;

  // Check if OpenAI is available
  if (!openai) {
    return res.status(503).json({
      reply: 'I apologize, but the AI chatbot service is currently unavailable. Please try again later or contact support for assistance.',
      error: true,
      serviceUnavailable: true
    });
  }

  try {
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

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
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
    const typingDelay = Math.min(reply.length * 50, 2000);

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
    res.status(500).json({
      reply: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
      error: true
    });
  }
});

function generateFollowUpSuggestions(userMessage, botReply) {
  const suggestions = [];
  const messageLower = userMessage.toLowerCase();
  const replyLower = botReply.toLowerCase();

  if (messageLower.includes('scholarship') || replyLower.includes('scholarship')) {
    suggestions.push('What documents do I need?', 'When is the deadline?', 'Am I eligible?');
  }

  if (suggestions.length === 0) {
    suggestions.push('Tell me about popular scholarships', 'How do I improve my chances?', 'What if I need financial help?');
  }

  return suggestions.slice(0, 3);
}

router.get('/personality', (req, res) => {
  res.json({
    name: 'ScholarBot',
    avatar: '🎓',
    description: 'Your friendly scholarship advisor'
  });
});

module.exports = router;
