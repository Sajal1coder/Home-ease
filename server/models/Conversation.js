const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }],
  // Property the conversation is about
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
  },
  // Related booking (if exists)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  // Last message info for quick display
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: Date,
  },
  // Unread count per participant
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
  // Conversation status
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ listing: 1 });
ConversationSchema.index({ updatedAt: -1 });

// Compound index for finding conversations between two users
ConversationSchema.index({ participants: 1, listing: 1 });

// Method to check if user is participant
ConversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;
