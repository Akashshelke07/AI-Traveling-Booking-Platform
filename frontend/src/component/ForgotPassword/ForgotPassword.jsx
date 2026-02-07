import React, { useState } from 'react';
import './ForgotPassword.css';

function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldownTime, setCooldownTime] = useState(0);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    console.log('🔍 Forgot password attempt for:', email);

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Sending request to:', 'http://localhost:5000/api/auth/forgot-password');
      
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Password reset request successful');
        setSuccess(data.message || 'Password reset link has been sent to your email.');
        setEmail('');
        
        // Auto-close after 5 seconds
        setTimeout(() => {
          onClose();
        }, 5000);
      } else {
        console.error('❌ Password reset failed:', data.message);
        
        // Handle rate limiting
        if (response.status === 429) {
          setError(data.message || 'Too many requests. Please wait before trying again.');
          // Start cooldown timer if provided
          if (data.retryAfter) {
            setCooldownTime(data.retryAfter);
            const timer = setInterval(() => {
              setCooldownTime(prev => {
                if (prev <= 1) {
                  clearInterval(timer);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } else {
          setError(data.message || 'Failed to send reset link. Please try again.');
        }
      }
    } catch (err) {
      console.error('💥 Forgot password error:', err);
      setError('Cannot connect to server. Please try again later.');
    } finally {
      setLoading(false);
      console.log('🏁 Forgot password attempt finished');
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Reset Your Password</h2>
        <p className="forgot-password-description">
          Enter your registered email address, and we'll send you a link to reset your password.
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
            {cooldownTime > 0 && (
              <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
                ⏳ Retry in {cooldownTime} second{cooldownTime !== 1 ? 's' : ''}
              </div>
            )}
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
            <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
              📧 Please check your email (including spam folder)
            </div>
          </div>
        )}

        <form onSubmit={handleForgotPassword}>
          <label htmlFor="forgot-email">Email Address</label>
          <input
            type="email"
            id="forgot-email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
            disabled={loading || success || cooldownTime > 0}
          />
          <input 
            type="submit" 
            value={
              loading ? "Sending..." : 
              cooldownTime > 0 ? `Wait ${cooldownTime}s` :
              "Send Reset Link"
            } 
            disabled={loading || success || cooldownTime > 0}
          />
          <button 
            type="button" 
            onClick={onClose} 
            className="cancel-button"
            disabled={loading}
          >
            {success ? 'Close' : 'Cancel'}
          </button>
        </form>
        
        {success && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#f0f9ff',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#0369a1'
          }}>
            <strong>Next Steps:</strong>
            <ol style={{ marginTop: '8px', paddingLeft: '20px', marginBottom: 0 }}>
              <li>Check your email inbox</li>
              <li>Click the reset link (expires in 1 hour)</li>
              <li>Create your new password</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;