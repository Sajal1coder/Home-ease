// USER MODEL UPDATES
// Add these fields to your existing User.js model

/*
const UserSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // NEW FIELDS TO ADD:
  
  // Verification fields
  verified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  
  // Admin fields
  isAdmin: {
    type: Boolean,
    default: false
  },
  blocked: {
    type: Boolean,
    default: false
  },
  
  // Profile fields
  phone: String,
  bio: {
    type: String,
    maxlength: 500
  },
  dateOfBirth: Date,
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Document verification
  governmentId: {
    type: String, // Path to ID document
  },
  idVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Preferences
  language: {
    type: String,
    default: 'en'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  
  // Notifications
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  
  // Social links (optional)
  socialLinks: {
    facebook: String,
    instagram: String,
    linkedin: String
  },
  
  // Stats
  totalBookings: {
    type: Number,
    default: 0
  },
  totalListings: {
    type: Number,
    default: 0
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  
  // Account status
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

}, {
  timestamps: true
});

// Add indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ verified: 1 });
UserSchema.index({ isAdmin: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", UserSchema);
*/

// LISTING MODEL UPDATES
// Add these fields to your existing Listing.js model

/*
const ListingSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // NEW FIELDS TO ADD:
  
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  
  // Reviews and ratings
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  detailedRatings: {
    cleanliness: Number,
    accuracy: Number,
    communication: Number,
    location: Number,
    checkIn: Number,
    value: Number
  },
  
  // Additional info
  rules: [String],
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  instantBooking: {
    type: Boolean,
    default: false
  },
  minStay: {
    type: Number,
    default: 1
  },
  maxStay: {
    type: Number,
    default: 365
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'pending'
  },
  
  // Stats
  views: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },

}, {
  timestamps: true
});

// Add text index for search
ListingSchema.index({ 
  title: 'text', 
  description: 'text',
  city: 'text',
  province: 'text',
  country: 'text'
});

module.exports = mongoose.model("Listing", ListingSchema);
*/

// BOOKING MODEL UPDATES
/*
const BookingSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // NEW FIELDS TO ADD:
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  refundAmount: Number,
  refundStatus: {
    type: String,
    enum: ['pending', 'processed', 'rejected']
  },
  
  // Guest info
  guestCount: Number,
  specialRequests: String,
  
  // Check-in/out
  checkInTime: String,
  checkOutTime: String,
  actualCheckIn: Date,
  actualCheckOut: Date,

}, {
  timestamps: true
});

BookingSchema.index({ customerId: 1 });
BookingSchema.index({ hostId: 1 });
BookingSchema.index({ listingId: 1 });
BookingSchema.index({ startDate: 1, endDate: 1 });
BookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", BookingSchema);
*/
