const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Listing = require('../models/Listing');

// Middleware
const verifyToken = require('../middleware/auth');

// GET OR CREATE CONVERSATION
router.post('/conversation/create', verifyToken, async (req, res) => {
  try {
    const { recipientId, listingId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!recipientId || !listingId) {
      return res.status(400).json({ 
        message: "Missing required fields: recipientId and listingId are required" 
      });
    }

    // Validate recipientId is not undefined or null
    if (recipientId === 'undefined' || recipientId === 'null') {
      return res.status(400).json({ 
        message: "Invalid recipientId" 
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      listing: listingId
    }).populate('participants', 'firstName lastName profileImagePath')
      .populate('listing', 'title city listingPhotoPaths');

    if (!conversation) {
      // Create new conversation with validated IDs
      const unreadCountMap = new Map();
      unreadCountMap.set(userId.toString(), 0);
      unreadCountMap.set(recipientId.toString(), 0);

      conversation = new Conversation({
        participants: [userId, recipientId],
        listing: listingId,
        unreadCount: unreadCountMap
      });
      
      await conversation.save();
      
      // Populate after save
      await conversation.populate('participants', 'firstName lastName profileImagePath');
      await conversation.populate('listing', 'title city listingPhotoPaths');
    }

    res.status(200).json(conversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: "Failed to create conversation", error: err.message });
  }
});

// GET USER'S CONVERSATIONS
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
      status: 'active'
    })
      .populate('participants', 'firstName lastName profileImagePath')
      .populate('listing', 'title city listingPhotoPaths')
      .populate('lastMessage.sender', 'firstName lastName')
      .sort({ updatedAt: -1 });

    // Transform to include other participant info
    const transformedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId
      );
      
      return {
        ...conv.toObject(),
        otherParticipant,
        unreadCount: conv.unreadCount.get(userId) || 0
      };
    });

    res.status(200).json(transformedConversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: "Failed to fetch conversations", error: err.message });
  }
});

// GET MESSAGES IN CONVERSATION
router.get('/conversation/:conversationId/messages', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get messages
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'firstName lastName profileImagePath')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversation: conversationId });

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: userId },
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    res.status(200).json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
      }
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: "Failed to fetch messages", error: err.message });
  }
});

// SEND MESSAGE
router.post('/conversation/:conversationId/message', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType, imageUrl, bookingId } = req.body;
    const userId = req.user.id;

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Create message
    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      messageType: messageType || 'text',
      imageUrl,
      bookingId,
    });

    await message.save();
    await message.populate('sender', 'firstName lastName profileImagePath');

    // Update conversation
    const otherParticipantId = conversation.participants.find(
      p => p.toString() !== userId
    );

    conversation.lastMessage = {
      content,
      sender: userId,
      timestamp: new Date()
    };

    // Increment unread count for other participant
    const currentUnread = conversation.unreadCount.get(otherParticipantId.toString()) || 0;
    conversation.unreadCount.set(otherParticipantId.toString(), currentUnread + 1);
    
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: "Failed to send message", error: err.message });
  }
});

// MARK CONVERSATION AS READ
router.patch('/conversation/:conversationId/read', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Mark all messages as read
    await Message.updateMany(
      { 
        conversation: conversationId,
        sender: { $ne: userId },
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    // Reset unread count
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    console.error('Error marking as read:', err);
    res.status(500).json({ message: "Failed to mark as read", error: err.message });
  }
});

// ARCHIVE CONVERSATION
router.patch('/conversation/:conversationId/archive', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.isParticipant(userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    conversation.status = 'archived';
    await conversation.save();

    res.status(200).json({ message: "Conversation archived" });
  } catch (err) {
    console.error('Error archiving conversation:', err);
    res.status(500).json({ message: "Failed to archive conversation", error: err.message });
  }
});

// DELETE MESSAGE (only sender can delete)
router.delete('/message/:messageId', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ message: "Failed to delete message", error: err.message });
  }
});

module.exports = router;
