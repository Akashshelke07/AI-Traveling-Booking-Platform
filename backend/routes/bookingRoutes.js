const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createBooking, getBookings, cancelBooking } = require('../controllers/bookingController');
const router = express.Router();

router.post('/bookings', protect, createBooking);
router.get('/getBookings', protect, getBookings);
router.patch('/bookings/:id/cancel', protect, cancelBooking);

module.exports = router;
