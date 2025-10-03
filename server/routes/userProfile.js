const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Middleware
const verifyToken = require('../middleware/auth');

// Configure multer for profile photo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + req.user.id + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// UPDATE USER PROFILE
router.patch('/:userId/update', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    const { firstName, lastName, phone, bio, address, dateOfBirth, language, currency } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (language) updateData.language = language;
    if (currency) updateData.currency = currency;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});

// UPLOAD PROFILE PHOTO
router.post('/:userId/upload-photo', verifyToken, upload.single('profileImage'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user is updating their own profile
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImagePath: req.file.path },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ message: "Failed to upload photo", error: err.message });
  }
});

// UPDATE NOTIFICATION PREFERENCES
router.patch('/:userId/notifications', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { email, sms, push } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        'notifications.email': email,
        'notifications.sms': sms,
        'notifications.push': push,
      },
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error('Error updating notifications:', err);
    res.status(500).json({ message: "Failed to update notifications", error: err.message });
  }
});

// CHANGE PASSWORD
router.patch('/:userId/change-password', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
});

// UPLOAD GOVERNMENT ID (for verification)
router.post('/:userId/upload-id', verifyToken, upload.single('governmentId'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        governmentId: req.file.path,
        idVerificationStatus: 'pending'
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: "ID uploaded successfully. Verification pending.",
      user: updatedUser
    });
  } catch (err) {
    console.error('Error uploading ID:', err);
    res.status(500).json({ message: "Failed to upload ID", error: err.message });
  }
});

// GET USER STATS
router.get('/:userId/stats', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const Listing = require('../models/Listing');
    const Booking = require('../models/Booking');
    const Review = require('../models/Review');

    const [totalListings, totalBookings, totalReviews, averageRating] = await Promise.all([
      Listing.countDocuments({ creator: userId }),
      Booking.countDocuments({ customerId: userId }),
      Review.countDocuments({ user: userId }),
      Review.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    res.status(200).json({
      totalListings,
      totalBookings,
      totalReviews,
      averageRating: averageRating[0]?.avgRating || 0
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

// DELETE ACCOUNT
router.delete('/:userId/delete', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password before deletion
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Delete user's data
    const Listing = require('../models/Listing');
    const Booking = require('../models/Booking');
    const Review = require('../models/Review');

    await Promise.all([
      User.findByIdAndDelete(userId),
      Listing.deleteMany({ creator: userId }),
      Review.deleteMany({ user: userId }),
      Booking.updateMany(
        { $or: [{ customerId: userId }, { hostId: userId }] },
        { $set: { status: 'cancelled' } }
      )
    ]);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ message: "Failed to delete account", error: err.message });
  }
});

module.exports = router;
