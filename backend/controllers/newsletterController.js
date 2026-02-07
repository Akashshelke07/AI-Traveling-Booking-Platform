const Newsletter = require('../models/newsletterModel');
const sendEmail = require('../utils/sendEmail');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if already subscribed
        const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });
        
        if (existingSubscriber) {
            if (existingSubscriber.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already subscribed to our newsletter'
                });
            } else {
                // Reactivate subscription
                existingSubscriber.isActive = true;
                existingSubscriber.subscribedAt = Date.now();
                await existingSubscriber.save();

                // Send welcome back email
                await sendWelcomeEmail(email, true);

                return res.status(200).json({
                    success: true,
                    message: 'Welcome back! Your subscription has been reactivated'
                });
            }
        }

        // Create new subscriber
        const subscriber = await Newsletter.create({
            email: email.toLowerCase(),
            source: 'homepage'
        });

        // Send welcome email
        await sendWelcomeEmail(email, false);

        res.status(201).json({
            success: true,
            message: 'Thank you for subscribing! Check your email for confirmation.',
            data: {
                email: subscriber.email,
                subscribedAt: subscriber.subscribedAt
            }
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed to our newsletter'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to subscribe. Please try again later.'
        });
    }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Email not found in our newsletter list'
            });
        }

        subscriber.isActive = false;
        await subscriber.save();

        res.status(200).json({
            success: true,
            message: 'You have been successfully unsubscribed from our newsletter'
        });

    } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsubscribe. Please try again later.'
        });
    }
};

// Helper function to send welcome email
const sendWelcomeEmail = async (email, isReactivation) => {
    try {
        const subject = isReactivation 
            ? 'Welcome Back to Yoliday Newsletter! 🎉'
            : 'Welcome to Yoliday Newsletter! ✈️';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800;">Yoliday</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Gateway to Amazing Adventures</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 30px;">
                        <h2 style="color: #0f172a; margin: 0 0 20px 0; font-size: 24px;">
                            ${isReactivation ? 'Welcome Back! 🎉' : 'Thanks for Subscribing! ✈️'}
                        </h2>
                        
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            ${isReactivation 
                                ? 'Great to have you back! We\'ve reactivated your newsletter subscription.'
                                : 'Thank you for joining the Yoliday newsletter! You\'re now part of our travel community.'}
                        </p>
                        
                        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                            Here's what you can expect from us:
                        </p>
                        
                        <ul style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                            <li>🌍 Exclusive travel deals and discounts</li>
                            <li>📍 New destination recommendations</li>
                            <li>💡 Travel tips and insider guides</li>
                            <li>🎁 Special offers just for subscribers</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://yoliday-travel-booking.vercel.app/Destination" 
                               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                                Explore Destinations
                            </a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0;">
                            © ${new Date().getFullYear()} Yoliday. All rights reserved.
                        </p>
                        <p style="color: #64748b; font-size: 12px; margin: 0;">
                            You received this email because you subscribed to our newsletter.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail({
            to: email,
            subject,
            html
        });

        console.log(`✅ Newsletter welcome email sent to ${email}`);
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't throw - subscription should still succeed even if email fails
    }
};
