const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Listing = require("../models/Listing");

// Helper function to check if dates overlap
const checkDateOverlap = (start1, end1, start2, end2) => {
  return (start1 < end2 && end1 > start2);
};

// CHECK AVAILABILITY FOR A LISTING
router.post("/check-availability", async (req, res) => {
  try {
    const { listingId, startDate, endDate } = req.body;

    if (!listingId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start >= end) {
      return res.status(400).json({ 
        available: false, 
        message: "End date must be after start date" 
      });
    }

    if (start < new Date()) {
      return res.status(400).json({ 
        available: false, 
        message: "Cannot book dates in the past" 
      });
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      listingId: listingId,
      $or: [
        {
          // New booking starts during existing booking
          startDate: { $lte: start },
          endDate: { $gt: start }
        },
        {
          // New booking ends during existing booking
          startDate: { $lt: end },
          endDate: { $gte: end }
        },
        {
          // New booking completely contains existing booking
          startDate: { $gte: start },
          endDate: { $lte: end }
        }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(200).json({ 
        available: false, 
        message: "These dates are not available",
        conflicts: overlappingBookings.map(b => ({
          startDate: b.startDate,
          endDate: b.endDate
        }))
      });
    }

    res.status(200).json({ 
      available: true, 
      message: "Dates are available" 
    });
  } catch (err) {
    console.error("Error checking availability:", err);
    res.status(500).json({ message: "Error checking availability", error: err.message });
  }
});

// GET BLOCKED DATES FOR A LISTING
router.get("/blocked-dates/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    // Get all future bookings for this listing
    const bookings = await Booking.find({
      listingId: listingId,
      endDate: { $gte: new Date() }
    }).select('startDate endDate');

    res.status(200).json({ blockedDates: bookings });
  } catch (err) {
    console.error("Error fetching blocked dates:", err);
    res.status(500).json({ message: "Error fetching blocked dates", error: err.message });
  }
});

// CREATE BOOKING WITH OVERLAP PREVENTION
router.post("/create", async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice, token } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start >= end) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: "Cannot book dates in the past" });
    }

    // Check for overlapping bookings BEFORE processing payment
    const overlappingBookings = await Booking.find({
      listingId: listingId,
      $or: [
        {
          startDate: { $lte: start },
          endDate: { $gt: start }
        },
        {
          startDate: { $lt: end },
          endDate: { $gte: end }
        },
        {
          startDate: { $gte: start },
          endDate: { $lte: end }
        }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ 
        message: "These dates are no longer available. Please select different dates."
      });
    }

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100, // Amount in cents
      currency: "usd",
      payment_method_data: {
        type: "card",
        card: { token: token.id }, // Pass Stripe token here
      },
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never", // Prevent redirect-based payment methods
      },
      description: `Booking for listing ${listingId}`,
    });
    
    // If payment is successful, create the booking
    if (paymentIntent.status === "succeeded") {
      const newBooking = new Booking({
        customerId,
        hostId,
        listingId,
        startDate: start,
        endDate: end,
        totalPrice,
      });

      await newBooking.save();
      
      // Populate the booking with listing and user details
      await newBooking.populate([
        { path: 'customerId', select: 'firstName lastName profileImagePath email' },
        { path: 'hostId', select: 'firstName lastName profileImagePath email' },
        { path: 'listingId', select: 'title city country listingPhotoPaths' }
      ]);

      res.status(200).json({ 
        message: "Booking created successfully!", 
        booking: newBooking 
      });
    } else {
      res.status(400).json({ message: "Payment failed", error: paymentIntent });
    }
  } catch (err) {
    console.log("Error creating booking:", err.message);
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
});

module.exports = router
