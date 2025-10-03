// Socket.io Configuration for Real-time Messaging

const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const verified = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = verified.id;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  // Connected users map
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Store socket connection
    connectedUsers.set(socket.userId, socket.id);

    // Emit online status to all users
    socket.broadcast.emit('user-online', socket.userId);

    // Join user to their own room for private notifications
    socket.join(`user-${socket.userId}`);

    // JOIN CONVERSATION
    socket.on('join-conversation', (conversationId) => {
      socket.join(`conversation-${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // LEAVE CONVERSATION
    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conversation-${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // SEND MESSAGE
    socket.on('send-message', async (data) => {
      const { conversationId, message } = data;
      
      try {
        // Emit message to all users in conversation except sender
        socket.to(`conversation-${conversationId}`).emit('new-message', {
          conversationId,
          message
        });

        // Send delivery confirmation to sender
        socket.emit('message-delivered', {
          tempId: message.tempId,
          messageId: message._id
        });

        console.log(`Message sent in conversation ${conversationId}`);
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('message-error', {
          tempId: message.tempId,
          error: 'Failed to send message'
        });
      }
    });

    // TYPING INDICATOR
    socket.on('typing-start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation-${conversationId}`).emit('user-typing', {
        conversationId,
        userId: socket.userId
      });
    });

    socket.on('typing-stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation-${conversationId}`).emit('user-stopped-typing', {
        conversationId,
        userId: socket.userId
      });
    });

    // MESSAGE READ RECEIPT
    socket.on('mark-read', (data) => {
      const { conversationId, messageIds } = data;
      socket.to(`conversation-${conversationId}`).emit('messages-read', {
        conversationId,
        messageIds,
        readBy: socket.userId,
        readAt: new Date()
      });
    });

    // NOTIFICATION
    socket.on('send-notification', (data) => {
      const { recipientId, notification } = data;
      io.to(`user-${recipientId}`).emit('notification', notification);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);
      
      // Emit offline status
      socket.broadcast.emit('user-offline', socket.userId);
    });

    // GET ONLINE USERS
    socket.on('get-online-users', () => {
      socket.emit('online-users', Array.from(connectedUsers.keys()));
    });

    // ERROR HANDLING
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

module.exports = setupSocket;

/*
===========================================
INTEGRATION INSTRUCTIONS:
===========================================

In your main server file (index.js or app.js):

1. Install Socket.io:
   npm install socket.io

2. Import and setup:

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const setupSocket = require('./socket');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    credentials: true
  }
});

// Setup socket
setupSocket(io);

// Make io available to routes if needed
app.set('io', io);

// ... rest of your routes

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

3. Register message routes:
const messageRoutes = require('./routes/message');
app.use('/messages', messageRoutes);

===========================================
*/
