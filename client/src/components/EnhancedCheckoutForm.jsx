import { useState, useRef } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import ReCAPTCHA from "react-google-recaptcha";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  CreditCard, 
  CheckCircle, 
  Error as ErrorIcon,
  Shield
} from "@mui/icons-material";
import { toast } from 'react-toastify';
import "../styles/EnhancedCheckout.scss";

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Test key

const EnhancedCheckoutForm = ({ handleBooking, monthCount, totalPrice, termsAgreed }) => {
  const stripe = useStripe();
  const elements = useElements();
  const recaptchaRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [error, setError] = useState("");
  const [cardComplete, setCardComplete] = useState(false);

  const handleCaptchaChange = (value) => {
    if (value) {
      setCaptchaVerified(true);
      setError("");
    } else {
      setCaptchaVerified(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    if (event.error) {
      setError(event.error.message);
    } else {
      setError("");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    // Validation
    if (!captchaVerified) {
      setError("Please verify that you are not a robot");
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }

    if (!cardComplete) {
      setError("Please enter complete card details");
      return;
    }

    if (!stripe || !elements) {
      setError("Payment system not ready. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cardElement = elements.getElement(CardElement);

      // Create token
      const { error, token } = await stripe.createToken(cardElement);

      if (error) {
        setError(error.message);
        toast.error(error.message);
        setLoading(false);
        
        // Reset reCAPTCHA on error
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
          setCaptchaVerified(false);
        }
      } else {
        // Pass token to parent component
        await handleBooking(token);
        // Loading will be handled by parent
      }
    } catch (err) {
      setError("Payment processing failed. Please try again.");
      toast.error("Payment processing failed");
      setLoading(false);
      
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaVerified(false);
      }
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#24355A',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '::placeholder': {
          color: '#969393',
        },
        padding: '12px',
      },
      invalid: {
        color: '#EF4444',
        iconColor: '#EF4444',
      },
    },
    hidePostalCode: true,
  };

  const isButtonDisabled = !stripe || monthCount < 1 || !captchaVerified || !cardComplete || !termsAgreed || loading;

  return (
    <form onSubmit={handlePayment} className="enhanced-checkout-form">
      {/* Security Badge */}
      <div className="security-badge">
        <Lock />
        <span>Secure payment powered by Stripe</span>
      </div>

      {/* Card Input Section */}
      <div className="payment-section">
        <label className="payment-label">
          <CreditCard />
          <span>Card Information</span>
        </label>
        <div className={`card-element-wrapper ${error ? 'error' : ''} ${cardComplete ? 'complete' : ''}`}>
          <CardElement 
            options={cardElementOptions} 
            onChange={handleCardChange}
          />
        </div>
      </div>

      {/* reCAPTCHA */}
      <div className="recaptcha-section">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleCaptchaChange}
          theme="light"
          size="normal"
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ErrorIcon />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Summary */}
      <div className="payment-summary">
        <div className="summary-row">
          <span>Total Amount</span>
          <span className="amount">₹{totalPrice?.toLocaleString()}</span>
        </div>
        <div className="summary-info">
          <Shield />
          <span>Protected by Stripe's secure payment system</span>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        className="pay-button"
        disabled={isButtonDisabled}
        whileHover={!isButtonDisabled ? { scale: 1.02 } : {}}
        whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="button-loading">
            <div className="spinner"></div>
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="button-content">
            <Lock />
            <span>Pay ₹{totalPrice?.toLocaleString()}</span>
            {captchaVerified && cardComplete && <CheckCircle className="check-icon" />}
          </div>
        )}
      </motion.button>

      {/* Trust Indicators */}
      <div className="trust-indicators">
        <div className="indicator">
          <CheckCircle />
          <span>Secure payment</span>
        </div>
        <div className="indicator">
          <CheckCircle />
          <span>256-bit encryption</span>
        </div>
        <div className="indicator">
          <CheckCircle />
          <span>PCI DSS compliant</span>
        </div>
      </div>
    </form>
  );
};

export default EnhancedCheckoutForm;
