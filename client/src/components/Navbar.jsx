import { IconButton } from "@mui/material";
import { Search, Person, Menu } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { setLogout } from "../redux/state";
import LazyImage from "./LazyImage";
import SearchDropdown from "./SearchDropdown";
import API_BASE_URL from "../config";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const navigate = useNavigate()

  return (
    <div className="navbar">
      <a href="/">
        <LazyImage src="/assets/logo.png" alt="logo" />
      </a>

      <div className="navbar_search">
        <SearchDropdown 
          isMobile={false}
          onSearch={() => {}}
        />
      </div>

      {/* Mobile Search Icon */}
      <div className="navbar_mobile_search">
        <IconButton onClick={() => setMobileSearchOpen(true)}>
          <Search sx={{ color: variables.pinkred }} />
        </IconButton>
      </div>

      <div className="navbar_right">
        {user ? (
          <a href="/create-listing" className="host">
            Become A Host
          </a>
        ) : (
          <a href="/login" className="host">
            Become A Host
          </a>
        )}

        <button
          className="navbar_right_account"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        >
          <Menu sx={{ color: variables.darkgrey }} />
          {!user ? (
            <Person sx={{ color: variables.darkgrey }} />
          ) : (
            user.profileImagePath && (
              <LazyImage
                src={`${API_BASE_URL}/${user.profileImagePath.replace(
                  "public",
                  ""
                )}`}
                alt="profile photo"
                style={{ objectFit: "cover", borderRadius: "50%" }}
              />
            )
          )}
        </button>

        {dropdownMenu && !user && (
          <div className="navbar_right_accountmenu">
            <Link to="/login">Log In</Link>
            <Link to="/register">Sign Up</Link>
          </div>
        )}

        {dropdownMenu && user && (
          <div className="navbar_right_accountmenu">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/messages">Messages</Link>
            {user.isAdmin && (
              <Link to="/admin">Admin Panel</Link>
            )}
            <Link to="/create-listing">Become A Host</Link>

            <Link
              to="/login"
              onClick={() => {
                dispatch(setLogout());
              }}
            >
              Log Out
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Search Modal */}
      <SearchDropdown 
        isMobile={true}
        isOpen={mobileSearchOpen} 
        onClose={() => setMobileSearchOpen(false)}
        onSearch={() => {}}
      />
    </div>
  );
};

export default Navbar;