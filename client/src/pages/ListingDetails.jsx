import { useEffect, useState } from "react";
import "../styles/ListingDetails.scss";
import { useNavigate, useParams } from "react-router-dom";
import { facilities } from "../data";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";
import Loader from "../components/Loader";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";

const ListingDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // State for error message
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
        `http://localhost:3001/properties/${listingId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();
      setListing(data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listing Details Failed", err.message);
    }
  };

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

  const handleSubmit = async () => {
    if (updatedMonthCount < 1) return; // Prevent submission if invalid

    try {
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator._id,
        startDate: dateRange[0].startDate.toDateString(),
        endDate: dateRange[0].endDate.toDateString(),
        totalPrice: listing.price * updatedMonthCount,
      };

      const response = await fetch("http://localhost:3001/bookings/create", {
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
          {listing.listingPhotoPaths?.map((item) => (
            <img
              src={`http://localhost:3001/${item.replace("public", "")}`}
              alt="listing photo"
            />
          ))}
        </div>

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
          <img
            src={`http://localhost:3001/${listing.creator.profileImagePath.replace(
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
              <button
            className="button"
            type="submit"
            onClick={handleSubmit}
            disabled={monthCount < 1} // Disable button if booking is invalid
          >Book Now</button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;