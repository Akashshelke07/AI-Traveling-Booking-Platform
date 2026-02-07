const express = require('express');
const { 
    register, 
    login, 
    logout,
    verifyEmail,
    refreshAccessToken,
    forgotPassword, 
    verifyResetToken,
    resetPassword,
    changePassword,
    getProfile,
    updateProfile
} = require('../controllers/authController');
const { protect, rateLimitByUser } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.post('/logout', protect, logout);
router.post('/change-password', protect, rateLimitByUser(3, 60 * 60 * 1000), changePassword);

// Profile routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;