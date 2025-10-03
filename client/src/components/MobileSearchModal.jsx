import { useState } from "react";
import { IconButton } from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "../styles/MobileSearchModal.scss";
import variables from "../styles/variables.scss";

const MobileSearchModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search.trim() !== "") {
      navigate(`/properties/search/${search}`);
      setSearch("");
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-search-modal">
      <div className="mobile-search-overlay" onClick={onClose}></div>
      <div className="mobile-search-content">
        <div className="mobile-search-header">
          <h2>Search Properties</h2>
          <IconButton onClick={onClose}>
            <Close sx={{ color: variables.darkgrey }} />
          </IconButton>
        </div>
        <div className="mobile-search-input-wrapper">
          <input
            type="text"
            placeholder="Search by location, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          <IconButton 
            disabled={search === ""}
            onClick={handleSearch}
          >
            <Search sx={{ color: search === "" ? variables.grey : variables.pinkred }} />
          </IconButton>
        </div>
        <div className="search-suggestions">
          <p className="suggestions-title">Popular Searches</p>
          <div className="suggestion-chips">
            {["Mumbai", "Delhi", "Bangalore", "Apartment", "Villa", "Studio"].map((suggestion) => (
              <button
                key={suggestion}
                className="suggestion-chip"
                onClick={() => {
                  setSearch(suggestion);
                  navigate(`/properties/search/${suggestion}`);
                  onClose();
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSearchModal;
