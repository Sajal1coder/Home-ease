import { useParams } from "react-router-dom";
import "../styles/List.scss"
import { useSelector,useDispatch  } from "react-redux";
import { setListings } from "../redux/state";
import { useEffect, useState } from "react";
import { Sort, FilterList, TuneRounded } from "@mui/icons-material";
import Loader from "../components/Loader"
import Navbar from "../components/Navbar";
import ListingCard from "../components/ListingCard";
import Footer from "../components/Footer"
import API_BASE_URL from '../config';

const SearchPage = () => {
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('relevance')
  const [sortedListings, setSortedListings] = useState([])
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [showFilters, setShowFilters] = useState(false)
  const { search } = useParams()
  const listings = useSelector((state) => state.listings)

  const dispatch = useDispatch()

  // Sort options
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviews' },
    { value: 'newest', label: 'Newest First' },
    { value: 'verified', label: 'Verified Properties' }
  ];

  const getSearchListings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/search/${search}`, {
        method: "GET"
      })

      const data = await response.json()
      dispatch(setListings({ listings: data }))
      setLoading(false)
    } catch (err) {
      console.log("Fetch Search List failed!", err.message)
    }
  }

  // Filter and sort listings based on selected criteria
  const filterAndSortListings = (listingsToSort, sortCriteria, priceFilter) => {
    if (!listingsToSort || listingsToSort.length === 0) return [];

    // First filter by price range
    const filtered = listingsToSort.filter(listing => {
      const price = listing.price || 0;
      return price >= priceFilter[0] && price <= priceFilter[1];
    });

    // Then sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      switch (sortCriteria) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        
        case 'verified':
          // Verified properties first, then by rating
          if (a.verified && !b.verified) return -1;
          if (!a.verified && b.verified) return 1;
          return (b.averageRating || 0) - (a.averageRating || 0);
        
        case 'relevance':
        default:
          // Default relevance: verified first, then by rating, then by reviews
          if (a.verified && !b.verified) return -1;
          if (!a.verified && b.verified) return 1;
          if ((b.averageRating || 0) !== (a.averageRating || 0)) {
            return (b.averageRating || 0) - (a.averageRating || 0);
          }
          return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
    });

    return sorted;
  };

  // Handle sort change
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const sorted = filterAndSortListings(listings, newSortBy, priceRange);
    setSortedListings(sorted);
  };

  // Handle price range change
  const handlePriceRangeChange = (newRange) => {
    setPriceRange(newRange);
    const sorted = filterAndSortListings(listings, sortBy, newRange);
    setSortedListings(sorted);
  };

  // Get price range from listings
  const getPriceRange = (listingsData) => {
    if (!listingsData || listingsData.length === 0) return [0, 50000];
    const prices = listingsData.map(listing => listing.price || 0);
    return [Math.min(...prices), Math.max(...prices)];
  };

  useEffect(() => {
    getSearchListings()
  }, [search])

  // Update sorted listings when listings, sortBy, or priceRange changes
  useEffect(() => {
    if (listings && listings.length > 0) {
      // Set initial price range based on available listings
      const [minPrice, maxPrice] = getPriceRange(listings);
      if (priceRange[0] === 0 && priceRange[1] === 50000) {
        setPriceRange([minPrice, maxPrice]);
      }
      
      const sorted = filterAndSortListings(listings, sortBy, priceRange);
      setSortedListings(sorted);
    }
  }, [listings, sortBy, priceRange])
  
  return loading ? <Loader /> : (
    <>
      <Navbar />
      <div className="search-page-header">
        <h1 className="title-list">{search}</h1>
        <div className="search-controls">
          <div className="results-count">
            {sortedListings?.length || 0} properties found
          </div>
          <div className="controls-wrapper">
            <div className="sort-controls">
              <Sort className="sort-icon" />
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-dropdown"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <TuneRounded />
              Filters
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="filter-panel">
            <div className="price-filter">
              <label>Price Range (₹ per night)</label>
              <div className="price-range">
                <div className="price-section">
                  <label>Min Price: ₹{priceRange[0]}</label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange([parseInt(e.target.value), priceRange[1]])}
                  />
                </div>
                <div className="price-section">
                  <label>Max Price: ₹{priceRange[1]}</label>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="list">
        {sortedListings?.map(
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
      <Footer />
    </>
  );
}

export default SearchPage