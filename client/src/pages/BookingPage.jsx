import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DateRange } from "react-date-range";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { 
  ArrowBack, 
  CalendarToday, 
  People, 
  Star, 
  Verified,
  LocationOn,
  CheckCircle
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { toast } from 'react-toastify';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EnhancedCheckoutForm from "../components/EnhancedCheckoutForm";
import PaymentSuccessModal from "../components/PaymentSuccessModal";
import PaymentFailureModal from "../components/PaymentFailureModal";
import Loader from "../components/Loader";
import LazyImage from "../components/LazyImage";
import API_BASE_URL from '../config';
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../styles/BookingPage.scss";

const stripeKey = process.env.REACT_APP_STRIPE_ID;
const stripePromise = loadStripe(stripeKey);

const BookingPage = () => {
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      key: "selection",
    },
  ]);

  const { listingId } = useParams();
  const navigate = useNavigate();
  const customerId = useSelector((state) => state?.user?._id);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      toast.info('Please login to book a property');
      navigate('/login');
      return;
    }
    getListingDetails();
  }, [listingId, user]);

  const getListingDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${listingId}`);
      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Listing Details Failed", err.message);
      toast.error('Failed to load property details');
      setLoading(false);
    }
  };

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  // Calculate months
  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const monthCount = end.getMonth() - start.getMonth() + (12 * (end.getFullYear() - start.getFullYear()));
  const remainingDays = (end.getTime() - start.getTime()) % (30 * 24 * 60 * 60 * 1000);
  const remainingDaysInMonths = Math.ceil(remainingDays / (30 * 24 * 60 * 60 * 1000));
  const updatedMonthCount = monthCount + remainingDaysInMonths;

  useEffect(() => {
    if (updatedMonthCount < 1) {
      setError("Bookings must be at least 1 month long.");
    } else {
      setError("");
    }
  }, [dateRange, updatedMonthCount]);

  const handleSubmit = async (token) => {
    if (updatedMonthCount < 1) {
      setPaymentError("Bookings must be at least 1 month long");
      setShowFailureModal(true);
      return;
    }

    setProcessing(true);

    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * updatedMonthCount,
        token,
      };

      const response = await fetch(`${API_BASE_URL}/bookings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });

      const data = await response.json();

      if (response.ok) {
        // Prepare booking details for success modal
        setBookingDetails({
          propertyTitle: listing.title,
          startDate: dateRange[0].startDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          endDate: dateRange[0].endDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          totalPrice: listing.price * updatedMonthCount,
          monthCount: updatedMonthCount
        });

        setProcessing(false);
        setShowSuccessModal(true);
      } else {
        setProcessing(false);
        setPaymentError(data.message || 'Booking failed. Please try again.');
        setShowFailureModal(true);
      }
    } catch (err) {
      console.error("Submit Booking Failed.", err);
      setProcessing(false);
      setPaymentError(err.message || 'An error occurred while processing your payment. Please try again.');
      setShowFailureModal(true);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };

  const handleFailureModalClose = () => {
    setShowFailureModal(false);
    setPaymentError("");
  };

  const handleRetryPayment = () => {
    setShowFailureModal(false);
    setPaymentError("");
    // Scroll to payment form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <div className="booking-page">
        {/* Header */}
        <div className="booking-header">
          <button className="back-btn" onClick={() => navigate(`/properties/${listingId}`)}>
            <ArrowBack /> Back to property
          </button>
          <h1>Confirm and pay</h1>
        </div>

        <div className="booking-container">
          {/* Left Side - Booking Form */}
          <div className="booking-main">
            {/* Property Summary Card */}
            <div className="property-summary-card">
              <div className="property-image">
                <LazyImage
                  src={`${API_BASE_URL}/${listing.listingPhotoPaths[0]?.replace("public", "")}`}
                  alt={listing.title}
                />
              </div>
              <div className="property-info">
                <div className="property-title-section">
                  <h3>{listing.title}</h3>
                  {listing.verified && (
                    <div className="verified-badge-small">
                      <Verified /> Verified
                    </div>
                  )}
                </div>
                <div className="property-location-small">
                  <LocationOn />
                  <span>{listing.city}, {listing.province}</span>
                </div>
                <div className="property-rating-small">
                  <Star />
                  <span>{listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}</span>
                  {listing.reviewCount > 0 && (
                    <span className="reviews">({listing.reviewCount} reviews)</span>
                  )}
                </div>
                <div className="property-specs">
                  <span><People /> {listing.guestCount} guests</span>
                  <span>• {listing.bedroomCount} bedrooms</span>
                  <span>• {listing.bathroomCount} bathrooms</span>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="booking-section">
              <h2><CalendarToday /> Your trip dates</h2>
              <div className="date-selection">
                <DateRange 
                  ranges={dateRange} 
                  onChange={handleSelect}
                  minDate={new Date()}
                  rangeColors={['#F8395A']}
                />
                <div className="selected-dates">
                  <div className="date-info">
                    <span className="label">Check-in</span>
                    <span className="date">{dateRange[0].startDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="date-divider">→</div>
                  <div className="date-info">
                    <span className="label">Check-out</span>
                    <span className="date">{dateRange[0].endDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>
                {error && <p className="error-message">{error}</p>}
              </div>
            </div>

            {/* Payment Section */}
            <div className="booking-section payment-section">
              <h2>Payment details</h2>
              <div className="payment-features">
                <div className="feature">
                  <CheckCircle />
                  <div>
                    <h4>Secure payment</h4>
                    <p>Your payment information is encrypted and secure</p>
                  </div>
                </div>
                <div className="feature">
                  <CheckCircle />
                  <div>
                    <h4>Free cancellation</h4>
                    <p>Cancel up to 48 hours before check-in</p>
                  </div>
                </div>
              </div>
              <Elements stripe={stripePromise}>
                <EnhancedCheckoutForm 
                  handleBooking={handleSubmit} 
                  monthCount={updatedMonthCount}
                  totalPrice={listing.price * updatedMonthCount}
                  termsAgreed={termsAgreed}
                />
              </Elements>
            </div>
          </div>

          {/* Right Side - Price Summary */}
          <div className="booking-sidebar">
            <div className="price-summary-card">
              <h3>Price summary</h3>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>₹{listing.price} x {updatedMonthCount} {updatedMonthCount > 1 ? 'months' : 'month'}</span>
                  <span>₹{listing.price * updatedMonthCount}</span>
                </div>
                <div className="price-row">
                  <span>Service fee</span>
                  <span>₹0</span>
                </div>
                <div className="price-row subtotal">
                  <span>Subtotal</span>
                  <span>₹{listing.price * updatedMonthCount}</span>
                </div>
              </div>

              <div className="price-total">
                <span>Total (INR)</span>
                <span className="total-amount">₹{listing.price * updatedMonthCount}</span>
              </div>

              <div className="booking-terms">
                <label className="terms-checkbox">
                  <input 
                    type="checkbox" 
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    required
                  />
                  <span>I agree to the Host's House Rules, Ground rules for guests, Homease's Refund Policy, and that Homease can charge my payment method if I'm responsible for damage.</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        bookingDetails={bookingDetails}
        redirectCountdown={5}
      />

      {/* Failure Modal */}
      <PaymentFailureModal
        isOpen={showFailureModal}
        onClose={handleFailureModalClose}
        onRetry={handleRetryPayment}
        error={paymentError}
      />

      {/* Processing Overlay */}
      {processing && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h3>Processing your payment...</h3>
            <p>Please don't close this window</p>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default BookingPage;
