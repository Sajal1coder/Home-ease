import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import { Close, ChevronLeft, ChevronRight, Share } from "@mui/icons-material";
import ReviewSection from '../components/ReviewSection';
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import API_BASE_URL from '../config';
import CheckoutForm from "../components/CheckoutForm";
import LazyImage from "../components/LazyImage";
import { toast } from 'react-toastify';

const stripeKey = process.env.REACT_APP_STRIPE_ID ;
const stripePromise = loadStripe(stripeKey);

// Share Modal Component
const ShareModal = ({ isOpen, onClose, shareProperty }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="share-modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999
      }}
      onClick={() => {
        console.log('Modal overlay clicked');
        onClose();
      }}
    >
      <div 
        className="share-modal" 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          minWidth: '300px',
          maxWidth: '400px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'modalSlideIn 0.3s ease',
          position: 'relative',
          zIndex: 1000000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px', fontWeight: '700' }}>Share this property</h4>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {navigator.share && (
            <button 
              onClick={() => shareProperty('native')} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              <Share style={{ color: '#F8395A' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Share</span>
            </button>
          )}
          <button 
            onClick={() => shareProperty('copy')} 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            📋
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Copy Link</span>
          </button>
          <button 
            onClick={() => shareProperty('whatsapp')} 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            📱
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>WhatsApp</span>
          </button>
          <button 
            onClick={() => shareProperty('facebook')} 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            📘
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Facebook</span>
          </button>
          <button 
            onClick={() => shareProperty('twitter')} 
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '24px'
            }}
          >
            🐦
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Twitter</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const { listingId } = useParams();
  const [listing, setListing] = useState(null);

  const getListingDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Listing Details Failed", err.message);
      toast.error('Failed to load property details');
      setLoading(false);
    }
  };

  // Lightbox navigation
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToNext = () => {
    setLightboxIndex((prev) => 
      (prev + 1) % listing.listingPhotoPaths.length
    );
  };

  const goToPrev = () => {
    setLightboxIndex((prev) => 
      (prev - 1 + listing.listingPhotoPaths.length) % listing.listingPhotoPaths.length
    );
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen, listing]);

  useEffect(() => {
    getListingDetails();
  }, [listingId]);

  /* BOOKING CALENDAR */
  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  // Calculate the number of months
  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const monthCount = end.getMonth() - start.getMonth() + (12 * (end.getFullYear() - start.getFullYear()));

  // Calculate the remaining days
  const remainingDays = (end.getTime() - start.getTime()) % (30 * 24 * 60 * 60 * 1000); // Assuming 30 days in a month
  const remainingDaysInMonths = Math.ceil(remainingDays / (30 * 24 * 60 * 60 * 1000)); // Convert remaining days to months

  // Update monthCount if there are remaining days
  const updatedMonthCount = monthCount + remainingDaysInMonths;

  useEffect(() => {
    if (monthCount < 1) {
      setError("Bookings must be at least 1 month long.");
    } else {
      setError("");
    }
  }, [dateRange]);

  /* SUBMIT BOOKING */
  const customerId = useSelector((state) => state?.user?._id);

  const navigate = useNavigate();

  // Share functionality
  const handleShare = () => {
    console.log('Share button clicked'); // Debug log
    setShowShareModal(true);
  };

  const shareProperty = async (platform) => {
    console.log('Sharing to platform:', platform); // Debug log
    const propertyUrl = `${window.location.origin}/properties/${listingId}`;
    const shareText = `Check out this amazing property: ${listing?.title || 'Property'} in ${listing?.city || 'Unknown'}, ${listing?.province || 'Unknown'}, ${listing?.country || 'Unknown'} - ₹${listing?.price || 'N/A'}/month`;
    
    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: listing?.title || 'Property Listing',
          text: shareText,
          url: propertyUrl,
        });
      } else if (platform === 'copy') {
        await navigator.clipboard.writeText(propertyUrl);
        toast.success('Link copied to clipboard!');
      } else if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + propertyUrl)}`, '_blank');
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`, '_blank');
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(propertyUrl)}`, '_blank');
      }
      setShowShareModal(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share property');
    }
  };

  const handleSubmit = async (token) => {
    if (updatedMonthCount < 1) return; // Prevent submission if invalid

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingForm),
      });

      if (response.ok) {
        navigate(`/${customerId}/trips`);
      }
    } catch (err) {
      console.log("Submit Booking Failed.", err.message);
    }
  };

  return (
    <>
      {/* Share Modal using Portal - Always rendered for immediate response */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareProperty={shareProperty}
      />
      
      {loading ? (
        <Loader />
      ) : (
        <>
          <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          {listing && (
            <button 
              className="share-button" 
              onClick={handleShare} 
              title="Share this property"
            >
              <Share />
              <span>Share</span>
            </button>
          )}
        </div>

        <div className="photos">
          {listing.listingPhotoPaths?.map((item, index) => (
            <div 
              key={index} 
              className="photo-item"
              onClick={() => openLightbox(index)}
            >
              <LazyImage
                src={`${API_BASE_URL}/${item.replace("public", "")}`}
                alt="listing photo"
              />
            </div>
          ))}
        </div>

        {/* Lightbox Gallery */}
        {lightboxOpen && (
          <div className="lightbox" onClick={closeLightbox}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <Close sx={{ fontSize: '32px' }} />
            </button>
            <button 
              className="lightbox-prev" 
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
            >
              <ChevronLeft sx={{ fontSize: '48px' }} />
            </button>
            <button 
              className="lightbox-next" 
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight sx={{ fontSize: '48px' }} />
            </button>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img
                src={`${API_BASE_URL}/${listing.listingPhotoPaths[lightboxIndex].replace("public", "")}`}
                alt={`Property ${lightboxIndex + 1}`}
              />
              <div className="lightbox-counter">
                {lightboxIndex + 1} / {listing.listingPhotoPaths.length}
              </div>
            </div>
          </div>
        )}

        <h2>
          {listing.type} in {listing.city}, {listing.province},{" "}
          {listing.country}
        </h2>
        <p>
          {listing.guestCount} guests - {listing.bedroomCount} bedroom(s) -{" "}
          {listing.bedCount} bed(s) - {listing.bathroomCount} bathroom(s)
        </p>
        <hr />

        <div className="profile">
          <LazyImage
            src={`${API_BASE_URL}/${listing.creator.profileImagePath.replace(
              "public",
              ""
            )}`}
          />
          <h3>
            Hosted by {listing.creator.firstName} {listing.creator.lastName}
          </h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing.description}</p>
        <hr />

        <h3>{listing.highlight}</h3>
        <p>{listing.highlightDesc}</p>
        <hr />

        <div className="booking">
          <div>
            <h2>What this place offers?</h2>
            <div className="amenities">
              {listing.amenities[0].split(",").map((item, index) => (
                <div className="facility" key={index}>
                  <div className="facility_icon">
                    {
                      facilities.find((facility) => facility.name === item)
                        ?.icon
                    }
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange ranges={dateRange} onChange={handleSelect} />
              <h2>
                ₹{listing.price} x {updatedMonthCount}{" "}
                {updatedMonthCount > 1 ? "months" : "month"}
              </h2>
              <h2>Total price: ₹{listing.price * updatedMonthCount}</h2>
              <p>Start Date: {dateRange[0].startDate.toLocaleDateString()}</p>
              <p>End Date: {dateRange[0].endDate.toLocaleDateString()}</p>
              {error && <p className="error-message">{error}</p>} {/* Display error message */}
              <br></br>
              <Elements stripe={stripePromise}>
          <CheckoutForm handleBooking={handleSubmit} monthCount={updatedMonthCount}/>
        </Elements>
        {isBooking && <p>Processing Booking...</p>}
              
            </div>
          </div>
        </div>
      </div>
          <ReviewSection listingId={listing._id} hostId={listing.creator._id} />
          <Footer />
        </>
      )}
    </>
  );
};

export default ListingDetails;