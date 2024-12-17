import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import "../styles/ListingDetails.scss";
const CheckoutForm = ({ handleBooking, monthCount }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error, token } = await stripe.createToken(cardElement);

    if (error) {
      console.error(error.message);
    } else {
      handleBooking(token);
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <CardElement options={{ hidePostalCode: true }} />
      <button
        type="submit"
        disabled={!stripe || monthCount <= 1} // Disable button if monthCount <= 1
        className={"button"}
      >
        Pay & Book
      </button>
    </form>
  );
};

export default CheckoutForm;
