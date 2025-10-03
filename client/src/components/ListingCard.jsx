import { useState,useEffect,useRef } from "react";
import "../styles/ListingCard.scss";
import {
  ArrowForwardIos,
  ArrowBackIosNew,
  Favorite,
  Star,
  Verified,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setWishList } from "../redux/state";
import LazyImage from "./LazyImage";
import { toast } from 'react-toastify';

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
}) => {
  /* SLIDER FOR IMAGES */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
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
          `https://home-ease-backend.onrender.com/users/${user?._id}/${listingId}`,
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

  // Generate random rating for demo (in production, this would come from API)
  const rating = (4 + Math.random()).toFixed(1);
  const reviewCount = Math.floor(Math.random() * 100) + 10;
  const isVerified = Math.random() > 0.3; // 70% verified

  return (
    <div
      className="listing-card"
      onClick={() => {
        navigate(`/properties/${listingId}`);
      }}
    >
      {/* Badges */}
      <div className="listing-badges">
        {isVerified && (
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
                src={`https://home-ease-backend.onrender.com/${photo?.replace("public", "")}`}
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
          <span className="rating-value">{rating}</span>
          <span className="review-count">({reviewCount})</span>
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

      <button
        className="favorite"
        onClick={(e) => {
          e.stopPropagation();
          patchWishList();
        }}
        disabled={!user}
      >
        {isLiked ? (
          <Favorite sx={{ color: "red" }} />
        ) : (
          <Favorite sx={{ color: "white" }} />
        )}
      </button>
    </div>
  );
};

export default ListingCard;