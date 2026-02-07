import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiCalendar, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import { MdOutlineCancel, MdCheckCircle, MdPending, MdFlightTakeoff } from 'react-icons/md';
import './Profile.css';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        // First, try to load from localStorage for immediate display
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        const token = localStorage.getItem('accessToken');
        
        if (!token || !storedUser) {
            navigate('/Login');
            return;
        }
        
        // Set user from localStorage immediately
        setUser({
            name: storedUser.name,
            email: storedUser.email,
            phone: storedUser.phone || '',
            memberSince: storedUser.createdAt
        });
        setEditForm({
            name: storedUser.name || '',
            email: storedUser.email || '',
            phone: storedUser.phone || ''
        });
        setLoading(false);
        
        // Then try to fetch fresh data from API
        fetchProfile();
        fetchBookings();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/Login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/auth/profile', {
                headers: getAuthHeaders()
            });
            
            if (response.status === 401) {
                // Token expired or invalid
                navigate('/Login');
                return;
            }

            const data = await response.json();
            
            if (data.success) {
                setUser(data.user);
                setEditForm({
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || ''
                });
            } else {
                // Use localStorage user as fallback
                const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
                if (storedUser) {
                    setUser({
                        name: storedUser.name,
                        email: storedUser.email,
                        phone: '',
                        memberSince: storedUser.createdAt
                    });
                    setEditForm({
                        name: storedUser.name || '',
                        email: storedUser.email || '',
                        phone: ''
                    });
                    setMessage({ type: 'error', text: 'Could not load full profile. Please restart the backend server.' });
                } else {
                    navigate('/Login');
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Use localStorage user as fallback
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (storedUser) {
                setUser({
                    name: storedUser.name,
                    email: storedUser.email,
                    phone: '',
                    memberSince: storedUser.createdAt
                });
                setEditForm({
                    name: storedUser.name || '',
                    email: storedUser.email || '',
                    phone: ''
                });
                setMessage({ type: 'error', text: 'Backend server not responding. Please restart: npm start in /backend' });
            } else {
                navigate('/Login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/booking/getBookings', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            
            if (data.success) {
                setBookings(data.bookings || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(editForm)
            });
            const data = await response.json();
            
            if (data.success) {
                setUser(data.user);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                
                // Update localStorage user
                const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...storedUser,
                    name: data.user.name,
                    email: data.user.email
                }));
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/booking/bookings/${bookingId}/cancel`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            const data = await response.json();
            
            if (data.success) {
                setMessage({ type: 'success', text: 'Booking cancelled successfully!' });
                fetchBookings(); // Refresh bookings
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to cancel booking' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Server error. Please try again.' });
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <MdCheckCircle className="status-icon confirmed" />;
            case 'pending': return <MdPending className="status-icon pending" />;
            case 'cancelled': return <MdOutlineCancel className="status-icon cancelled" />;
            case 'completed': return <MdFlightTakeoff className="status-icon completed" />;
            default: return null;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                {/* Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="profile-title-section">
                        <h1>My Profile</h1>
                        <p>Manage your account and view your bookings</p>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                        <button onClick={() => setMessage({ type: '', text: '' })} className="close-btn">
                            <FiX />
                        </button>
                    </div>
                )}

                {/* Profile Info Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2><FiUser /> Personal Information</h2>
                        {!isEditing ? (
                            <button className="edit-btn" onClick={() => setIsEditing(true)}>
                                <FiEdit2 /> Edit
                            </button>
                        ) : (
                            <div className="edit-actions">
                                <button className="save-btn" onClick={handleSaveProfile} disabled={savingProfile}>
                                    <FiSave /> {savingProfile ? 'Saving...' : 'Save'}
                                </button>
                                <button className="cancel-btn" onClick={() => {
                                    setIsEditing(false);
                                    setEditForm({
                                        name: user?.name || '',
                                        email: user?.email || '',
                                        phone: user?.phone || ''
                                    });
                                }}>
                                    <FiX /> Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        {isEditing ? (
                            <div className="edit-form">
                                <div className="form-group">
                                    <label><FiUser /> Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Your name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FiMail /> Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        placeholder="Your email"
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FiPhone /> Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                        placeholder="Your phone number"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="info-grid">
                                <div className="info-item">
                                    <div className="info-icon"><FiUser /></div>
                                    <div className="info-content">
                                        <span className="info-label">Full Name</span>
                                        <span className="info-value">{user?.name || 'Not set'}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><FiMail /></div>
                                    <div className="info-content">
                                        <span className="info-label">Email Address</span>
                                        <span className="info-value">{user?.email || 'Not set'}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><FiPhone /></div>
                                    <div className="info-content">
                                        <span className="info-label">Phone Number</span>
                                        <span className="info-value">{user?.phone || 'Not set'}</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-icon"><FiCalendar /></div>
                                    <div className="info-content">
                                        <span className="info-label">Member Since</span>
                                        <span className="info-value">
                                            {user?.memberSince ? formatDate(user.memberSince) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bookings Card */}
                <div className="profile-card bookings-card">
                    <div className="card-header">
                        <h2><MdFlightTakeoff /> My Bookings</h2>
                        <span className="booking-count">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
                    </div>

                    {bookings.length === 0 ? (
                        <div className="no-bookings">
                            <MdFlightTakeoff className="no-bookings-icon" />
                            <h3>No bookings yet</h3>
                            <p>Start exploring destinations and book your first trip!</p>
                            <button className="explore-btn" onClick={() => navigate('/destination')}>
                                Explore Destinations
                            </button>
                        </div>
                    ) : (
                        <div className="bookings-list">
                            {bookings.map((booking) => (
                                <div key={booking._id} className={`booking-item ${booking.status}`}>
                                    <div className="booking-main">
                                        <div className="booking-destination">
                                            <FiMapPin className="dest-icon" />
                                            <div>
                                                <h4>{booking.destination}</h4>
                                                <span className="booking-date">
                                                    Booked on {formatDate(booking.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="booking-status">
                                            {getStatusIcon(booking.status)}
                                            <span className={`status-text ${booking.status}`}>
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="booking-details">
                                        <div className="detail-item">
                                            <FiClock />
                                            <span>{booking.days} day{booking.days !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="detail-item">
                                            <FiDollarSign />
                                            <span>₹{booking.totalCost?.toLocaleString() || (booking.price * booking.days).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {(booking.status === 'confirmed' || booking.status === 'pending') && (
                                        <div className="booking-actions">
                                            <button 
                                                className="cancel-booking-btn"
                                                onClick={() => handleCancelBooking(booking._id)}
                                            >
                                                <MdOutlineCancel /> Cancel Booking
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
