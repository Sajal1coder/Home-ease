import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  CheckCircle, 
  Cancel, 
  Pending, 
  People, 
  Home, 
  RateReview,
  VerifiedUser,
  Block
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';
import '../styles/AdminDashboard.scss';
import LazyImage from '../components/LazyImage';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || !user.isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [usersRes, propertiesRes, reviewsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin/properties`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin/reviews/pending`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const propertiesData = await propertiesRes.json();
      const reviewsData = await reviewsRes.json();
      const statsData = await statsRes.json();

      setUsers(usersData);
      setProperties(propertiesData);
      setReviews(reviewsData);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, status) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/verify`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ verified: status })
        }
      );

      if (response.ok) {
        toast.success(`User ${status ? 'verified' : 'unverified'} successfully`);
        fetchDashboardData();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error('Failed to verify user');
    }
  };

  const handleVerifyProperty = async (propertyId, status) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/properties/${propertyId}/verify`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ verified: status })
        }
      );

      if (response.ok) {
        toast.success(`Property ${status ? 'verified' : 'rejected'} successfully`);
        fetchDashboardData();
      } else {
        toast.error('Failed to update property status');
      }
    } catch (error) {
      console.error('Error verifying property:', error);
      toast.error('Failed to verify property');
    }
  };

  const handleReviewModeration = async (reviewId, action) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/reviews/${reviewId}/${action}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        toast.success(`Review ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchDashboardData();
      } else {
        toast.error('Failed to moderate review');
      }
    } catch (error) {
      console.error('Error moderating review:', error);
      toast.error('Failed to moderate review');
    }
  };

  const handleBlockUser = async (userId, block) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/block`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ blocked: block })
        }
      );

      if (response.ok) {
        toast.success(`User ${block ? 'blocked' : 'unblocked'} successfully`);
        fetchDashboardData();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, properties, and reviews</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <People className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.totalUsers || 0}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <Home className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.totalProperties || 0}</h3>
            <p>Total Properties</p>
          </div>
        </div>
        <div className="stat-card">
          <VerifiedUser className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.verifiedUsers || 0}</h3>
            <p>Verified Users</p>
          </div>
        </div>
        <div className="stat-card">
          <Pending className="stat-icon" />
          <div className="stat-info">
            <h3>{stats.pendingVerifications || 0}</h3>
            <p>Pending Verifications</p>
          </div>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          <People /> Users
        </button>
        <button 
          className={activeTab === 'properties' ? 'active' : ''}
          onClick={() => setActiveTab('properties')}
        >
          <Home /> Properties
        </button>
        <button 
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          <RateReview /> Reviews
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'users' && (
          <div className="users-management">
            <h2>User Management</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell">
                          <LazyImage
                            src={user.profileImagePath 
                              ? `${API_BASE_URL}/${user.profileImagePath.replace("public", "")}`
                              : "/assets/default-avatar.png"}
                            alt={user.firstName}
                            className="user-avatar"
                          />
                          <span>{user.firstName} {user.lastName}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status-badge ${user.verified ? 'verified' : 'pending'} ${user.blocked ? 'blocked' : ''}`}>
                          {user.blocked ? 'Blocked' : user.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {!user.verified && (
                            <button 
                              className="btn-verify"
                              onClick={() => handleVerifyUser(user._id, true)}
                            >
                              <CheckCircle /> Verify
                            </button>
                          )}
                          {user.verified && !user.blocked && (
                            <button 
                              className="btn-block"
                              onClick={() => handleBlockUser(user._id, true)}
                            >
                              <Block /> Block
                            </button>
                          )}
                          {user.blocked && (
                            <button 
                              className="btn-verify"
                              onClick={() => handleBlockUser(user._id, false)}
                            >
                              <CheckCircle /> Unblock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="properties-management">
            <h2>Property Verification</h2>
            <div className="properties-grid">
              {properties.map((property) => (
                <div key={property._id} className="property-card-admin">
                  <LazyImage
                    src={`${API_BASE_URL}/${property.listingPhotoPaths[0]?.replace("public", "")}`}
                    alt={property.title}
                    className="property-image"
                  />
                  <div className="property-info">
                    <h3>{property.title}</h3>
                    <p className="property-location">{property.city}, {property.country}</p>
                    <p className="property-host">Host: {property.creator?.firstName} {property.creator?.lastName}</p>
                    <span className={`status-badge ${property.verified ? 'verified' : 'pending'}`}>
                      {property.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="property-actions">
                    {!property.verified && (
                      <>
                        <button 
                          className="btn-verify"
                          onClick={() => handleVerifyProperty(property._id, true)}
                        >
                          <CheckCircle /> Verify
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleVerifyProperty(property._id, false)}
                        >
                          <Cancel /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-management">
            <h2>Review Moderation</h2>
            <div className="reviews-list-admin">
              {reviews.map((review) => (
                <div key={review._id} className="review-card-admin">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <strong>{review.user?.firstName} {review.user?.lastName}</strong>
                      <span className="review-rating">Rating: {review.rating}/5</span>
                    </div>
                    {review.reported && (
                      <span className="reported-badge">Reported</span>
                    )}
                  </div>
                  <p className="review-property">Property: {review.listing?.title}</p>
                  <p className="review-comment">{review.comment}</p>
                  {review.reportReason && (
                    <p className="report-reason">Report Reason: {review.reportReason}</p>
                  )}
                  <div className="review-actions-admin">
                    <button 
                      className="btn-approve"
                      onClick={() => handleReviewModeration(review._id, 'approve')}
                    >
                      <CheckCircle /> Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleReviewModeration(review._id, 'reject')}
                    >
                      <Cancel /> Reject
                    </button>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="no-data">No pending reviews</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
