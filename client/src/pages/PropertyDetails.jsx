import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Share, 
  Favorite, 
  Star, 
  Verified, 
  LocationOn, 
  People, 
  Hotel, 
  Bathtub,
  ChevronLeft,
  ChevronRight,
  Close
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import { toast } from 'react-toastify';
import { createPortal } from "react-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ReviewSection from '../components/ReviewSection';
import Loader from "../components/Loader";
import LazyImage from "../components/LazyImage";
import { facilities } from "../data";
import API_BASE_URL from '../config';
import "../styles/PropertyDetails.scss";

// Share Modal Component
const ShareModal = ({ isOpen, onClose, shareProperty }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h4>Share this property</h4>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="share-options">
          {navigator.share && (
            <button onClick={() => shareProperty('native')} className="share-option">
              <Share />
              <span>Share</span>
            </button>
          )}
          <button onClick={() => shareProperty('copy')} className="share-option">
            📋<span>Copy Link</span>
          </button>
          <button onClick={() => shareProperty('whatsapp')} className="share-option">
            📱<span>WhatsApp</span>
          </button>
          <button onClick={() => shareProperty('facebook')} className="share-option">
            📘<span>Facebook</span>
          </button>
          <button onClick={() => shareProperty('twitter')} className="share-option">
            🐦<span>Twitter</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const PropertyDetails = () => {
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const { listingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const wishList = user?.wishList || [];

  const isLiked = wishList?.find((item) => item?._id === listingId);

  useEffect(() => {
    getListingDetails();
  }, [listingId]);

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

  const handleWishlist = async () => {
    if (!user) {
      toast.info('Please login to add to wishlist');
      return;
    }
    
    if (user?._id !== listing?.creator?._id) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${user?._id}/${listingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        dispatch(setWishList(data.wishList));
        toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist');
      } catch (error) {
        toast.error('Failed to update wishlist');
      }
    } else { 
      toast.info('You cannot add your own property to wishlist');
    }
  };

  const handleShare = () => setShowShareModal(true);

  const shareProperty = async (platform) => {
    const propertyUrl = `${window.location.origin}/properties/${listingId}`;
    const shareText = `Check out: ${listing?.title} in ${listing?.city}, ${listing?.province} - ₹${listing?.price}/month`;
    
    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share({ title: listing?.title, text: shareText, url: propertyUrl });
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
      toast.error('Failed to share property');
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  
  const goToNext = () => setLightboxIndex((prev) => (prev + 1) % listing.listingPhotoPaths.length);
  const goToPrev = () => setLightboxIndex((prev) => (prev - 1 + listing.listingPhotoPaths.length) % listing.listingPhotoPaths.length);

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

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} shareProperty={shareProperty} />
      
      <div className="property-details">
        {/* Header Section */}
        <div className="property-header">
          <div className="property-title-section">
            <div className="title-content">
              {listing.verified && (
                <div className="verified-badge">
                  <Verified /> <span>Verified Property</span>
                </div>
              )}
              <h1>{listing.title}</h1>
              <div className="property-location">
                <LocationOn />
                <span>{listing.city}, {listing.province}, {listing.country}</span>
              </div>
              <div className="property-stats">
                <div className="rating">
                  <Star />
                  <span className="rating-value">
                    {listing.averageRating > 0 ? listing.averageRating.toFixed(1) : 'New'}
                  </span>
                  {listing.reviewCount > 0 && (
                    <span className="review-count">({listing.reviewCount} reviews)</span>
                  )}
                </div>
                <div className="property-type">{listing.type} • {listing.category}</div>
              </div>
            </div>
            <div className="action-buttons">
              <button className="action-btn share-btn" onClick={handleShare}>
                <Share /> <span>Share</span>
              </button>
              <button 
                className={`action-btn wishlist-btn ${isLiked ? 'active' : ''}`} 
                onClick={handleWishlist}
                disabled={!user}
              >
                <Favorite /> <span>{isLiked ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="photo-gallery">
          <div className="main-photo" onClick={() => openLightbox(0)}>
            <LazyImage
              src={`${API_BASE_URL}/${listing.listingPhotoPaths[0]?.replace("public", "")}`}
              alt="Main property"
              priority={true}
            />
          </div>
          <div className="photo-grid">
            {listing.listingPhotoPaths.slice(1, 5).map((photo, index) => (
              <div key={index} className="grid-photo" onClick={() => openLightbox(index + 1)}>
                <LazyImage
                  src={`${API_BASE_URL}/${photo.replace("public", "")}`}
                  alt={`Property ${index + 2}`}
                />
                {index === 3 && listing.listingPhotoPaths.length > 5 && (
                  <div className="more-photos-overlay">
                    <span>+{listing.listingPhotoPaths.length - 5} more</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="view-all-photos" onClick={() => openLightbox(0)}>
            View all {listing.listingPhotoPaths.length} photos
          </button>
        </div>

        {/* Main Content */}
        <div className="property-content">
          <div className="content-main">
            {/* Quick Info */}
            <div className="quick-info-card">
              <div className="info-item">
                <People />
                <div>
                  <span className="label">Guests</span>
                  <span className="value">{listing.guestCount}</span>
                </div>
              </div>
              <div className="info-item">
                <Hotel />
                <div>
                  <span className="label">Bedrooms</span>
                  <span className="value">{listing.bedroomCount}</span>
                </div>
              </div>
              <div className="info-item">
                <Hotel />
                <div>
                  <span className="label">Beds</span>
                  <span className="value">{listing.bedCount}</span>
                </div>
              </div>
              <div className="info-item">
                <Bathtub />
                <div>
                  <span className="label">Bathrooms</span>
                  <span className="value">{listing.bathroomCount}</span>
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="host-section">
              <div className="host-info">
                <LazyImage
                  src={`${API_BASE_URL}/${listing.creator.profileImagePath.replace("public", "")}`}
                  alt="Host"
                  className="host-avatar"
                />
                <div className="host-details">
                  <h3>Hosted by {listing.creator.firstName} {listing.creator.lastName}</h3>
                  <p>Joined in {new Date(listing.creator.createdAt).getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="section">
              <h2>About this place</h2>
              <p className="description">{listing.description}</p>
            </div>

            {/* Highlight */}
            <div className="section highlight-section">
              <h3>{listing.highlight}</h3>
              <p>{listing.highlightDesc}</p>
            </div>

            {/* Amenities */}
            <div className="section">
              <h2>What this place offers</h2>
              <div className="amenities-grid">
                {listing.amenities[0].split(",").map((item, index) => (
                  <div className="amenity-item" key={index}>
                    <div className="amenity-icon">
                      {facilities.find((facility) => facility.name === item)?.icon}
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="booking-sidebar">
            <div className="booking-card">
              <div className="price-section">
                <span className="price">₹{listing.price}</span>
                <span className="period">/ month</span>
              </div>
              <button 
                className="book-now-btn"
                onClick={() => navigate(`/booking/${listingId}`)}
              >
                Reserve
              </button>
              <p className="booking-note">You won't be charged yet</p>
              <div className="booking-features">
                <div className="feature">
                  <Verified />
                  <span>Secure payment</span>
                </div>
                <div className="feature">
                  <Star />
                  <span>Verified property</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-container">
          <ReviewSection listingId={listing._id} hostId={listing.creator._id} />
        </div>
      </div>

      {/* Lightbox Gallery */}
      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <Close />
          </button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); goToPrev(); }}>
            <ChevronLeft />
          </button>
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); goToNext(); }}>
            <ChevronRight />
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

      <Footer />
    </>
  );
};

export default PropertyDetails;
