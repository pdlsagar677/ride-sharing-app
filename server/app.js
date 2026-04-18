const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');  // Uncomment when ready for production
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const userRoutes = require('./src/routes/user-route');
const captainRoutes = require('./src/routes/captain-route');
const mapsRoutes = require('./src/routes/maps-route');
const rideRoutes = require('./src/routes/ride-route');
const otpRoutes = require('./src/routes/otp-route');
const paymentRoutes = require('./src/routes/payment-route');

const app = express();

connectToDb();

// Security middleware
app.use(helmet());
// Manual NoSQL injection sanitizer (express-mongo-sanitize is incompatible with Express 5)
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else if (typeof obj[key] === 'object') {
                sanitize(obj[key]);
            }
        }
        return obj;
    };
    if (req.body) sanitize(req.body);
    if (req.params) sanitize(req.params);
    next();
});

// Rate limiting (commented out for development - uncomment for production)
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: { message: 'Too many requests, please try again later.' }
// });
// app.use('/api/', limiter);
//
// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 20, // stricter limit for auth endpoints
//     message: { message: 'Too many login attempts, please try again later.' }
// });
// app.use('/api/users/login', authLimiter);
// app.use('/api/users/register', authLimiter);
// app.use('/api/captain/login', authLimiter);
// app.use('/api/captain/register', authLimiter);
// app.use('/api/otp/', authLimiter);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/captain', captainRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/payment', paymentRoutes);

module.exports = app;
