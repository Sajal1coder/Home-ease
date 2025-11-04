const mongoose = require("mongoose")

const ListingSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
    aptSuite: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    guestCount: {
      type: Number,
      required: true,
    },
    bedroomCount: {
      type: Number,
      required: true,
    },
    bedCount: {
      type: Number,
      required: true,
    },
    bathroomCount: {
      type: Number,
      required: true,
    },
    amenities: {
      type: Array,
      default:[]
    },
    listingPhotoPaths: [{ type: String }], // Store photo URLs
    title: {
      type: String,
      required: true
    },
    govtIdPath: [{ type: String }], // Store file URLs
    description: {
      type: String,
      required: true
    },
    highlight: {
      type: String,
      required: true
    },
    highlightDesc: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'deleted'],
      default: 'pending',
    },
    deletedAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true}
)

// Create text indexes for efficient search
// This enables MongoDB's text search capabilities
ListingSchema.index({ 
  title: 'text', 
  description: 'text',
  city: 'text',
  country: 'text',
  province: 'text',
  category: 'text',
  type: 'text',
  highlight: 'text'
}, {
  weights: {
    title: 10,
    city: 8,
    category: 5,
    type: 5,
    description: 3,
    highlight: 2,
    country: 2,
    province: 2
  },
  name: 'listing_text_search'
});

// Additional indexes for filtering and sorting
ListingSchema.index({ price: 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ verified: 1, status: 1 });
ListingSchema.index({ city: 1, status: 1 });
ListingSchema.index({ category: 1, status: 1 });

const Listing = mongoose.model("Listing", ListingSchema )
module.exports = Listing