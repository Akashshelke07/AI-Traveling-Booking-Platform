import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3>Yoliday</h3>
          <p>Your journey begins with us.</p>
        </div>
        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/Destination" className="footer-link">Destinations</Link>
          <Link to="/Booking" className="footer-link">Booking</Link>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Yoliday. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
