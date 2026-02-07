import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaCheck, FaTimes, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import './Register.css';

function Register({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setFieldError('');
    
    if (name === 'password') {
      setPasswordErrors(validatePassword(value));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldError('');
    setLoading(true);

    const { name, email, password, confirmPassword } = formData;

    console.log('📝 Register attempt:', { name, email });

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      setFieldError('name');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setFieldError('email');
      setLoading(false);
      return;
    }

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError('Password does not meet requirements');
      setFieldError('password');
      setPasswordErrors(errors);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setFieldError('confirmPassword');
      setLoading(false);
      return;
    }

    try {
      console.log('📡 Sending registration request');
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Registration successful');
        setSuccess('Registration successful! Please check your email to verify your account.');
        
        // Store tokens
        if (data.accessToken && data.refreshToken) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          
          setIsLoggedIn(true);
          
          setTimeout(() => {
            navigate('/Destination');
          }, 2500);
        }
      } else {
        console.error('❌ Registration failed:', data.message);
        
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join(', '));
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
        
        setFieldError(data.field || '');
      }
    } catch (err) {
      console.error('💥 Registration error:', err);
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join Yoliday and start exploring!</p>
        
        {error && (
          <div className="error-message">
            <FaTimes /> {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <FaCheck /> {success}
          </div>
        )}

        <form onSubmit={handleRegister} className="register-form">
          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading || success}
                className={fieldError === 'name' ? 'input-error' : ''}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading || success}
                className={fieldError === 'email' ? 'input-error' : ''}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setShowPasswordHints(true)}
                required
                disabled={loading || success}
                className={fieldError === 'password' ? 'input-error' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading || success}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>
          
          {/* Password Hints */}
          {showPasswordHints && !success && (
            <div className="password-hints">
              <div className="hints-title">Password Requirements:</div>
              {[
                { text: 'At least 8 characters', valid: formData.password.length >= 8 },
                { text: 'One uppercase letter', valid: /[A-Z]/.test(formData.password) },
                { text: 'One lowercase letter', valid: /[a-z]/.test(formData.password) },
                { text: 'One number', valid: /\d/.test(formData.password) },
                { text: 'One special character (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
              ].map((req, index) => (
                <div key={index} className={`hint-item ${req.valid ? 'valid' : ''}`}>
                  {req.valid ? <FaCheck size={12} /> : <FaTimes size={12} />}
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading || success}
                className={fieldError === 'confirmPassword' ? 'input-error' : ''}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                disabled={loading || success}
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading || success}
          >
            {loading ? 'Creating Account...' : success ? 'Success!' : 'Create Account'}
          </button>
          
          <div className="form-footer">
            <span>Already have an account?</span>
            <Link to="/Login" className="link-btn">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;