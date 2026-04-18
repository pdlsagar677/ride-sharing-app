const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const otpController = require('../controllers/otp-controller');

router.post('/send', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('userType').isIn(['user', 'captain']).withMessage('userType must be user or captain'),
], otpController.sendOtp);

router.post('/verify', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('userType').isIn(['user', 'captain']).withMessage('userType must be user or captain'),
], otpController.verifyOtp);

module.exports = router;
