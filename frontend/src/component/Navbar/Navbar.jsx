import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { FaBars, FaTimes } from 'react-icons/fa';
import { logout, getCurrentUser, getAccessToken } from '../../utils/authUtils';

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

 const handleLogout = async () => {
  console.log('🔐 Logout initiated');
  
  // Optional: Call backend logout endpoint
  try {
    const token = getAccessToken();
    if (token) {
      // FIX: Use correct URL
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout API error (non-critical):', error);
  }
  
  // Clear all auth data
  logout();
  
  console.log('✅ Logged out successfully - all tokens cleared');
  
  setIsLoggedIn(false);
  setMenuOpen(false);
  
  // Redirect to home page
  navigate('/');
};

  return (
    <nav className="navbar-container">
      {/* Logo */}
      <Link to="/" className="logo-link" onClick={() => setMenuOpen(false)}>
        <span className="logo">Yoliday</span>
      </Link>

      {/* Hamburger Menu */}
      <div className="hamburger-menu" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/Destination" className="nav-link" onClick={() => setMenuOpen(false)}>
            Destination
          </Link>
        </li>
        <li>
          <Link to="/Booking" className="nav-link" onClick={() => setMenuOpen(false)}>
            Booking
          </Link>
        </li>
        
        {!isLoggedIn ? (
          <>
            <li>
              <Link to="/Login" className="nav-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/Register" className="nav-link" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </li>
          </>
        ) : (
          <>
            {user && (
              <li>
                <Link 
                  to="/profile" 
                  className="user-profile-link" 
                  onClick={() => {
                    console.log('🔍 Profile link clicked!');
                    setMenuOpen(false);
                  }}
                >
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name">{user.name}</span>
                </Link>
              </li>
            )}
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;