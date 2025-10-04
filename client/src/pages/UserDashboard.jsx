import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Person, 
  Home, 
  CalendarToday, 
  Favorite, 
  Star, 
  Verified,
  Chat,
  Delete,
  Edit,
  BookOnline,
  Settings
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { setLogin } from '../redux/state';
import API_BASE_URL from '../config';
import '../styles/UserDashboard.scss';
import LazyImage from '../components/LazyImage';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [myListings, setMyListings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize form data with user info
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
    });

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's listings
      const listingsRes = await fetch(
        `${API_BASE_URL}/users/${user._id}/properties`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setMyListings(Array.isArray(listingsData) ? listingsData : []);
      } else {
        console.error('Failed to fetch listings:', listingsRes.status);
        setMyListings([]);
      }

      // Fetch user's bookings
      const bookingsRes = await fetch(
        `${API_BASE_URL}/users/${user._id}/trips`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setMyBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } else {
        console.error('Failed to fetch bookings:', bookingsRes.status);
        setMyBookings([]);
      }

      // Fetch wishlist
      const wishlistRes = await fetch(
        `${API_BASE_URL}/users/${user._id}/wishList`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlist(Array.isArray(wishlistData) ? wishlistData : []);
      } else {
        console.error('Failed to fetch wishlist:', wishlistRes.status);
        setWishlist([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data. Please make sure the backend server is running.');
      setMyListings([]);
      setMyBookings([]);
      setWishlist([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user-profile/${user._id}/update`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        dispatch(setLogin({ user: updatedUser, token }));
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await fetch(
        `${API_BASE_URL}/user-profile/${user._id}/upload-photo`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const updatedUser = await response.json();
        dispatch(setLogin({ user: updatedUser, token }));
        toast.success('Profile photo updated');
      } else {
        toast.error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    }
  };

  const renderProfileTab = () => (
    <div className="profile-tab">
      <div className="profile-header">
        <div className="profile-photo-section">
          <LazyImage
            src={user?.profileImagePath 
              ? `${API_BASE_URL}/${user.profileImagePath.replace("public", "")}` 
              : "/assets/default-avatar.png"}
            alt="Profile"
            className="profile-photo"
          />
          <label className="upload-photo-btn">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <Edit /> Change Photo
          </label>
        </div>

        <div className="profile-info">
          <h2>{user?.firstName} {user?.lastName}</h2>
          {user?.verified && (
            <span className="verified-badge">
              <Verified /> Verified User
            </span>
          )}
          <p className="member-since">
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div className="profile-details">
        <div className="section-header">
          <h3>Personal Information</h3>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              <Edit /> Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleProfileUpdate}>Save</button>
              <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          )}
        </div>

        <div className="info-grid">
          <div className="info-field">
            <label>First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            ) : (
              <p>{user?.firstName}</p>
            )}
          </div>

          <div className="info-field">
            <label>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            ) : (
              <p>{user?.lastName}</p>
            )}
          </div>

          <div className="info-field">
            <label>Email</label>
            <p>{user?.email}</p>
          </div>

          <div className="info-field">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Add phone number"
              />
            ) : (
              <p>{user?.phone || 'Not provided'}</p>
            )}
          </div>

          <div className="info-field full-width">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <p>{user?.bio || 'No bio yet'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderListingsTab = () => (
    <div className="listings-tab">
      <div className="tab-header">
        <h3>My Properties ({myListings.length})</h3>
        <button className="add-btn" onClick={() => navigate('/create-listing')}>
          + Add New Property
        </button>
      </div>

      <div className="listings-grid">
        {myListings.map((listing) => (
          <div key={listing._id} className="listing-card-dash">
            <LazyImage
              src={`${API_BASE_URL}/${listing.listingPhotoPaths[0]?.replace("public", "")}`}
              alt={listing.title}
              className="listing-image"
            />
            <div className="listing-info">
              <h4>{listing.title || `${listing.city}, ${listing.country}`}</h4>
              <p className="location">{listing.city}, {listing.province}</p>
              <p className="price">₹{listing.price} / night</p>
              {listing.verified && (
                <span className="verified-badge">
                  <Verified /> Verified
                </span>
              )}
            </div>
            <div className="listing-stats">
              <span><Star /> {listing.averageRating?.toFixed(1) || 'New'}</span>
              <span>{listing.totalBookings || 0} bookings</span>
            </div>
            <div className="listing-actions">
              <button 
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-property/${listing._id}`);
                }}
                title="Edit Property"
              >
                <Edit />
              </button>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProperty(listing._id, listing.title || `${listing.city}, ${listing.country}`);
                }}
                title="Delete Property"
              >
                <Delete />
              </button>
            </div>
          </div>
        ))}
        
        {myListings.length === 0 && (
          <div className="empty-state">
            <Home style={{ fontSize: 64, color: '#ccc' }} />
            <p>No properties yet</p>
            <button onClick={() => navigate('/create-listing')}>List Your First Property</button>
          </div>
        )}
      </div>
    </div>
  );

  const handleDeleteProperty = async (propertyId, propertyTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/listings/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Property deleted successfully');
        // Remove the property from the local state
        setMyListings(prev => prev.filter(listing => listing._id !== propertyId));
      } else {
        toast.error(data.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  const startChat = async (hostId, listingId) => {
    // Validate inputs
    if (!hostId || !listingId) {
      toast.error('Missing booking information');
      console.error('Missing data:', { hostId, listingId });
      return;
    }

    try {
      // Create or get conversation with host
      const response = await fetch(`${API_BASE_URL}/messages/conversation/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: hostId, // Changed from participantId to recipientId
          listingId: listingId
        })
      });

      if (response.ok) {
        navigate('/messages');
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        toast.error('Failed to start chat: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const renderBookingsTab = () => (
    <div className="bookings-tab">
      <h3>My Bookings ({myBookings.length})</h3>
      
      <div className="bookings-list">
        {myBookings.map((booking) => (
          <div key={booking._id} className="booking-card">
            <LazyImage
              src={`${API_BASE_URL}/${booking.listingId?.listingPhotoPaths[0]?.replace("public", "")}`}
              alt={booking.listingId?.title}
              className="booking-image"
            />
            <div className="booking-info">
              <h4>{booking.listingId?.title}</h4>
              <p>{booking.listingId?.city}, {booking.listingId?.country}</p>
              <div className="booking-dates">
                <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                <span> - </span>
                <span>{new Date(booking.endDate).toLocaleDateString()}</span>
              </div>
              <p className="booking-total">Total: ₹{booking.totalPrice}</p>
            </div>
            <div className="booking-actions">
              <button 
                className="chat-btn"
                onClick={() => startChat(
                  booking.hostId?._id || booking.hostId,
                  booking.listingId?._id || booking.listingId
                )}
                title="Chat with host"
              >
                <Chat /> Chat
              </button>
              <span className={`status-badge ${booking.status || 'confirmed'}`}>
                {booking.status || 'Confirmed'}
              </span>
            </div>
          </div>
        ))}

        {myBookings.length === 0 && (
          <div className="empty-state">
            <BookOnline style={{ fontSize: 64, color: '#ccc' }} />
            <p>No bookings yet</p>
            <button onClick={() => navigate('/')}>Explore Properties</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderWishlistTab = () => (
    <div className="wishlist-tab">
      <h3>My Wishlist ({wishlist.length})</h3>
      
      <div className="wishlist-grid">
        {wishlist.map((item) => (
          <div 
            key={item._id} 
            className="wishlist-card"
            onClick={() => navigate(`/properties/${item._id}`)}
          >
            <LazyImage
              src={`${API_BASE_URL}/${item.listingPhotoPaths[0]?.replace("public", "")}`}
              alt={item.title}
              className="wishlist-image"
            />
            <div className="wishlist-info">
              <h4>{item.city}, {item.country}</h4>
              <p>₹{item.price} / night</p>
            </div>
          </div>
        ))}

        {wishlist.length === 0 && (
          <div className="empty-state">
            <Favorite style={{ fontSize: 64, color: '#ccc' }} />
            <p>No favorites yet</p>
            <button onClick={() => navigate('/')}>Discover Properties</button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="user-dashboard">
        <div className="dashboard-sidebar">
          <nav className="dashboard-nav">
            <button 
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <Person /> Profile
            </button>
            <button 
              className={activeTab === 'listings' ? 'active' : ''}
              onClick={() => setActiveTab('listings')}
            >
              <Home /> My Properties
            </button>
            <button 
              className={activeTab === 'bookings' ? 'active' : ''}
              onClick={() => setActiveTab('bookings')}
            >
              <BookOnline /> My Bookings
            </button>
            <button 
              className={activeTab === 'wishlist' ? 'active' : ''}
              onClick={() => setActiveTab('wishlist')}
            >
              <Favorite /> Wishlist
            </button>
            {user?.isAdmin && (
              <button 
                className="admin-link"
                onClick={() => navigate('/admin')}
              >
                <Settings /> Admin Panel
              </button>
            )}
          </nav>
        </div>

        <div className="dashboard-content">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'listings' && renderListingsTab()}
          {activeTab === 'bookings' && renderBookingsTab()}
          {activeTab === 'wishlist' && renderWishlistTab()}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;
