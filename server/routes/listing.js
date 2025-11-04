const router = require("express").Router();
const multer = require("multer");
const Listing = require("../models/Listing");
const User = require("../models/User");
const Review = require("../models/Review");
const verifyToken = require("../middleware/auth");

/* Configure Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* Helper function to add review statistics to listings */
const addReviewStats = async (listings) => {
  const listingsWithStats = await Promise.all(
    listings.map(async (listing) => {
      const listingObj = listing.toObject();
      
      // Get approved reviews for this listing
      const reviews = await Review.find({ 
        listing: listing._id, 
        status: 'approved' 
      });
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        listingObj.averageRating = totalRating / reviews.length;
        listingObj.reviewCount = reviews.length;
      } else {
        listingObj.averageRating = 0;
        listingObj.reviewCount = 0;
      }
      
      return listingObj;
    })
  );
  return listingsWithStats;
};

/* CREATE LISTING */
router.post("/create", upload.fields([{ name: 'listingPhotos', maxCount: 5 }, { name: 'govtID', maxCount: 3 }]), async (req, res) => {
  try {
    /* Take the information from the form */
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    const listingPhotos = req.files.listingPhotos;
    const govtID = req.files.govtID;

    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).send("No images uploaded.");
    }

    if (!govtID || govtID.length === 0) {
      return res.status(400).send("Government ID is required.");
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path);
    const govtIdPath = govtID.map((file) => file.path);

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      govtIdPath,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    });

    await newListing.save();

    res.status(201).json(newListing);
  } catch (err) {
    res.status(409).json({ message: "Failed to create Listing", error: err.message });
    console.log(err);
  }
});


/* GET LISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category;

  try {
    let listings;
    
    if (qCategory) {
      // Filter by category if specified
      listings = await Listing.find({
        category: qCategory,
        active: true,
        status: 'active'
      }).populate("creator");
    } else {
      // Get all active listings
      listings = await Listing.find({
        active: true,
        status: 'active'
      }).populate("creator");
    }

    // Add review statistics to each listing
    const listingsWithStats = await addReviewStats(listings);

    res.status(200).json(listingsWithStats);
  } catch (err) {
    res.status(404).json({ message: "Failed to fetch listings", error: err.message });
    console.log(err);
  }
});

/* TEMPORARY - Get ALL listings without filtering */
router.get("/all", async (req, res) => {
  try {
    const allListings = await Listing.find({}).populate("creator").limit(10);
    
    const debugInfo = {
      total: await Listing.countDocuments(),
      listings: allListings.map(listing => ({
        id: listing._id,
        title: listing.title,
        active: listing.active,
        status: listing.status,
        category: listing.category,
        price: listing.price,
        creator: listing.creator?.firstName || 'Unknown'
      }))
    };
    
    res.status(200).json(debugInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* DEBUG ENDPOINT - Get database statistics */
router.get("/debug", async (req, res) => {
  try {
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ active: true });
    const statusActiveListings = await Listing.countDocuments({ status: 'active' });
    const bothActiveListings = await Listing.countDocuments({ active: true, status: 'active' });
    
    // Get all possible status and active values
    const statusValues = await Listing.distinct('status');
    const activeValues = await Listing.distinct('active');
    
    // Get a sample of listings to see their structure
    const sampleListings = await Listing.find({}).limit(3).select('title active status category createdAt');
    
    const debugInfo = {
      counts: {
        total: totalListings,
        active: activeListings,
        statusActive: statusActiveListings,
        bothActive: bothActiveListings
      },
      distinctValues: {
        statusValues: statusValues,
        activeValues: activeValues
      },
      sampleListings: sampleListings
    };
    
    res.status(200).json(debugInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;

  try {
    // Use MongoDB text search with relevance scoring for better performance
    // This is much more efficient than regex and provides better results
    let listings = await Listing.find(
      {
        $text: { $search: search },
        active: true,
        status: 'active'
      },
      {
        score: { $meta: "textScore" }
      }
    )
    .sort({ score: { $meta: "textScore" } }) // Sort by relevance
    .populate("creator");

    // Fallback: If no results with text search, try regex (for partial matches)
    if (listings.length === 0) {
      listings = await Listing.find({
        $or: [
          { category: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
          { country: { $regex: search, $options: "i" } },
          { type: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ],
        active: true,
        status: 'active'
      }).populate("creator");
    }

    // Add review statistics to each listing
    const listingsWithStats = await addReviewStats(listings);

    res.status(200).json(listingsWithStats);
  } catch (err) {
    res.status(404).json({ message: "Failed to fetch listings", error: err.message });
    console.log(err);
  }
});

/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("creator");
    
    if (!listing) {
      return res.status(404).json({ message: "Listing not found!" });
    }

    // Add review statistics to the listing
    const [listingWithStats] = await addReviewStats([listing]);
    
    res.status(200).json(listingWithStats);
  } catch (err) {
    res.status(404).json({ message: "Listing not found!", error: err.message });
  }
});

/* GET PROPERTY FOR EDITING (Owner Only) */
router.get("/:listingId/edit", verifyToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    console.log(`User ${userId} requesting property ${listingId} for editing`);

    const listing = await Listing.findById(listingId).populate("creator");
    
    if (!listing) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user owns this property
    if (listing.creator._id.toString() !== userId) {
      return res.status(403).json({ message: "You can only edit your own properties" });
    }

    res.status(200).json(listing);
  } catch (err) {
    console.error('Error fetching property for edit:', err);
    res.status(500).json({ message: "Failed to fetch property", error: err.message });
  }
});

/* UPDATE USER'S OWN PROPERTY */
router.put("/:listingId", verifyToken, upload.fields([
  { name: "listingPhotos", maxCount: 10 },
  { name: "govtIdPhotos", maxCount: 5 }
]), async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    console.log(`User ${userId} attempting to update property ${listingId}`);

    // Find the listing and verify ownership
    const existingListing = await Listing.findById(listingId);
    if (!existingListing) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user owns this property
    if (existingListing.creator.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your own properties" });
    }

    // Parse the request body
    const {
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price
    } = req.body;

    // Handle file uploads
    let listingPhotoPaths = existingListing.listingPhotoPaths || [];
    let govtIdPath = existingListing.govtIdPath || [];

    // Update listing photos if new ones are uploaded
    if (req.files && req.files.listingPhotos && req.files.listingPhotos.length > 0) {
      listingPhotoPaths = req.files.listingPhotos.map((file) => file.path);
    }

    // Update government ID photos if new ones are uploaded
    if (req.files && req.files.govtIdPhotos && req.files.govtIdPhotos.length > 0) {
      govtIdPath = req.files.govtIdPhotos.map((file) => file.path);
    }

    // Prepare update data
    const updateData = {
      category: category || existingListing.category,
      type: type || existingListing.type,
      streetAddress: streetAddress || existingListing.streetAddress,
      aptSuite: aptSuite || existingListing.aptSuite,
      city: city || existingListing.city,
      province: province || existingListing.province,
      country: country || existingListing.country,
      guestCount: guestCount || existingListing.guestCount,
      bedroomCount: bedroomCount || existingListing.bedroomCount,
      bedCount: bedCount || existingListing.bedCount,
      bathroomCount: bathroomCount || existingListing.bathroomCount,
      amenities: amenities ? JSON.parse(amenities) : existingListing.amenities,
      listingPhotoPaths,
      title: title || existingListing.title,
      govtIdPath,
      description: description || existingListing.description,
      highlight: highlight || existingListing.highlight,
      highlightDesc: highlightDesc || existingListing.highlightDesc,
      price: price || existingListing.price,
      // Reset verification status when property is updated
      verified: false,
      verifiedAt: null,
      status: 'pending',
      adminNotes: 'Property updated - pending re-verification'
    };

    // Update the listing
    const updatedListing = await Listing.findByIdAndUpdate(
      listingId,
      updateData,
      { new: true }
    ).populate("creator");

    console.log(`Property ${listingId} updated successfully by user ${userId}`);

    res.status(200).json({
      message: "Property updated successfully. It will be reviewed by admin before going live.",
      listing: updatedListing
    });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ message: "Failed to update property", error: err.message });
  }
});

/* DELETE USER'S OWN PROPERTY */
router.delete("/:listingId", verifyToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    console.log(`User ${userId} attempting to delete property ${listingId}`);

    // Find the listing and verify ownership
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user owns this property
    if (listing.creator.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own properties" });
    }

    // Soft delete: mark as deleted instead of removing from database
    await Listing.findByIdAndUpdate(listingId, {
      active: false,
      status: 'deleted',
      deletedAt: new Date()
    });

    console.log(`Property ${listingId} deleted successfully by user ${userId}`);

    res.status(200).json({
      message: "Property deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ message: "Failed to delete property", error: err.message });
  }
});

module.exports = router;
