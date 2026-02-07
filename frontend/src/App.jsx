import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './component/Navbar/Navbar.jsx';
import Home from './component/Home/Home.jsx';
import Login from './component/Login/Login.jsx';
import Register from './component/Register/Register.jsx';
import Booking from './component/Booking/Booking.jsx';
import Destination from './component/Destination/Destination.jsx';
import VerifyEmail from './component/VerifyEmail/VerifyEmail.jsx';
import ResetPassword from './component/ResetPassword/ResetPassword.jsx';
import Profile from './component/Profile/Profile.jsx';
import Footer from './component/Footer/Footer.jsx';
import Chatbot from './component/Chatbot/Chatbot.jsx';
import { isAuthenticated } from './utils/authUtils.js';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    console.log('🔍 App mounted - checking authentication...');
    
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      console.log('✅ Authentication check:', authenticated ? 'Logged in' : 'Not logged in');
      setIsLoggedIn(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Log when isLoggedIn state changes
  useEffect(() => {
    console.log('🔄 isLoggedIn state changed to:', isLoggedIn);
  }, [isLoggedIn]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <>
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Destination" element={<Destination />} />
          
          {/* Login Route */}
          <Route 
            path="/Login" 
            element={
              isLoggedIn ? (
                <Navigate to="/Destination" />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            } 
          />
          
          {/* Register Route */}
          <Route 
            path="/Register" 
            element={
              isLoggedIn ? (
                <Navigate to="/Destination" />
              ) : (
                <Register setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          
          {/* Reset Password Route */}
          <Route 
            path="/reset-password/:token" 
            element={<ResetPassword setIsLoggedIn={setIsLoggedIn} />} 
          />
          
          {/* Email Verification Route */}
          <Route 
            path="/verify-email/:token" 
            element={<VerifyEmail setIsLoggedIn={setIsLoggedIn} />} 
          />
          
          {/* Booking Route - Protected */}
          <Route 
            path="/Booking" 
            element={
              isLoggedIn ? (
                <Booking />
              ) : (
                <Navigate to="/Login" />
              )
            } 
          />

          {/* Profile Route - Protected */}
          <Route 
            path="/profile" 
            element={
              isLoggedIn ? (
                <Profile />
              ) : (
                <Navigate to="/Login" />
              )
            } 
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
        <Chatbot />
      </>
    </BrowserRouter>
  );
}

export default App;