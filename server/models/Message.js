const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'booking', 'system'],
    default: 'text',
  },
  // For image messages
  imageUrl: String,
  
  // For booking-related messages
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  
  // Read receipts
  read: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  
  // System messages
  isSystemMessage: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
MessageSchema.index({ conversation: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ read: 1 });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
