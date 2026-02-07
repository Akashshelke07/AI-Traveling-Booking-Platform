const Booking = require('../models/bookingModel');
const sendEmail = require('../utils/sendEmail');

/**
 * Create a new booking with duplicate check and confirmation email
 */
const createBooking = async (req, res) => {
    try {
        const {
            fullname,
            contact,
            email,
            destination,
            price,
            days,
            totalCost
        } = req.body;

        const userId = req.user?._id;

        // Check if all required fields are provided
        if (!fullname || !contact || !email || !destination || !price || !days) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required' 
            });
        }

        // Check for duplicate booking (same user + same destination with active status)
        if (userId) {
            const existingBooking = await Booking.findOne({
                user: userId,
                destination: destination,
                status: { $in: ['pending', 'confirmed'] }
            });

            if (existingBooking) {
                return res.status(400).json({
                    success: false,
                    message: `You already have an ${existingBooking.status} booking for ${destination}. Please cancel or complete your existing booking first.`,
                    code: 'DUPLICATE_BOOKING',
                    existingBooking: {
                        id: existingBooking._id,
                        destination: existingBooking.destination,
                        status: existingBooking.status,
                        createdAt: existingBooking.createdAt
                    }
                });
            }
        }

        // Create a new booking entry
        const booking = await Booking.create({
            fullname,
            contact,
            email,
            destination,
            price,
            days,
            totalCost: totalCost || price * days,
            user: userId,
            status: 'confirmed'
        });

        // Send confirmation email
        try {
            const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            await sendEmail({
                to: email,
                subject: `🎉 Booking Confirmed - ${destination} | Yoliday Travel`,
                html: `
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
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">✈️ Yoliday Travel</h1>
                            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your Journey Begins Here</p>
                        </div>
                        
                        <!-- Success Banner -->
                        <div style="background-color: #ecfdf5; padding: 20px 30px; text-align: center; border-bottom: 1px solid #d1fae5;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
                            <h2 style="color: #059669; margin: 0; font-size: 24px;">Booking Confirmed!</h2>
                            <p style="color: #047857; margin: 8px 0 0; font-size: 14px;">Your adventure awaits</p>
                        </div>
                        
                        <!-- Booking Details -->
                        <div style="padding: 30px;">
                            <h3 style="color: #1f2937; margin: 0 0 20px; font-size: 18px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">📋 Booking Details</h3>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Booking ID</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${booking._id.toString().slice(-8).toUpperCase()}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Destination</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">📍 ${destination}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Guest Name</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">👤 ${fullname}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Contact</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">📱 ${contact}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Duration</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">📅 ${days} Day${days > 1 ? 's' : ''}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Price per Day</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">₹${price.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">Booking Date</td>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">🗓️ ${bookingDate}</td>
                                </tr>
                            </table>
                            
                            <!-- Total Cost -->
                            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 12px; padding: 20px; margin-top: 20px; text-align: center;">
                                <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 14px;">Total Amount</p>
                                <p style="color: #ffffff; margin: 8px 0 0; font-size: 32px; font-weight: 700;">₹${(totalCost || price * days).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                        
                        <!-- Next Steps -->
                        <div style="padding: 0 30px 30px;">
                            <h3 style="color: #1f2937; margin: 0 0 15px; font-size: 16px;">📌 What's Next?</h3>
                            <ul style="margin: 0; padding: 0 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                                <li>Our travel expert will contact you within 24 hours</li>
                                <li>Prepare your travel documents (ID proof, etc.)</li>
                                <li>Check your email for travel itinerary updates</li>
                            </ul>
                        </div>
                        
                        <!-- Contact Support -->
                        <div style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; margin: 0; font-size: 14px;">Need help? Contact our support team</p>
                            <p style="color: #3b82f6; margin: 8px 0 0; font-size: 14px; font-weight: 600;">📧 support@yoliday.com | 📞 +91 1234567890</p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color: #1f2937; padding: 25px 30px; text-align: center;">
                            <p style="color: #9ca3af; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} Yoliday Travel. All rights reserved.</p>
                            <p style="color: #6b7280; margin: 10px 0 0; font-size: 11px;">This is an automated confirmation email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                `
            });
            
            console.log(`✅ Confirmation email sent to ${email}`);
        } catch (emailError) {
            // Log email error but don't fail the booking
            console.error('❌ Failed to send confirmation email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Booking successfully created! Confirmation email sent.',
            booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

/**
 * Get all bookings for the current user
 */
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

/**
 * Cancel a booking
 */
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { createBooking, getBookings, cancelBooking };