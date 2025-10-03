const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true, // Must have a booking to leave a review
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  // Detailed ratings
  ratings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    accuracy: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    checkIn: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
  },
  comment: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 1000,
  },
  photos: [{
    type: String, // URLs to review photos
  }],
  // Host response
  hostResponse: {
    comment: String,
    respondedAt: Date,
  },
  // Review metrics
  helpful: {
    type: Number,
    default: 0,
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  // Moderation
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  reported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
}, {
  timestamps: true,
});

// Indexes for better performance
ReviewSchema.index({ listing: 1, createdAt: -1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ booking: 1 }, { unique: true }); // One review per booking
ReviewSchema.index({ status: 1 });

// Compound index for listing reviews with ratings
ReviewSchema.index({ listing: 1, rating: -1 });

const Review = mongoose.model("Review", ReviewSchema);
module.exports = Review;
