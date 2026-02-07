const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    try {
        let token;
        
        // Get token from Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // Check if token exists
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized. Please login to access this resource.',
                code: 'NO_TOKEN'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from token
            const user = await User.findById(decoded.id).select('+passwordChangedAt');
            
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    message: 'User no longer exists. Please login again.',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Your account has been deactivated. Please contact support.',
                    code: 'ACCOUNT_INACTIVE'
                });
            }

            // Check if user changed password after token was issued
            if (user.changedPasswordAfter(decoded.iat)) {
                return res.status(401).json({ 
                    success: false,
                    message: 'Password was recently changed. Please login again.',
                    code: 'PASSWORD_CHANGED'
                });
            }

            // Attach user to request
            req.user = user;
            next();
            
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Your session has expired. Please login again.',
                    code: 'TOKEN_EXPIRED',
                    expiredAt: jwtError.expiredAt
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    success: false,
                    message: 'Invalid token. Please login again.',
                    code: 'INVALID_TOKEN'
                });
            }
            
            throw jwtError;
        }
        
    } catch (error) {
        console.error('💥 Auth Middleware Error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Authentication error. Please try again.',
            code: 'AUTH_ERROR'
        });
    }
};

// Middleware to check if email is verified
const requireEmailVerified = async (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return res.status(403).json({ 
            success: false,
            message: 'Please verify your email address to access this feature.',
            code: 'EMAIL_NOT_VERIFIED',
            email: req.user.email
        });
    }
    next();
};

// Middleware to restrict to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: 'You do not have permission to perform this action.',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        next();
    };
};

// Rate limiting middleware for sensitive operations
const rateLimitByUser = (maxRequests, windowMs) => {
    const userRequests = new Map();
    
    return (req, res, next) => {
        const userId = req.user._id.toString();
        const now = Date.now();
        
        if (!userRequests.has(userId)) {
            userRequests.set(userId, []);
        }
        
        const requests = userRequests.get(userId);
        
        // Remove old requests outside the window
        const recentRequests = requests.filter(time => now - time < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            const oldestRequest = Math.min(...recentRequests);
            const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
            
            return res.status(429).json({ 
                success: false,
                message: `Too many requests. Please try again in ${retryAfter} seconds.`,
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter
            });
        }
        
        recentRequests.push(now);
        userRequests.set(userId, recentRequests);
        
        next();
    };
};

module.exports = { 
    protect, 
    requireEmailVerified,
    restrictTo,
    rateLimitByUser
};