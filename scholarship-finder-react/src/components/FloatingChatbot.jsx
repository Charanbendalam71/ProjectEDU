import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './FloatingChatbot.css';

const FloatingChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [chatbotInfo, setChatbotInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Show different behavior for authenticated vs unauthenticated users
  const isAuthenticated = !!user;

  // Welcome messages
  const welcomeMessages = isAuthenticated ? [
    "Hello! I'm ScholarBot, your personal scholarship advisor. How can I help you today?",
    "Welcome! I'm here to guide you through your scholarship journey. What would you like to know?",
    "Hi there! I'm excited to help you find the perfect scholarship opportunities. What's on your mind?"
  ] : [
    "Hello! I'm ScholarBot, your scholarship advisor. I can help you learn about scholarships!",
    "Welcome! I'm here to guide you through scholarship opportunities. What would you like to know?",
    "Hi there! I can help you find scholarship information. Sign up for personalized assistance!"
  ];

  useEffect(() => {
    if (isOpen) {
      initializeChatbot();
      if (messages.length === 0) {
        const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        addMessage('bot', welcomeMsg, new Date());
        
        setSuggestions(isAuthenticated ? [
          'Tell me about popular scholarships',
          'How do I check my eligibility?',
          'What documents do I need?',
          'Help me with my application'
        ] : [
          'Tell me about popular scholarships',
          'How do I check my eligibility?',
          'Sign up for personalized help',
          'Learn about application process'
        ]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatbot = async () => {
    try {
      const headers = {};
      if (isAuthenticated) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }
      
      const response = await fetch('/api/chatbot/personality', { headers });
      if (response.ok) {
        const data = await response.json();
        setChatbotInfo(data);
      }
    } catch (error) {
      console.error('Error fetching chatbot info:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (sender, content, timestamp) => {
    const newMessage = {
      id: Date.now(),
      sender,
      content,
      timestamp: timestamp || new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    // Add user message
    addMessage('user', messageContent, new Date());
    setInputMessage('');
    setIsTyping(true);

    try {
      const endpoint = isAuthenticated ? '/api/chatbot' : '/api/chatbot/public';
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (isAuthenticated) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: messageContent,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        })
      });

      const data = await response.json();

      if (data.error) {
        addMessage('bot', data.reply, new Date());
      } else {
        // Simulate typing delay
        setTimeout(() => {
          addMessage('bot', data.reply, new Date());
          if (data.suggestions) {
            setSuggestions(data.suggestions);
          }
        }, data.typingDelay || 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('bot', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.', new Date());
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="floating-chatbot">
      {/* Chat Widget */}
      {isOpen && (
        <div className="chat-widget">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-avatar">
              {chatbotInfo?.avatar || '🎓'}
            </div>
            <div className="chat-info">
              <h4 className="chat-name">{chatbotInfo?.name || 'ScholarBot'}</h4>
              <p className="chat-status">
                {isTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
            <button className="close-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {formatTime(message.timestamp)}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Sign-up prompt for unauthenticated users */}
          {!isAuthenticated && messages.length > 2 && (
            <div className="signup-prompt">
              <div className="signup-content">
                <h5>Get Personalized Help!</h5>
                <p>Sign up to access personalized scholarship recommendations and track your applications.</p>
                <Link to="/signup" className="signup-btn" onClick={toggleChat}>
                  Sign Up Now
                </Link>
              </div>
            </div>
          )}

          {/* Quick Suggestions */}
          {suggestions.length > 0 && !isTyping && (
            <div className="quick-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isAuthenticated ? "Type your message here..." : "Ask me about scholarships..."}
              disabled={isTyping}
              className="message-input"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="send-btn"
            >
              <span>📤</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button className="chat-fab" onClick={toggleChat}>
        <span className="fab-icon">💬</span>
        {messages.length > 0 && (
          <span className="notification-badge">{messages.length}</span>
        )}
      </button>
    </div>
  );
};

export default FloatingChatbot; 