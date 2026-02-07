import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import '../ForgotPassword/ForgotPassword.css'; // Reuse same styles

function ResetPassword({ setIsLoggedIn }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  
  // Token verification states
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (pass) => {
    const errors = [];
    if (pass.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pass)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pass)) errors.push('One lowercase letter');
    if (!/\d/.test(pass)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) errors.push('One special character');
    return errors;
  };

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        console.log('🔍 Verifying reset token...');
        const response = await fetch(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
        const data = await response.json();
        
        if (data.success) {
          console.log('✅ Token is valid');
          setTokenValid(true);
        } else {
          console.log('❌ Token is invalid:', data.message);
          setTokenError(data.message || 'Invalid or expired reset token');
          setTokenValid(false);
        }
      } catch (err) {
        console.error('💥 Token verification error:', err);
        setTokenError('Cannot connect to server. Please try again later.');
        setTokenValid(false);
      } finally {
        setVerifyingToken(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setTokenError('No reset token provided');
      setVerifyingToken(false);
    }
  }, [token]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordErrors(validatePassword(newPassword));
    setError('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('🔐 Reset password attempt');

    // Validation
    if (!password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError('Password does not meet requirements');
      setPasswordErrors(errors);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Sending reset request');
      
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Password reset successful');
        setSuccess('Password reset successfully! Redirecting...');
        
        // Store new tokens if provided (auto-login)
        if (data.accessToken && data.refreshToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          setIsLoggedIn(true);
          
          setTimeout(() => {
            navigate('/Destination');
          }, 2000);
        } else {
          setTimeout(() => {
            navigate('/Login');
          }, 2000);
        }
      } else {
        console.error('❌ Password reset failed:', data.message);
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error('💥 Reset password error:', err);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while verifying token
  if (verifyingToken) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h2>Reset Your Password</h2>
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ fontSize: '1.1rem', color: '#666' }}>
              Verifying your reset link...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <h2>Reset Your Password</h2>
          <div 
            style={{ 
              color: 'red', 
              padding: '15px', 
              marginBottom: '15px', 
              border: '1px solid red', 
              borderRadius: '4px',
              backgroundColor: '#fee',
              textAlign: 'center'
            }}
          >
            ❌ {tokenError}
          </div>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
            The password reset link is invalid or has expired. Please request a new one.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link 
              to="/Login" 
              state={{ showForgotPassword: true }}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: '500'
              }}
            >
              Request New Reset Link
            </Link>
            <button 
              onClick={() => navigate('/Login')} 
              className="cancel-button"
              style={{ marginTop: '5px' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show the reset form if token is valid
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Your Password</h2>
        <p className="forgot-password-description">
          Enter your new password below. Make sure it's strong and secure!
        </p>
        
        {error && (
          <div 
            className="error-message" 
            style={{ 
              color: 'red', 
              padding: '10px', 
              marginBottom: '15px', 
              border: '1px solid red', 
              borderRadius: '4px',
              backgroundColor: '#fee'
            }}
          >
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div 
            className="success-message" 
            style={{ 
              color: 'green', 
              padding: '10px', 
              marginBottom: '15px', 
              border: '1px solid green', 
              borderRadius: '4px',
              backgroundColor: '#efe'
            }}
          >
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <label htmlFor="password">New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setShowPasswordHints(true)}
              required
              disabled={loading || success}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
              disabled={loading || success}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          
          {showPasswordHints && !success && (
            <div style={{ 
              marginTop: '10px', 
              marginBottom: '15px',
              padding: '10px', 
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '0.85rem'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>Password Requirements:</div>
              {[
                { text: 'At least 8 characters', valid: password.length >= 8 },
                { text: 'One uppercase letter', valid: /[A-Z]/.test(password) },
                { text: 'One lowercase letter', valid: /[a-z]/.test(password) },
                { text: 'One number', valid: /\d/.test(password) },
                { text: 'One special character (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
              ].map((req, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: req.valid ? 'green' : '#666',
                  marginBottom: '3px'
                }}>
                  {req.valid ? <FaCheck size={12} /> : <FaTimes size={12} />}
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          )}

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              required
              disabled={loading || success}
              style={{ paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
              disabled={loading || success}
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <input 
            type="submit" 
            value={loading ? "Resetting..." : success ? "Success!" : "Reset Password"} 
            disabled={loading || success}
          />
          
          {!success && (
            <button 
              type="button" 
              onClick={() => navigate('/Login')} 
              className="cancel-button"
              disabled={loading}
            >
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
