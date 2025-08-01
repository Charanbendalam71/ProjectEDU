import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [chatbotInfo, setChatbotInfo] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome messages
  const welcomeMessages = [
    "Hello! I'm ScholarBot, your personal scholarship advisor. How can I help you today?",
    "Welcome! I'm here to guide you through your scholarship journey. What would you like to know?",
    "Hi there! I'm excited to help you find the perfect scholarship opportunities. What's on your mind?"
  ];

  useEffect(() => {
    // Initialize chatbot
    initializeChatbot();
    
    // Add welcome message
    const welcomeMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    addMessage('bot', welcomeMsg, new Date());
    
    // Set initial suggestions
    setSuggestions([
      'Tell me about popular scholarships',
      'How do I check my eligibility?',
      'What documents do I need?',
      'Help me with my application'
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatbot = async () => {
    try {
      const response = await fetch('/api/chatbot/personality', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot-widget ${isMinimized ? 'minimized' : ''}`}>
        {/* Header */}
        <div className="chatbot-header" onClick={toggleMinimize}>
          <div className="chatbot-avatar">
            {chatbotInfo?.avatar || '🎓'}
          </div>
          <div className="chatbot-info">
            <h4 className="chatbot-name">{chatbotInfo?.name || 'ScholarBot'}</h4>
            <p className="chatbot-status">
              {isTyping ? 'Typing...' : 'Online'}
            </p>
          </div>
          <button className="minimize-btn">
            {isMinimized ? '🔽' : '🔼'}
          </button>
        </div>

        {/* Chat Messages */}
        {!isMinimized && (
          <>
            <div className="chatbot-messages">
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

            {/* Input Area */}
            <form className="chatbot-input" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
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
          </>
        )}
      </div>

      {/* Floating Action Button for mobile */}
      <div className="chatbot-fab" onClick={() => setIsMinimized(false)}>
        <span>💬</span>
      </div>
    </div>
  );
};

export default Chatbot; 