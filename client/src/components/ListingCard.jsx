import { useState,useEffect,useRef } from "react";
import "../styles/ListingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
  Star,
  Verified,
  Share,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import LazyImage from "./LazyImage";
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';

const ListingCard = ({
  listingId,
  creator,
  listingPhotoPaths,
  city,
  province,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
  verified = false,
  averageRating = 0,
  reviewCount = 0,
}) => {
  /* SLIDER FOR IMAGES */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const slideInterval = useRef(null); // Use ref to keep track of interval
//automatic slide movement
 // Function to start auto-sliding
 const startAutoSlide = () => {
  slideInterval.current = setInterval(() => {
    goToNextSlide();
  }, 3000);
};
  // Function to stop auto-sliding
  const stopAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };
  // Automatically start the slide on hover
  useEffect(() => {
    if (isHovering) {
      startAutoSlide();
    } else {
      stopAutoSlide();
    }
    
    return () => stopAutoSlide(); // Cleanup on unmount
  }, [isHovering]);

  const goToPrevSlide = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + listingPhotoPaths.length) % listingPhotoPaths.length
    );
  };

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % listingPhotoPaths.length);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ADD TO WISHLIST */
  const user = useSelector((state) => state.user);
  const wishList = user?.wishList || [];

  const isLiked = wishList?.find((item) => item?._id === listingId);

  const patchWishList = async () => {
    if (!user) {
      toast.info('Please login to add to wishlist');
      return;
    }
    
    if (user?._id !== creator._id) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/users/${user?._id}/${listingId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
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

  // Use real data from props
  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : 'New';
  const displayReviewCount = reviewCount || 0;

  // Share functionality
  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  const shareProperty = async (platform) => {
    const propertyUrl = `${window.location.origin}/properties/${listingId}`;
    const shareText = `Check out this amazing property: ${city}, ${province}, ${country} - ₹${price}/month`;
    
    try {
      if (platform === 'native' && navigator.share) {
        await navigator.share({
          title: `Property in ${city}`,
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

  // Handle card click with support for new tab
  const handleCardClick = (e) => {
    // If Ctrl/Cmd key is pressed or middle mouse button, open in new tab
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(`/properties/${listingId}`, '_blank');
    } else {
      navigate(`/properties/${listingId}`);
    }
  };

  return (
    <div
      className="listing-card"
      onClick={handleCardClick}
      onAuxClick={(e) => {
        if (e.button === 1) { // Middle mouse button
          e.preventDefault();
          window.open(`/properties/${listingId}`, '_blank');
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Badges */}
      <div className="listing-badges">
        {verified && (
          <div className="badge verified-badge">
            <Verified sx={{ fontSize: '14px' }} />
            <span>Verified</span>
          </div>
        )}
      </div>

      <div className="slider-container"
       onMouseEnter={() => setIsHovering(true)}  
       onMouseLeave={() => setIsHovering(false)} >
      
        <div
          className="slider"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {listingPhotoPaths?.map((photo, index) => (
            <div key={index} className="slide">
              <LazyImage
                src={`${API_BASE_URL}/${photo?.replace("public", "")}`}
                alt={` ${index + 1}`}
              />
              <div
                className="prev-button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevSlide(e);
                }}
              >
                <ArrowBackIosNew sx={{ fontSize: "15px" }} />
              </div>
              <div
                className="next-button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextSlide(e);
                }}
              >
                <ArrowForwardIos sx={{ fontSize: "15px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="listing-info">
        <h3>
          {city}, {province}, {country}
        </h3>
        
        <div className="rating">
          <Star sx={{ fontSize: '16px', color: '#F59E0B' }} />
          <span className="rating-value">{displayRating}</span>
          {displayReviewCount > 0 && (
            <span className="review-count">({displayReviewCount})</span>
          )}
        </div>
      </div>
      
      <p className="category">{category}</p>

      {!booking ? (
        <>
          <p>{type}</p>
          <p>
            <span>₹{price}</span> per month
          </p>
        </>
      ) : (
        <>
          <p>
            start Date {startDate}
          </p>
          <p>
          End Date-{endDate}
          </p>
          <p>
            <span>₹{totalPrice}</span> total
          </p>
        </>
      )}

      <div className="action-buttons">
        <button
          className="favorite"
          onClick={(e) => {
            e.stopPropagation();
            patchWishList();
          }}
          disabled={!user}
          title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isLiked ? (
            <Favorite sx={{ color: "red" }} />
          ) : (
            <Favorite sx={{ color: "white" }} />
          )}
        </button>

        <button
          className="share-btn"
          onClick={handleShare}
          title="Share property"
        >
          <Share sx={{ color: "white" }} />
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={(e) => {
          e.stopPropagation();
          setShowShareModal(false);
        }}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Share this property</h4>
            <div className="share-options">
              {navigator.share && (
                <button onClick={() => shareProperty('native')} className="share-option native">
                  <Share />
                  <span>Share</span>
                </button>
              )}
              <button onClick={() => shareProperty('copy')} className="share-option copy">
                📋
                <span>Copy Link</span>
              </button>
              <button onClick={() => shareProperty('whatsapp')} className="share-option whatsapp">
                📱
                <span>WhatsApp</span>
              </button>
              <button onClick={() => shareProperty('facebook')} className="share-option facebook">
                📘
                <span>Facebook</span>
              </button>
              <button onClick={() => shareProperty('twitter')} className="share-option twitter">
                🐦
                <span>Twitter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingCard;