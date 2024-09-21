import { useEffect, useState } from "react";
import { categories } from "../data";
import "../styles/Listings.scss";
import ListingCard from "./ListingCard";
import Loader from "./Loader";
import { useDispatch, useSelector } from "react-redux";
import { setListings, setCategory, setSortOrder, setMinPrice, setMaxPrice ,setLoading} from "../redux/state"; // Import Redux actions

const Listings = () => {
  const dispatch = useDispatch();

  const loading = useSelector((state) => state.loading);
  const selectedCategory = useSelector((state) => state.selectedCategory || 'All');
  const sortOrder = useSelector((state) => state.sortOrder || 'lowToHigh');
  const minPrice = useSelector((state) => state.minPrice||0);
  const maxPrice = useSelector((state) => state.maxPrice||1000000);
  const listings = useSelector((state) => state.listings);

  const getFeedListings = async () => {
    try {
      const response = await fetch(
        selectedCategory !== "All"
          ? `http://localhost:3001/properties?category=${selectedCategory}`
          : "http://localhost:3001/properties",
        {
          method: "GET",
        }
      );

      const data = await response.json();
      dispatch(setListings({ listings: data }));
      setLoading(false);
    } catch (err) {
      console.log("Fetch Listings Failed", err.message);
    }
  };

  useEffect(() => {
    getFeedListings();
  }, [selectedCategory]);

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
        <label>Sort options:</label>
        <select
          className="sele"
          value={sortOrder}
          onChange={(e) => dispatch(setSortOrder(e.target.value))} // Dispatch sort order change
        >
          <option value="lowToHigh">Price: Low to High</option>
          <option value="highToLow">Price: High to Low</option>
        </select>

        <div className="price-range">
          <label>Min Price: ₹{minPrice}</label>
          <input
            type="range"
            min="0"
            max="10000"
            value={minPrice}
            onChange={(e) => dispatch(setMinPrice(e.target.value))} // Dispatch min price change
          />
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

      {loading ? (
        <Loader />
      ) : (
        <div className="listings">
          {sortedListings.map(
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
                booking={booking}
              />
            )
          )}
        </div>
      )}
    </>
  );
};

export default Listings;
