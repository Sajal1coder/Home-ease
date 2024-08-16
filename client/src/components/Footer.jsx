import "../styles/Footer.scss"
import { LocationOn, LocalPhone, Email } from "@mui/icons-material"
const Footer = () => {
  return (
    <div className="footer">
      <div className="footer_left">
        <a href="/"><img src="/assets/logo.png" alt="logo" /></a>
      </div>

      <div className="footer_center">
        <h3>Useful Links</h3>
        <ul>
          <li>About Us</li>
          <li>Terms and Conditions</li>
          <li>Return and Refund Policy</li>
        </ul>
      </div>

      <div className="footer_right">
        <h3>Contact</h3>
        <div className="footer_right_info">
          <LocalPhone />
          <p>+91 6312282345</p>
        </div>
        <div className="footer_right_info">
          <Email />
          <p>homease@support.com</p>
        </div>
        <img src="/assets/payment.png" alt="payment" />
        <div>
          <LocationOn />
          <p>123, Mitali Street, karna road,Mumbai, India -194111</p>
        </div>
      </div>
    </div>
  )
}

export default Footer