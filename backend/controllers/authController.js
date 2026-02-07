const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// Token generation with access and refresh tokens
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: '15m' // Short-lived access token
    });
};

const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { 
        expiresIn: '7d' // Longer-lived refresh token
    });
};

// Password validation
const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters`);
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');
    
    return { isValid: errors.length === 0, errors };
};

// Email validation
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// REGISTRATION
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        console.log('📝 Registration attempt:', { name, email });
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required',
                field: !name ? 'name' : !email ? 'email' : 'password'
            });
        }

        // Name validation
        if (name.trim().length < 2 || name.trim().length > 50) {
            return res.status(400).json({ 
                success: false,
                message: 'Name must be between 2 and 50 characters',
                field: 'name'
            });
        }

        // Email validation
        if (!validateEmail(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide a valid email address',
                field: 'email'
            });
        }

        // Password validation
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false,
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors,
                field: 'password'
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(409).json({ 
                success: false,
                message: 'An account with this email already exists',
                field: 'email'
            });
        }

        // Generate email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        // Create user
        const user = await User.create({ 
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            emailVerificationToken: crypto.createHash('sha256').update(emailVerificationToken).digest('hex'),
            emailVerificationExpire,
            isEmailVerified: false
        });

        console.log('✅ User created:', user.email);

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
        
        try {
            await sendEmail({
                to: user.email,
                subject: '✉️ Verify Your Email - Yoliday',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4CAF50;">Welcome to Yoliday, ${user.name}! 🎉</h2>
                        <p>Thank you for registering. Please verify your email address to activate your account.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" 
                               style="background-color: #4CAF50; color: white; padding: 15px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verify Email
                            </a>
                        </div>
                        <p style="color: #666;">Or copy this link: ${verificationUrl}</p>
                        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
                    </div>
                `
            });
            console.log('✅ Verification email sent');
        } catch (emailError) {
            console.error('❌ Failed to send verification email:', emailError);
            // Don't block registration if email fails
        }

        // Generate tokens
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Save refresh token to user (hashed)
        user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await user.save();

        res.status(201).json({ 
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('💥 Registration Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration. Please try again.'
        });
    }
};

// EMAIL VERIFICATION
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        console.log('📧 Email verification attempt');
        
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired verification link'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        console.log('✅ Email verified for:', user.email);

        res.status(200).json({ 
            success: true,
            message: 'Email verified successfully! You can now use all features.'
        });
    } catch (error) {
        console.error('💥 Email Verification Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during email verification'
        });
    }
};

// LOGIN with rate limiting tracking
const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        
        console.log('🔑 Login attempt:', { email, rememberMe });
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required',
                field: !email ? 'email' : 'password'
            });
        }

        // Find user and include password for verification
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password +loginAttempts +lockUntil');
        
        if (!user) {
            // Don't reveal that user doesn't exist
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password',
                field: 'credentials'
            });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({ 
                success: false,
                message: `Account temporarily locked. Please try again in ${remainingTime} minutes.`,
                lockUntil: user.lockUntil
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            // Increment failed login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            
            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
                await user.save();
                
                console.error('❌ Account locked due to multiple failed attempts:', user.email);
                
                return res.status(423).json({ 
                    success: false,
                    message: 'Account locked due to multiple failed login attempts. Please try again in 30 minutes or reset your password.',
                    locked: true
                });
            }
            
            await user.save();
            
            const attemptsLeft = 5 - user.loginAttempts;
            return res.status(401).json({ 
                success: false,
                message: `Invalid email or password. ${attemptsLeft} attempts remaining.`,
                attemptsLeft,
                field: 'credentials'
            });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        // Update last login
        user.lastLogin = Date.now();

        // Generate tokens with different expiry based on rememberMe
        const accessToken = generateAccessToken(user._id);
        const refreshToken = rememberMe 
            ? jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
            : generateRefreshToken(user._id);

        // Save refresh token (hashed)
        user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await user.save();

        console.log('✅ Login successful:', user.email);

        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('💥 Login Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login'
        });
    }
};

// REFRESH TOKEN
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                success: false,
                message: 'Refresh token required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        // Hash and find user
        const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const user = await User.findOne({ 
            _id: decoded.id,
            refreshToken: hashedToken
        });

        if (!user) {
            return res.status(403).json({ 
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id);

        res.status(200).json({ 
            success: true,
            accessToken: newAccessToken
        });
    } catch (error) {
        console.error('💥 Refresh Token Error:', error);
        res.status(403).json({ 
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

// LOGOUT
const logout = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (user) {
            // Clear refresh token
            user.refreshToken = undefined;
            await user.save();
            console.log('✅ User logged out:', user.email);
        }

        res.status(200).json({ 
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('💥 Logout Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during logout'
        });
    }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        console.log('🔐 Forgot password request for:', email);
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required',
                field: 'email'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        
        // For security, always return success even if user doesn't exist
        if (!user) {
            return res.status(200).json({ 
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Check if too many reset requests (rate limiting)
        if (user.resetPasswordRequestedAt && 
            (Date.now() - user.resetPasswordRequestedAt.getTime()) < 5 * 60 * 1000) {
            return res.status(429).json({ 
                success: false,
                message: 'Please wait 5 minutes before requesting another password reset.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Save hashed token and expiry
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        user.resetPasswordRequestedAt = Date.now();
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: '🔐 Password Reset Request - Yoliday',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Password Reset Request</h2>
                        <p>Hello <strong>${user.name}</strong>,</p>
                        <p>You requested a password reset. Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background-color: #4CAF50; color: white; padding: 15px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #666;">Or copy this link: ${resetUrl}</p>
                        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
                        <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
                    </div>
                `
            });

            console.log('✅ Password reset email sent to:', user.email);

            res.status(200).json({ 
                success: true,
                message: 'Password reset link has been sent to your email.'
            });
        } catch (emailError) {
            console.error('❌ Failed to send reset email:', emailError);
            
            // Clear reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            user.resetPasswordRequestedAt = undefined;
            await user.save();
            
            res.status(500).json({ 
                success: false,
                message: 'Failed to send reset email. Please try again.'
            });
        }
    } catch (error) {
        console.error('💥 Forgot Password Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error. Please try again.'
        });
    }
};

// VERIFY RESET TOKEN (check if token is valid before showing form)
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        console.log('🔍 Verifying reset token');
        
        if (!token) {
            return res.status(400).json({ 
                success: false,
                message: 'Reset token is required'
            });
        }

        // Hash token and find user
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            console.log('❌ Invalid or expired reset token');
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset link.'
            });
        }

        console.log('✅ Reset token is valid');
        res.status(200).json({ 
            success: true,
            message: 'Token is valid'
        });
    } catch (error) {
        console.error('💥 Verify Reset Token Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during token verification'
        });
    }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        console.log('🔐 Password reset attempt');

        if (!password) {
            return res.status(400).json({ 
                success: false,
                message: 'Password is required',
                field: 'password'
            });
        }

        // Validate new password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false,
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors,
                field: 'password'
            });
        }

        // Hash token and find user
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpire +resetPasswordRequestedAt');

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset link.'
            });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.resetPasswordRequestedAt = undefined;
        
        // Invalidate all existing sessions
        user.refreshToken = undefined;
        
        await user.save();

        console.log('✅ Password reset successful for:', user.email);

        // Send confirmation email
        try {
            await sendEmail({
                to: user.email,
                subject: '✅ Password Changed Successfully - Yoliday',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4CAF50;">Password Changed</h2>
                        <p>Hello <strong>${user.name}</strong>,</p>
                        <p>Your password has been changed successfully.</p>
                        <p>If you didn't make this change, please contact support immediately.</p>
                        <p style="color: #999; font-size: 12px; margin-top: 30px;">
                            Best regards,<br><strong>Yoliday Team</strong>
                        </p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError);
        }

        // Generate new tokens for auto-login
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        
        user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
        await user.save();

        res.status(200).json({ 
            success: true,
            message: 'Password reset successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('💥 Reset Password Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during password reset'
        });
    }
};

// CHANGE PASSWORD (for logged-in users)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Current and new passwords are required'
            });
        }

        const user = await User.findById(req.user._id).select('+password');
        
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ 
                success: false,
                message: 'Current password is incorrect',
                field: 'currentPassword'
            });
        }

        // Validate new password
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false,
                message: 'New password does not meet requirements',
                errors: passwordValidation.errors,
                field: 'newPassword'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        console.log('✅ Password changed for:', user.email);

        res.status(200).json({ 
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('💥 Change Password Error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while changing password'
        });
    }
};

// GET USER PROFILE
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('name email phone isEmailVerified createdAt lastLogin');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                isEmailVerified: user.isEmailVerified,
                memberSince: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// UPDATE USER PROFILE
const updateProfile = async (req, res) => {
    try {
        const { email, phone, name } = req.body;
        const userId = req.user._id;

        // Get current user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use by another account'
                });
            }
            user.email = email.toLowerCase();
            user.isEmailVerified = false; // Require re-verification for new email
        }

        // Update phone if provided
        if (phone !== undefined) {
            user.phone = phone;
        }

        // Update name if provided
        if (name && name.trim().length >= 2) {
            user.name = name.trim();
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { 
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
};