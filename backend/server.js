const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Load environment variables FIRST
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS Middleware - Updated for Vercel
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'https://yoliday-travel-booking.vercel.app',
        ];
        
        // Allow all Vercel preview deployments
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // For development, allow all origins
            // In production, uncomment below:
            // callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fix favicon 404
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Health check route
app.get('/', (req, res) => {
    res.json({ 
        message: "✅ Travel Booking API is running!",
        status: "active",
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/booking', require('./routes/bookingRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        message: `Route ${req.originalUrl} not found`,
        availableRoutes: ['/api/auth', '/api/booking', '/api/destinations', '/api/newsletter']
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    
    // Don't leak stack traces in production
    const errorResponse = {
        message: err.message || 'Internal Server Error',
        status: err.status || 500
    };
    
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    
    res.status(err.status || 500).json(errorResponse);
});

// For Vercel, export the app
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 CORS enabled for frontend\n`);
    });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    console.error(err.stack);
});