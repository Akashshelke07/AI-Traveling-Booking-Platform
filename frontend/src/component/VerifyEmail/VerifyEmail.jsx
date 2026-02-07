import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../ForgotPassword/ForgotPassword.css';

function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      console.log('📧 Email verification started');
      
      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify-email/${token}`, {
          method: 'GET',
        });

        const data = await response.json();
        console.log('📥 Verification response:', data);

        if (data.success) {
          console.log('✅ Email verified successfully');
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Update user data in localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.isEmailVerified = true;
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          // Redirect to destination page after 3 seconds
          setTimeout(() => {
            navigate('/Destination');
          }, 3000);
        } else {
          console.error('❌ Email verification failed:', data.message);
          setStatus('error');
          setMessage(data.message || 'Verification failed. The link may be invalid or expired.');
        }
      } catch (error) {
        console.error('💥 Email verification error:', error);
        setStatus('error');
        setMessage('Could not verify email. Please try again later.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [token, navigate]);

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Email Verification</h2>
        
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div className="spinner">⏳</div>
            <p>Verifying your email address...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="success-message">
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
              <strong>{message}</strong>
            </div>
            <p style={{ textAlign: 'center', color: '#666', marginTop: '15px' }}>
              Redirecting you to the dashboard in 3 seconds...
            </p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => navigate('/Destination')}
                className="submit-btn"
              >
                Go to Dashboard Now
              </button>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="error-message">
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>❌</div>
              <strong>{message}</strong>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                You can try logging in again to request a new verification email.
              </p>
              <button 
                onClick={() => navigate('/Login')}
                style={{
                  padding: '10px 30px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  marginRight: '10px'
                }}
              >
                Go to Login
              </button>
              <button 
                onClick={() => navigate('/')}
                style={{
                  padding: '10px 30px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;