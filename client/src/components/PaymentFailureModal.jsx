import { motion, AnimatePresence } from "framer-motion";
import { 
  ErrorOutline, 
  Close, 
  Refresh, 
  ContactSupport,
  ArrowBack
} from "@mui/icons-material";
import "../styles/PaymentFailureModal.scss";

const PaymentFailureModal = ({ isOpen, onClose, onRetry, error }) => {
  if (!isOpen) return null;

  const getErrorMessage = (errorMsg) => {
    // Customize error messages based on common errors
    const errorLower = errorMsg?.toLowerCase() || '';
    
    if (errorLower.includes('card')) {
      return {
        title: 'Card Payment Failed',
        message: 'There was an issue processing your card. Please check your card details and try again.',
        suggestions: [
          'Verify your card number is correct',
          'Check if your card has sufficient funds',
          'Ensure your card is not expired',
          'Try a different card'
        ]
      };
    } else if (errorLower.includes('network') || errorLower.includes('connection')) {
      return {
        title: 'Connection Error',
        message: 'We couldn\'t connect to the payment server. Please check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Try again in a few moments',
          'Use a different network if available'
        ]
      };
    } else if (errorLower.includes('declined')) {
      return {
        title: 'Payment Declined',
        message: 'Your payment was declined by your bank. Please contact your bank or try another payment method.',
        suggestions: [
          'Contact your bank for more details',
          'Check if your card is activated for online payments',
          'Try using a different card'
        ]
      };
    } else {
      return {
        title: 'Payment Failed',
        message: errorMsg || 'An unexpected error occurred during payment processing.',
        suggestions: [
          'Check your payment details',
          'Try again in a few moments',
          'Contact support if the issue persists'
        ]
      };
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <AnimatePresence>
      <motion.div
        className="payment-failure-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="payment-failure-modal"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button className="close-btn" onClick={onClose}>
            <Close />
          </button>

          {/* Error Icon with Animation */}
          <motion.div
            className="error-icon-wrapper"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="error-icon"
              animate={{ 
                rotate: [-10, 10, -10, 10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <ErrorOutline />
            </motion.div>
          </motion.div>

          {/* Error Message */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {errorInfo.title}
          </motion.h2>

          <motion.p
            className="error-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {errorInfo.message}
          </motion.p>

          {/* Suggestions */}
          <motion.div
            className="suggestions-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h4>What you can do:</h4>
            <ul>
              {errorInfo.suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <span className="bullet">•</span>
                  <span>{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="action-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <motion.button
              className="retry-btn"
              onClick={() => {
                onClose();
                if (onRetry) onRetry();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Refresh />
              <span>Try Again</span>
            </motion.button>

            <motion.button
              className="back-btn"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowBack />
              <span>Go Back</span>
            </motion.button>
          </motion.div>

          {/* Support Link */}
          <motion.div
            className="support-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <ContactSupport />
            <p>
              Need help? <a href="/messages">Contact our support team</a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentFailureModal;
