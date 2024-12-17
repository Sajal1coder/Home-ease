const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");

router.post("/create", async (req, res) => {
  try {
    const { customerId, hostId, listingId, startDate, endDate, totalPrice, token } = req.body;

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
        startDate,
        endDate,
        totalPrice,
      });

      await newBooking.save();
      res.status(200).json({ message: "Booking created successfully!", booking: newBooking });
    } else {
      res.status(400).json({ message: "Payment failed", error: paymentIntent });
    }
  } catch (err) {
    console.log("Error creating booking:", err.message);
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
});

module.exports = router
