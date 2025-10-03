const express = require('express');
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

    const user = await User.findByIdAndUpdate(
      userId,
      { verified },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    const user = await User.findByIdAndUpdate(
      userId,
      { blocked },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user
    });
  } catch (err) {
    console.error('Error blocking user:', err);
    res.status(500).json({ message: "Failed to block user", error: err.message });
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
    const { verified } = req.body;

    const property = await Listing.findByIdAndUpdate(
      propertyId,
      { 
        verified,
        verifiedAt: verified ? new Date() : null
      },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

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

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { 
        status: 'approved',
        reported: false,
        reportReason: null
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

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

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: 'rejected' },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

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

module.exports = router;
