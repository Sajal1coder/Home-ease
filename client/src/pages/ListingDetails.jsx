import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";
import { Close, ChevronLeft, ChevronRight } from "@mui/icons-material";
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

const stripePromise = loadStripe('pk_test_51QX1mlBiDoQ4NR3uCudfr8EIQ0tUirxoTt04YgxPffEektoFmZJuM9VefA5BoFwzfyPlLmmCzP03p35GaQC3rLLg00T6lPag4m');

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
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

  return loading ? (
    <Loader />
  ) : (
    <>
      <Navbar />

      <div className="listing-details">
        <div className="title">
          <h1>{listing.title}</h1>
          <div></div>
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
  );
};

export default ListingDetails;