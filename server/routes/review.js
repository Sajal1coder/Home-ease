const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');

// Middleware to verify token (import from your auth middleware)
const verifyToken = require('../middleware/auth');

// CREATE REVIEW
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      listingId,
      bookingId,
      rating,
      ratings,
      comment,
      photos
    } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only review your own bookings" });
    }

    // Check if booking is completed
    if (new Date() < new Date(booking.endDate)) {
      return res.status(400).json({ message: "Cannot review before checkout date" });
    }

    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    // Create review
    const newReview = new Review({
      listing: listingId,
      user: req.user.id,
      booking: bookingId,
      rating,
      ratings,
      comment,
      photos: photos || [],
    });

    await newReview.save();

    // Update listing's average rating
    await updateListingRating(listingId);

    // Populate user details
    await newReview.populate('user', 'firstName lastName profileImagePath');

    res.status(201).json({
      message: "Review created successfully",
      review: newReview
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: "Failed to create review", error: err.message });
  }
});

// GET REVIEWS FOR A LISTING
router.get('/listing/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      listing: listingId,
      status: 'approved'
    })
      .populate('user', 'firstName lastName profileImagePath')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ 
      listing: listingId,
      status: 'approved'
    });

    // Get rating breakdown
    const ratingBreakdown = await Review.aggregate([
      { $match: { listing: new mongoose.Types.ObjectId(listingId), status: 'approved' } },
      { $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }},
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total,
      },
      ratingBreakdown
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
});

// GET USER'S REVIEWS
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ user: userId })
      .populate('listing', 'title city listingPhotoPaths')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ message: "Failed to fetch user reviews", error: err.message });
  }
});

// CHECK IF USER CAN REVIEW LISTING
router.get('/can-review/:listingId', verifyToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    // Find all completed bookings for this user and listing
    const completedBookings = await Booking.find({
      customerId: userId,
      listingId: listingId,
      endDate: { $lt: new Date() } // Booking has ended
    });

    if (completedBookings.length === 0) {
      return res.status(200).json({ 
        canReview: false, 
        message: "You need to complete a booking first to leave a review" 
      });
    }

    // Check which bookings have already been reviewed
    const reviewedBookingIds = await Review.find({
      user: userId,
      listing: listingId
    }).distinct('booking');

    // Find bookings that haven't been reviewed yet
    const eligibleBookings = completedBookings.filter(
      booking => !reviewedBookingIds.some(id => id.toString() === booking._id.toString())
    );

    if (eligibleBookings.length === 0) {
      return res.status(200).json({ 
        canReview: false, 
        message: "You have already reviewed all your stays at this property" 
      });
    }

    res.status(200).json({ 
      canReview: true, 
      bookings: eligibleBookings.map(b => ({
        _id: b._id,
        startDate: b.startDate,
        endDate: b.endDate
      }))
    });
  } catch (err) {
    console.error('Error checking review eligibility:', err);
    res.status(500).json({ message: "Failed to check review eligibility", error: err.message });
  }
});

// MARK REVIEW AS HELPFUL
router.post('/:reviewId/helpful', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpfulBy.includes(userId);

    if (alreadyMarked) {
      // Remove helpful
      review.helpfulBy = review.helpfulBy.filter(id => id.toString() !== userId);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add helpful
      review.helpfulBy.push(userId);
      review.helpful += 1;
    }

    await review.save();

    res.status(200).json({ 
      message: alreadyMarked ? "Removed helpful mark" : "Marked as helpful",
      helpful: review.helpful
    });
  } catch (err) {
    console.error('Error marking review as helpful:', err);
    res.status(500).json({ message: "Failed to update review", error: err.message });
  }
});

// HOST RESPONSE TO REVIEW
router.post('/:reviewId/response', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(reviewId).populate('listing', 'creator');
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the host
    if (review.listing.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only property host can respond" });
    }

    review.hostResponse = {
      comment,
      respondedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      message: "Response added successfully",
      review
    });
  } catch (err) {
    console.error('Error adding host response:', err);
    res.status(500).json({ message: "Failed to add response", error: err.message });
  }
});

// REPORT REVIEW
router.post('/:reviewId/report', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.reported = true;
    review.reportReason = reason;
    review.status = 'pending'; // Send for moderation

    await review.save();

    res.status(200).json({ message: "Review reported successfully" });
  } catch (err) {
    console.error('Error reporting review:', err);
    res.status(500).json({ message: "Failed to report review", error: err.message });
  }
});

// DELETE REVIEW (user can delete their own)
router.delete('/:reviewId', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Only review owner can delete
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update listing rating
    await updateListingRating(review.listing);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
});

// HELPER FUNCTION: Update listing's average rating
async function updateListingRating(listingId) {
  try {
    const result = await Review.aggregate([
      { 
        $match: { 
          listing: new mongoose.Types.ObjectId(listingId),
          status: 'approved'
        } 
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          averageCleanliness: { $avg: '$ratings.cleanliness' },
          averageAccuracy: { $avg: '$ratings.accuracy' },
          averageCommunication: { $avg: '$ratings.communication' },
          averageLocation: { $avg: '$ratings.location' },
          averageCheckIn: { $avg: '$ratings.checkIn' },
          averageValue: { $avg: '$ratings.value' },
        }
      }
    ]);

    if (result.length > 0) {
      await Listing.findByIdAndUpdate(listingId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews,
        detailedRatings: {
          cleanliness: Math.round(result[0].averageCleanliness * 10) / 10,
          accuracy: Math.round(result[0].averageAccuracy * 10) / 10,
          communication: Math.round(result[0].averageCommunication * 10) / 10,
          location: Math.round(result[0].averageLocation * 10) / 10,
          checkIn: Math.round(result[0].averageCheckIn * 10) / 10,
          value: Math.round(result[0].averageValue * 10) / 10,
        }
      });
    } else {
      // No reviews, reset ratings
      await Listing.findByIdAndUpdate(listingId, {
        averageRating: 0,
        totalReviews: 0,
        detailedRatings: {}
      });
    }
  } catch (err) {
    console.error('Error updating listing rating:', err);
  }
}

// REPORT REVIEW
router.post('/:reviewId/report', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    console.log(`User ${userId} reporting review ${reviewId} for reason: ${reason}`);

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user has already reported this review
    const existingReport = review.reportedBy.find(
      report => report.user.toString() === userId
    );

    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this review" });
    }

    // Add the report
    review.reportedBy.push({
      user: userId,
      reason: reason || 'Inappropriate content',
      reportedAt: new Date()
    });

    review.reportCount = review.reportedBy.length;
    review.reported = true;

    await review.save();

    console.log(`Review ${reviewId} reported successfully. Total reports: ${review.reportCount}`);

    res.status(200).json({
      message: "Review reported successfully",
      reportCount: review.reportCount
    });
  } catch (err) {
    console.error('Error reporting review:', err);
    res.status(500).json({ message: "Failed to report review", error: err.message });
  }
});

module.exports = router;
