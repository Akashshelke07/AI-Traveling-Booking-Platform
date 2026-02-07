import React, { useState } from 'react';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setAttemptsLeft(null);
    setLoading(true);

    console.log('🔍 Login attempt:', { email, rememberMe });

    try {
      console.log('📡 Sending request to: http://localhost:5000/api/auth/login');
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Response data:', {
        success: data.success,
        message: data.message,
        hasToken: !!data.accessToken
      });

      if (data.success) {
        console.log('✅ Login successful');
        
        // Clear old tokens
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Store new tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // Store user info
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        console.log('✅ Tokens saved successfully');
        
        setIsLoggedIn(true);
        navigate('/Destination');
        
      } else {
        console.error('❌ Login failed:', data.message);
        
        // Handle specific error codes
        if (data.code === 'NO_TOKEN' || data.code === 'INVALID_TOKEN') {
          setError('Authentication failed. Please try again.');
        } else if (data.attemptsLeft !== undefined) {
          setError(data.message);
          setAttemptsLeft(data.attemptsLeft);
        } else if (data.locked) {
          setError(data.message);
        } else {
          setError(data.message || 'Login failed. Please check your credentials.');
        }
        
        setFieldError(data.field || '');
      }
      
    } catch (err) {
      console.error('💥 Login error:', err);
      
      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please ensure the backend is running.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      {showForgotPassword ? (
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      ) : (
        <div className="login-card">
          <form onSubmit={handleLogin}>
            <h2 className="login-title">Welcome Back</h2>
            
            {error && (
              <div 
                className="error-message" 
                style={{ 
                  color: 'red', 
                  padding: '10px', 
                  marginBottom: '10px', 
                  border: '1px solid red', 
                  borderRadius: '4px',
                  backgroundColor: '#fee'
                }}
              >
                {error}
                {attemptsLeft !== null && attemptsLeft > 0 && (
                  <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                    ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                  </div>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                className={`form-input ${fieldError === 'email' || fieldError === 'credentials' ? 'input-error' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setFieldError('');
                }}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-input ${fieldError === 'password' || fieldError === 'credentials' ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setFieldError('');
                  }}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                Remember me for 30 days
              </label>
            </div>

            <input
              type="submit"
              value={loading ? "Signing In..." : "Sign In"}
              className="submit-btn"
              disabled={loading}
            />

            <div className="form-footer">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="link-btn"
                disabled={loading}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => navigate('/Register')}
                className="link-btn"
                style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}
                disabled={loading}
              >
                Don't have an account? <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Register Now</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;