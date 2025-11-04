import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircleOutline, Close } from "@mui/icons-material";
import "../styles/PaymentSuccessModal.scss";

const PaymentSuccessModal = ({ isOpen, onClose, bookingDetails, redirectCountdown = 5 }) => {
  const [countdown, setCountdown] = useState(redirectCountdown);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Fire confetti from random positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(countdownInterval);
      };
    }
  }, [isOpen, onClose, redirectCountdown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="payment-success-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="payment-success-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="close-btn" onClick={onClose}>
            <Close />
          </button>

          {/* Success Icon with Animation */}
          <motion.div
            className="success-icon-wrapper"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="success-icon"
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <CheckCircleOutline />
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Payment Successful!
          </motion.h2>

          <motion.p
            className="success-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Your booking has been confirmed
          </motion.p>

          {/* Booking Details */}
          {bookingDetails && (
            <motion.div
              className="booking-details-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="detail-row">
                <span className="label">Property</span>
                <span className="value">{bookingDetails.propertyTitle}</span>
              </div>
              <div className="detail-row">
                <span className="label">Check-in</span>
                <span className="value">{bookingDetails.startDate}</span>
              </div>
              <div className="detail-row">
                <span className="label">Check-out</span>
                <span className="value">{bookingDetails.endDate}</span>
              </div>
              <div className="detail-row total">
                <span className="label">Total Paid</span>
                <span className="value">₹{bookingDetails.totalPrice?.toLocaleString()}</span>
              </div>
            </motion.div>
          )}

          {/* Redirect Message */}
          <motion.div
            className="redirect-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="countdown-circle">
              <motion.svg width="50" height="50" viewBox="0 0 50 50">
                <motion.circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="#F8395A"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - countdown / redirectCountdown)}`}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </motion.svg>
              <span className="countdown-number">{countdown}</span>
            </div>
            <p>Redirecting to your bookings...</p>
          </motion.div>

          {/* Action Button */}
          <motion.button
            className="view-bookings-btn"
            onClick={onClose}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View My Bookings Now
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;
