const crypto = require('crypto');
const otpModel = require('../models/otp-model');
const userModel = require('../models/user-model');
const captainModel = require('../models/captain-model');
const emailService = require('../services/email-service');
const { validationResult } = require('express-validator');

// Generate 6-digit OTP
function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

module.exports.sendOtp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, userType } = req.body;

    try {
        // Check if user/captain exists
        if (userType === 'user') {
            const user = await userModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'No account found with this email. Please sign up first.' });
            }
        } else if (userType === 'captain') {
            const captain = await captainModel.findOne({ email });
            if (!captain) {
                return res.status(404).json({ message: 'No captain account found with this email. Please sign up first.' });
            }
        }

        // Delete any existing OTPs for this email
        await otpModel.deleteMany({ email, userType });

        // Generate and save new OTP
        const otp = generateOtp();
        await otpModel.create({ email, otp, userType });

        // Send OTP via Ethereal email
        const previewUrl = await emailService.sendOtpEmail(email, otp);

        res.status(200).json({
            message: 'OTP sent to your email',
            previewUrl // Include preview URL so you can view the email in Ethereal
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

module.exports.verifyOtp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, userType } = req.body;

    try {
        // Find the OTP record
        const otpRecord = await otpModel.findOne({ email, otp, userType });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid - delete it
        await otpModel.deleteMany({ email, userType });

        // Generate JWT token and return user/captain data
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        };

        if (userType === 'user') {
            const user = await userModel.findOne({ email });
            const token = user.generateAuthToken();
            res.cookie('token', token, cookieOptions);
            return res.status(200).json({ user });
        } else if (userType === 'captain') {
            const captain = await captainModel.findOne({ email });
            const token = captain.generateAuthToken();
            res.cookie('token', token, cookieOptions);
            return res.status(200).json({ captain });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'OTP verification failed' });
    }
};
