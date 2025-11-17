import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Minimize2 } from 'lucide-react';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const CHATBOT_API_URL = 'http://localhost:3001';

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm HomeEase Assistant. How can I help you today? You can ask me about our services, how to book, payment methods, or how to navigate the platform.",
        timestamp: Date.now()
      }]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${CHATBOT_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          userId: localStorage.getItem('userId') || 'anonymous'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you today?",
      timestamp: Date.now()
    }]);
  };

  if (!isOpen) {
    return (
      <button 
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <MessageCircle size={20} />
          <h3>HomeEase Assistant</h3>
          <span className="status-indicator"></span>
        </div>
        <div className="chatbot-header-actions">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label="Minimize chat"
            className="icon-btn"
          >
            <Minimize2 size={18} />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="icon-btn"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
              >
                <div className="message-content">
                  {msg.content}
                </div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-footer">
            <div className="quick-actions">
              <button onClick={clearChat} className="quick-action-btn">
                Clear Chat
              </button>
            </div>
            <form onSubmit={sendMessage} className="chatbot-input-form">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="chatbot-input"
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || isLoading}
                className="send-btn"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
