const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// Middleware
const verifyToken = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET DASHBOARD STATS
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    const totalProperties = await Listing.countDocuments();
    const verifiedProperties = await Listing.countDocuments({ verified: true });
    const pendingVerifications = await User.countDocuments({ verified: false }) + 
                                  await Listing.countDocuments({ verified: false });
    const totalBookings = await Booking.countDocuments();
    const totalReviews = await Review.countDocuments();

    res.status(200).json({
      totalUsers,
      verifiedUsers,
      totalProperties,
      verifiedProperties,
      pendingVerifications,
      totalBookings,
      totalReviews,
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

// GET ALL USERS
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// VERIFY/UNVERIFY USER
router.patch('/users/:userId/verify', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;

    console.log(`Admin ${req.user.id} attempting to ${verified ? 'verify' : 'unverify'} user ${userId}`);

    const updateData = { 
      verified,
      verifiedAt: verified ? new Date() : null
    };

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`User ${userId} ${verified ? 'verified' : 'unverified'} successfully`);

    res.status(200).json({
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
});

// BLOCK/UNBLOCK USER
router.patch('/users/:userId/block', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { blocked } = req.body;

    console.log(`Admin ${req.user.id} attempting to ${blocked ? 'block' : 'unblock'} user ${userId}`);

    // Don't allow blocking admin users
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.isAdmin && blocked) {
      return res.status(400).json({ message: "Cannot block admin users" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { blocked },
      { new: true }
    ).select('-password');

    console.log(`User ${userId} ${blocked ? 'blocked' : 'unblocked'} successfully`);

    res.status(200).json({
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (err) {
    console.error('Error blocking user:', err);
    res.status(500).json({ message: "Failed to block user", error: err.message });
  }
});

// DELETE USER
router.delete('/users/:userId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`Admin ${req.user.id} attempting to delete user ${userId}`);

    // Don't allow deleting admin users
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.isAdmin) {
      return res.status(400).json({ message: "Cannot delete admin users" });
    }

    // Delete user and related data
    await User.findByIdAndDelete(userId);
    await Listing.deleteMany({ creator: userId });
    await Review.deleteMany({ user: userId });
    await Booking.deleteMany({ $or: [{ customerId: userId }, { hostId: userId }] });

    console.log(`User ${userId} deleted successfully`);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
});

// GET ALL PROPERTIES
router.get('/properties', verifyToken, isAdmin, async (req, res) => {
  try {
    const properties = await Listing.find()
      .populate('creator', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json(properties);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ message: "Failed to fetch properties", error: err.message });
  }
});

// VERIFY/REJECT PROPERTY
router.patch('/properties/:propertyId/verify', verifyToken, isAdmin, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { verified, adminNotes } = req.body;

    console.log(`Admin ${req.user.id} attempting to ${verified ? 'verify' : 'reject'} property ${propertyId}`);

    const updateData = { 
      verified,
      verifiedAt: verified ? new Date() : null,
      rejectedAt: !verified ? new Date() : null,
      adminNotes: adminNotes || "",
      // Remove rejected properties from public view
      active: verified ? true : false,
      status: verified ? 'active' : 'rejected'
    };

    const property = await Listing.findByIdAndUpdate(
      propertyId,
      updateData,
      { new: true }
    ).populate('creator', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    console.log(`Property ${propertyId} ${verified ? 'verified' : 'rejected'} successfully`);

    res.status(200).json({
      message: `Property ${verified ? 'verified' : 'rejected'} successfully`,
      property
    });
  } catch (err) {
    console.error('Error verifying property:', err);
    res.status(500).json({ message: "Failed to verify property", error: err.message });
  }
});

// DELETE PROPERTY
router.delete('/properties/:propertyId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Listing.findByIdAndDelete(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Also delete related reviews and bookings
    await Review.deleteMany({ listing: propertyId });
    await Booking.deleteMany({ listingId: propertyId });

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ message: "Failed to delete property", error: err.message });
  }
});

// GET PENDING REVIEWS
router.get('/reviews/pending', verifyToken, isAdmin, async (req, res) => {
  try {
    const reviews = await Review.find({ 
      $or: [
        { status: 'pending' },
        { reported: true }
      ]
    })
      .populate('user', 'firstName lastName email')
      .populate('listing', 'title city')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
});

// APPROVE REVIEW
router.patch('/reviews/:reviewId/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;

    console.log(`Admin ${req.user.id} approving review ${reviewId}`);

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { 
        status: 'approved',
        reported: false,
        reportReason: null
      },
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('listing', 'title city');

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    console.log(`Review ${reviewId} approved successfully`);

    res.status(200).json({
      message: "Review approved successfully",
      review
    });
  } catch (err) {
    console.error('Error approving review:', err);
    res.status(500).json({ message: "Failed to approve review", error: err.message });
  }
});

// REJECT REVIEW
router.patch('/reviews/:reviewId/reject', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;

    console.log(`Admin ${req.user.id} rejecting review ${reviewId}`);

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: 'rejected' },
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('listing', 'title city');

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    console.log(`Review ${reviewId} rejected successfully`);

    res.status(200).json({
      message: "Review rejected successfully",
      review
    });
  } catch (err) {
    console.error('Error rejecting review:', err);
    res.status(500).json({ message: "Failed to reject review", error: err.message });
  }
});

// DELETE REVIEW
router.delete('/reviews/:reviewId', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
});

// GET ALL BOOKINGS
router.get('/bookings', verifyToken, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'firstName lastName email')
      .populate('hostId', 'firstName lastName email')
      .populate('listingId', 'title city')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ message: "Failed to fetch bookings", error: err.message });
  }
});

// GET ANALYTICS DATA
router.get('/analytics', verifyToken, isAdmin, async (req, res) => {
  try {
    // Revenue over time
    const revenueByMonth = await Booking.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$totalPrice" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    // Top performing properties
    const topProperties = await Booking.aggregate([
      {
        $group: {
          _id: "$listingId",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "listings",
          localField: "_id",
          foreignField: "_id",
          as: "listing"
        }
      }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      revenueByMonth,
      topProperties,
      userGrowth
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
});

// CREATE ANONYMOUS REVIEW (Admin Only)
router.post('/reviews/create-anonymous', verifyToken, isAdmin, async (req, res) => {
  try {
    const { listingId, rating, comment, ratings, anonymousName } = req.body;

    console.log(`Admin ${req.user.id} creating anonymous review for listing ${listingId}`);

    // Validate required fields
    if (!listingId || !rating || !comment) {
      return res.status(400).json({ message: "Listing ID, rating, and comment are required" });
    }

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Create anonymous user object (not saved to database)
    const anonymousUser = {
      _id: new mongoose.Types.ObjectId(),
      firstName: anonymousName || 'Anonymous',
      lastName: 'User',
      profileImagePath: 'public/default-avatar.png'
    };

    // Create review with anonymous user
    const newReview = new Review({
      user: anonymousUser._id,
      listing: listingId,
      rating: Math.max(1, Math.min(5, rating)), // Ensure rating is between 1-5
      comment,
      ratings: ratings || {
        cleanliness: rating,
        accuracy: rating,
        communication: rating,
        location: rating,
        checkIn: rating,
        value: rating
      },
      status: 'approved', // Auto-approve admin-created reviews
      isAnonymous: true,
      anonymousUserData: anonymousUser,
      createdAt: new Date()
    });

    await newReview.save();

    // Populate the review for response
    const populatedReview = await Review.findById(newReview._id)
      .populate('listing', 'title city country');

    console.log(`Anonymous review created successfully for listing ${listingId}`);

    res.status(201).json({
      message: "Anonymous review created successfully",
      review: {
        ...populatedReview.toObject(),
        user: anonymousUser // Override with anonymous user data
      }
    });
  } catch (err) {
    console.error('Error creating anonymous review:', err);
    res.status(500).json({ message: "Failed to create anonymous review", error: err.message });
  }
});

// GET REPORTED REVIEWS (Admin Only)
router.get('/reviews/reported', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log(`Admin ${req.user.id} fetching reported reviews`);

    const reportedReviews = await Review.find({ 
      reported: true,
      reportCount: { $gt: 0 }
    })
    .populate('user', 'firstName lastName email profileImagePath')
    .populate('listing', 'title city country')
    .populate('reportedBy.user', 'firstName lastName email')
    .sort({ reportCount: -1, updatedAt: -1 });

    console.log(`Found ${reportedReviews.length} reported reviews`);

    res.status(200).json(reportedReviews);
  } catch (err) {
    console.error('Error fetching reported reviews:', err);
    res.status(500).json({ message: "Failed to fetch reported reviews", error: err.message });
  }
});

// MODERATE REPORTED REVIEW (Admin Only)
router.patch('/reviews/:reviewId/moderate', verifyToken, isAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, adminNotes } = req.body; // action: 'approve', 'reject', 'dismiss'

    console.log(`Admin ${req.user.id} moderating review ${reviewId} with action: ${action}`);

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    let updateData = {
      adminNotes: adminNotes || ""
    };

    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        updateData.reported = false;
        updateData.reportCount = 0;
        updateData.reportedBy = [];
        break;
      case 'reject':
        updateData.status = 'rejected';
        break;
      case 'dismiss':
        updateData.reported = false;
        updateData.reportCount = 0;
        updateData.reportedBy = [];
        break;
      default:
        return res.status(400).json({ message: "Invalid action. Use 'approve', 'reject', or 'dismiss'" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate('user', 'firstName lastName email')
     .populate('listing', 'title city country');

    console.log(`Review ${reviewId} moderated successfully with action: ${action}`);

    res.status(200).json({
      message: `Review ${action}ed successfully`,
      review: updatedReview
    });
  } catch (err) {
    console.error('Error moderating review:', err);
    res.status(500).json({ message: "Failed to moderate review", error: err.message });
  }
});

module.exports = router;
