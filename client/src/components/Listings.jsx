import { useEffect, useState } from "react";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import SkeletonCard from "./SkeletonCard";
import { useDispatch, useSelector } from "react-redux";
import { setListings, setCategory, setSortOrder, setMinPrice, setMaxPrice, setLoading } from "../redux/state";
import { toast } from 'react-toastify';
import Pagination from "./Pagination";
import API_BASE_URL from '../config';

const Listings = () => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.loading);
  const selectedCategory = useSelector((state) => state.selectedCategory || 'All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const sortOrder = useSelector((state) => state.sortOrder || 'lowToHigh');
  const minPrice = useSelector((state) => state.minPrice||0);
  const maxPrice = useSelector((state) => state.maxPrice||1000000);
  const listings = useSelector((state) => state.listings)||[];

  const filteredListings = listings.filter(
    (listing) => listing.price >= minPrice && listing.price <= maxPrice
  );

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortOrder === "lowToHigh") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentListings = sortedListings.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, sortOrder, minPrice, maxPrice]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const getFeedListings = async () => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(
        selectedCategory !== "All"
          ? `${API_BASE_URL}/properties?category=${selectedCategory}`
          : `${API_BASE_URL}/properties`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data = await response.json();
      dispatch(setListings({ listings: data }));
      dispatch(setLoading(false));
    } catch (err) {
      console.error("Fetch Listings Failed", err.message);
      toast.error('Failed to load properties. Please try again.');
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getFeedListings();
  }, [selectedCategory]);

  return (
    <>
      <div className="category-list">
        { categories?.map((category, index) => (
          <div
            className={`category ${
              category.label === selectedCategory ? "selected" : ""
            }`}
            key={index}
            onClick={() => dispatch(setCategory(category.label))} // Dispatch category change to Redux
          >
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      <div className="sort-options">
        <label>Sort & Filter Options</label>
        <div className="sort-controls-wrapper">
          <div className="sort-dropdown-section">
            <label>Sort by Price:</label>
            <select
              className="sele"
              value={sortOrder}
              onChange={(e) => dispatch(setSortOrder(e.target.value))} // Dispatch sort order change
            >
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </select>
          </div>

          <div className="price-range">
            <div className="price-section">
              <label>Min Price: ₹{minPrice}</label>
              <input
                type="range"
                min="0"
                max="10000"
                value={minPrice}
                onChange={(e) => dispatch(setMinPrice(e.target.value))} // Dispatch min price change
              />
            </div>
            <div className="price-section">
              <label>Max Price: ₹{maxPrice}</label>
              <input
                type="range"
                min="0"
                max="100000"
                value={maxPrice}
                onChange={(e) => dispatch(setMaxPrice(e.target.value))} // Dispatch max price change
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="listings">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : currentListings.length === 0 ? (
        <div className="no-listings">
          <h2>No properties found</h2>
          <p>Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <>
          <div className="listings">
            {currentListings.map(
            ({
              _id,
              creator,
              listingPhotoPaths,
              city,
              province,
              country,
              category,
              type,
              price,
              verified = false,
              averageRating = 0,
              reviewCount = 0,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                listingPhotoPaths={listingPhotoPaths}
                city={city}
                province={province}
                country={country}
                category={category}
                type={type}
                price={price}
                verified={verified}
                averageRating={averageRating}
                reviewCount={reviewCount}
                booking={booking}
              />
            )
            )}
          </div>
          
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={sortedListings.length}
            />
          )}
        </>
      )}
    </>
  );
};

export default Listings;
