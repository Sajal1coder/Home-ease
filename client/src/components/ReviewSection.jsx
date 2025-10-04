import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Star, 
  StarBorder, 
  ThumbUp, 
  Flag, 
  Reply 
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import API_BASE_URL from '../config';
import '../styles/ReviewSection.scss';
import LazyImage from './LazyImage';

const ReviewSection = ({ listingId, hostId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pagination, setPagination] = useState({});
  const [ratingBreakdown, setRatingBreakdown] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    fetchReviews();
    if (user && token) {
      checkReviewEligibility();
    }
  }, [listingId, user, token]);

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/reviews/listing/${listingId}?page=${page}`,
        { method: 'GET' }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setPagination(data.pagination || {});
        setRatingBreakdown(data.ratingBreakdown || []);
      } else {
        // If listing has no reviews, set empty arrays
        setReviews([]);
        setPagination({});
        setRatingBreakdown([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set empty states on error
      setReviews([]);
      setPagination({});
      setRatingBreakdown([]);
      setLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/can-review/${listingId}`,
        { 
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCanReview(data.canReview);
        setReviewMessage(data.message || '');
        if (data.bookings && data.bookings.length > 0) {
          setEligibleBookings(data.bookings);
          setSelectedBooking(data.bookings[0]._id); // Select first booking by default
        }
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      toast.info('Please login to mark reviews as helpful');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/${reviewId}/helpful`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        fetchReviews(); // Refresh reviews
        toast.success('Review marked as helpful!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      toast.error('Failed to update review');
    }
  };

  const handleReport = async (reviewId) => {
    if (!user) {
      toast.info('Please login to report reviews');
      return;
    }

    const reason = prompt('Please provide a reason for reporting this review:');
    if (!reason || reason.trim() === '') {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/reviews/${reviewId}/report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: reason.trim() })
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success('Review reported successfully. Thank you for helping keep our community safe.');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      toast.error('Failed to report review');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      index < rating ? 
        <Star key={index} sx={{ color: '#FFD700', fontSize: '18px' }} /> : 
        <StarBorder key={index} sx={{ color: '#ddd', fontSize: '18px' }} />
    ));
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingPercentage = (rating) => {
    if (!ratingBreakdown || !ratingBreakdown.length) return 0;
    const total = ratingBreakdown.reduce((sum, item) => sum + item.count, 0);
    const ratingCount = ratingBreakdown.find(item => item._id === rating)?.count || 0;
    return total > 0 ? Math.round((ratingCount / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="review-section">
        <div className="loading">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="review-section">
      <div className="review-header">
        <h2>
          <Star sx={{ color: '#FFD700' }} />
          {reviews.length > 0 ? calculateAverageRating() : 'No reviews yet'} 
          {reviews.length > 0 && ` · ${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'}`}
        </h2>
        {user && canReview && (
          <button 
            className="write-review-btn"
            onClick={() => setShowReviewModal(true)}
          >
            ✍️ Leave a Review
          </button>
        )}
        {user && !canReview && reviewMessage && (
          <p className="review-info-message">{reviewMessage}</p>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="rating-bar">
              <span className="rating-label">{rating} stars</span>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                />
              </div>
              <span className="rating-percentage">{getRatingPercentage(rating)}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header-section">
              <div className="reviewer-info">
                <LazyImage
                  src={review.user?.profileImagePath 
                    ? `${API_BASE_URL}/${review.user.profileImagePath.replace("public", "")}` 
                    : "/assets/default-avatar.png"}
                  alt={`${review.user?.firstName} ${review.user?.lastName}`}
                  className="reviewer-avatar"
                />
                <div>
                  <h4>{review.user?.firstName} {review.user?.lastName}</h4>
                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="rating-stars">
                {renderStars(review.rating)}
              </div>
            </div>

            {review.ratings && (
              <div className="detailed-ratings">
                {review.ratings.cleanliness && (
                  <div className="detail-rating">
                    <span>Cleanliness:</span>
                    <div className="stars">{renderStars(review.ratings.cleanliness)}</div>
                  </div>
                )}
                {review.ratings.accuracy && (
                  <div className="detail-rating">
                    <span>Accuracy:</span>
                    <div className="stars">{renderStars(review.ratings.accuracy)}</div>
                  </div>
                )}
                {review.ratings.communication && (
                  <div className="detail-rating">
                    <span>Communication:</span>
                    <div className="stars">{renderStars(review.ratings.communication)}</div>
                  </div>
                )}
              </div>
            )}

            <p className="review-comment">{review.comment}</p>

            {review.photos && review.photos.length > 0 && (
              <div className="review-photos">
                {review.photos.map((photo, index) => (
                  <LazyImage 
                    key={index} 
                    src={photo} 
                    alt={`Review photo ${index + 1}`}
                    className="review-photo"
                  />
                ))}
              </div>
            )}

            {review.hostResponse && (
              <div className="host-response">
                <Reply sx={{ fontSize: '16px' }} />
                <div>
                  <strong>Response from host:</strong>
                  <p>{review.hostResponse.comment}</p>
                  <span className="response-date">
                    {new Date(review.hostResponse.respondedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div className="review-actions">
              <button 
                className="action-btn"
                onClick={() => handleHelpful(review._id)}
              >
                <ThumbUp sx={{ fontSize: '16px' }} />
                Helpful ({review.helpful || 0})
              </button>
              <button 
                className="action-btn"
                onClick={() => handleReport(review._id)}
              >
                <Flag sx={{ fontSize: '16px' }} />
                Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="review-pagination">
          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-btn ${pagination.currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => fetchReviews(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {reviews.length === 0 && (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this property!</p>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal 
          listingId={listingId}
          eligibleBookings={eligibleBookings}
          selectedBooking={selectedBooking}
          setSelectedBooking={setSelectedBooking}
          onClose={() => setShowReviewModal(false)}
          onSubmit={() => {
            setShowReviewModal(false);
            fetchReviews();
            checkReviewEligibility();
          }}
          token={token}
        />
      )}
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ listingId, eligibleBookings, selectedBooking, setSelectedBooking, onClose, onSubmit, token }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [detailedRatings, setDetailedRatings] = useState({
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    checkIn: 5,
    value: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBooking) {
      toast.error('Please select a booking');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/reviews/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          bookingId: selectedBooking,
          rating,
          ratings: detailedRatings,
          comment
        })
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        onSubmit();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating, onRate) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => onRate(star)}
        style={{ cursor: 'pointer', fontSize: '24px', color: star <= currentRating ? '#FFD700' : '#ddd' }}
      >
        {star <= currentRating ? '★' : '☆'}
      </span>
    ));
  };

  return (
    <div 
      className="review-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div 
        className="review-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div 
          className="modal-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px',
            borderBottom: '1px solid #e9ecef',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '16px 16px 0 0'
          }}
        >
          <h3 style={{ 
            fontSize: '22px', 
            color: '#1e3a8a', 
            margin: 0, 
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ✍️ Leave a Review
          </h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid #dee2e6',
              fontSize: '24px',
              color: '#6c757d',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Booking Selection */}
          {eligibleBookings.length > 1 && (
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#1e3a8a',
                marginBottom: '12px',
                position: 'relative'
              }}>
                Select Your Stay:
              </label>
              <select 
                value={selectedBooking} 
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="booking-select"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #dee2e6',
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
              >
                {eligibleBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Overall Rating */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#1e3a8a',
              marginBottom: '12px',
              position: 'relative'
            }}>
              Overall Rating:
            </label>
            <div className="star-rating" style={{ 
              display: 'flex', 
              gap: '8px', 
              fontSize: '32px', 
              padding: '8px 0' 
            }}>
              {renderStars(rating, setRating)}
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="detailed-ratings" style={{
            marginBottom: '24px',
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h4 style={{
              fontSize: '16px',
              color: '#1e3a8a',
              marginBottom: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⭐ Rate Your Experience:
            </h4>
            {Object.keys(detailedRatings).map((key) => (
              <div key={key} className="rating-row" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '12px 16px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <label style={{
                  fontSize: '14px',
                  color: '#6c757d',
                  fontWeight: '600',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                <div className="star-rating-small" style={{
                  display: 'flex',
                  gap: '4px',
                  fontSize: '20px'
                }}>
                  {renderStars(detailedRatings[key], (value) => 
                    setDetailedRatings({...detailedRatings, [key]: value})
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#1e3a8a',
              marginBottom: '12px',
              position: 'relative'
            }}>
              Your Review:
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience at this property..."
              rows="5"
              required
              style={{
                width: '100%',
                padding: '16px',
                border: '2px solid #dee2e6',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                minHeight: '120px'
              }}
            />
          </div>

          {/* Submit Button */}
          <div className="modal-actions" style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '2px solid #e9ecef'
          }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                background: 'white',
                border: '2px solid #dee2e6',
                color: '#6c757d'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="submit-btn"
              style={{
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting ? '#ccc' : 'linear-gradient(135deg, #F8395A 0%, #e73c7e 100%)',
                border: 'none',
                color: 'white',
                boxShadow: submitting ? 'none' : '0 4px 15px rgba(248, 57, 90, 0.3)',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewSection;
