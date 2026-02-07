const mongoose = require('mongoose');

// Define the booking schema with required fields
const bookingSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    days: {
        type: Number,
        required: true,
        min: 1
    },
    totalCost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    // Reference to the User model
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Compound index to help with duplicate checking
bookingSchema.index({ user: 1, destination: 1, status: 1 });

// Create the model
module.exports = mongoose.model('Booking', bookingSchema);
