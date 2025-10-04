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

const Listing = mongoose.model("Listing", ListingSchema )
module.exports = Listing