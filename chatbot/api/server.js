const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration - handle both string and array format
const corsOrigin = process.env.CORS_ORIGIN 
  ? (process.env.CORS_ORIGIN.includes(',') 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : process.env.CORS_ORIGIN)
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/chat', limiter);

// No persistent session storage - conversations are temporary
// Sessions are only kept in memory during the request

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'HomeEase Chatbot API',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }
    
    // Call n8n webhook directly (no session storage)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chat';
    
    const response = await axios.post(n8nWebhookUrl, {
      message,
      userId: userId || 'anonymous'
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    const botResponse = response.data.response;
    
    res.json({
      success: true,
      response: botResponse,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Chatbot service is temporarily unavailable. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment and try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your message. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// No chat history endpoints - all conversations are temporary

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🤖 HomeEase Chatbot API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 N8N Webhook URL: ${process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chat'}`);
});

module.exports = app;
