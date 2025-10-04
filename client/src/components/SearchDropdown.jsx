import { useState, useEffect, useRef } from "react";
import { Search, History, TrendingUp, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "../styles/SearchDropdown.scss";

const SearchDropdown = ({ 
  isOpen, 
  onClose, 
  isMobile = false, 
  initialValue = "",
  onSearch 
}) => {
  const [search, setSearch] = useState(initialValue);
  const [pastSearches, setPastSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Popular/Quick suggestions
  const quickSuggestions = [
    { text: "Mumbai", type: "location" },
    { text: "Delhi", type: "location" },
    { text: "Bangalore", type: "location" },
    { text: "Apartment", type: "category" },
    { text: "Villa", type: "category" },
    { text: "Studio", type: "category" },
    { text: "Beachfront", type: "feature" },
    { text: "Pet Friendly", type: "feature" }
  ];

  // Load past searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('homease_past_searches');
    if (saved) {
      try {
        setPastSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading past searches:', error);
      }
    }
  }, []);

  // Save search to localStorage
  const saveSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newSearch = {
      text: searchTerm.trim(),
      timestamp: Date.now()
    };
    
    const updated = [newSearch, ...pastSearches.filter(s => s.text !== searchTerm.trim())]
      .slice(0, 10); // Keep only last 10 searches
    
    setPastSearches(updated);
    localStorage.setItem('homease_past_searches', JSON.stringify(updated));
  };

  // Clear all past searches
  const clearPastSearches = () => {
    setPastSearches([]);
    localStorage.removeItem('homease_past_searches');
  };

  // Handle search execution
  const handleSearch = (searchTerm = search) => {
    if (searchTerm.trim() !== "") {
      saveSearch(searchTerm);
      navigate(`/properties/search/${searchTerm.trim()}`);
      setSearch("");
      setShowDropdown(false);
      if (onSearch) onSearch(searchTerm);
      if (isMobile && onClose) onClose();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearch(suggestion);
    handleSearch(suggestion);
  };

  // Handle input focus
  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  // Handle input blur (with delay to allow clicks)
  const handleInputBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      if (isMobile && onClose) onClose();
    }
  };

  // Auto-focus for mobile
  useEffect(() => {
    if (isMobile && isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isMobile, isOpen]);

  // Filter suggestions based on search input
  const filteredSuggestions = search.trim() 
    ? quickSuggestions.filter(s => 
        s.text.toLowerCase().includes(search.toLowerCase())
      )
    : quickSuggestions;

  // Mobile modal version
  if (isMobile) {
    if (!isOpen) return null;
    
    return (
      <div className="search-dropdown mobile-search-modal">
        <div className="mobile-search-overlay" onClick={onClose}></div>
        <div className="mobile-search-content">
          <div className="mobile-search-header">
            <h2>Search Properties</h2>
            <button className="close-btn" onClick={onClose}>
              <Close />
            </button>
          </div>
          
          <div className="search-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by location, category, features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="search-input"
            />
            <button 
              className={`search-btn ${search.trim() ? 'active' : ''}`}
              disabled={!search.trim()}
              onClick={() => handleSearch()}
            >
              <Search />
            </button>
          </div>

          <div className="search-suggestions">
            {/* Past Searches */}
            {pastSearches.length > 0 && (
              <div className="suggestion-section">
                <div className="section-header">
                  <div className="section-title">
                    <History />
                    <span>Recent Searches</span>
                  </div>
                  <button className="clear-btn" onClick={clearPastSearches}>
                    Clear
                  </button>
                </div>
                <div className="suggestion-list">
                  {pastSearches.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      className="suggestion-item past-search"
                      onClick={() => handleSuggestionClick(item.text)}
                    >
                      <History />
                      <span>{item.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Suggestions */}
            <div className="suggestion-section">
              <div className="section-header">
                <div className="section-title">
                  <TrendingUp />
                  <span>Popular Searches</span>
                </div>
              </div>
              <div className="suggestion-chips">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={`suggestion-chip ${suggestion.type}`}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    <span className="chip-text">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop dropdown version
  return (
    <div className="search-dropdown desktop-search">
      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by location, category, features..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          className="search-input"
        />
        <button 
          className={`search-btn ${search.trim() ? 'active' : ''}`}
          disabled={!search.trim()}
          onClick={() => handleSearch()}
        >
          <Search />
        </button>
      </div>

      {showDropdown && (
        <div ref={dropdownRef} className="search-dropdown-content">
          {/* Past Searches */}
          {pastSearches.length > 0 && (
            <div className="suggestion-section">
              <div className="section-header">
                <div className="section-title">
                  <History />
                  <span>Recent Searches</span>
                </div>
                <button className="clear-btn" onClick={clearPastSearches}>
                  Clear
                </button>
              </div>
              <div className="suggestion-list">
                {pastSearches.slice(0, 3).map((item, index) => (
                  <button
                    key={index}
                    className="suggestion-item past-search"
                    onClick={() => handleSuggestionClick(item.text)}
                  >
                    <History />
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Suggestions */}
          <div className="suggestion-section">
            <div className="section-header">
              <div className="section-title">
                <TrendingUp />
                <span>Popular Searches</span>
              </div>
            </div>
            <div className="suggestion-grid">
              {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  className={`suggestion-item quick-suggestion ${suggestion.type}`}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  <span className="suggestion-text">{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
