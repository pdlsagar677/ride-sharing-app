const userModel = require('../models/user-model');
const userService = require('../../src/services/user-services');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blacklistToken-model');
const otpModel = require('../models/otp-model');
const rideModel = require('../models/ride-model');
const emailService = require('../services/email-service');
const crypto = require('crypto');

function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

// Signup: create user → send OTP → user verifies → then can login
module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    const isUserAlready = await userModel.findOne({ email });
    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exist' });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    // Send OTP for email verification
    const otp = generateOtp();
    await otpModel.deleteMany({ email, userType: 'user' });
    await otpModel.create({ email, otp, userType: 'user' });

    const previewUrl = await emailService.sendOtpEmail(email, otp);
    console.log(`\n===== SIGNUP OTP =====\nUser: ${email}\nOTP: ${otp}\n======================\n`);

    res.status(201).json({ message: 'Account created. Verify your email with OTP.', email, previewUrl });
}

// Login: just email + password → return token directly (no OTP)
module.exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({ user });
}

module.exports.getUserProfile = async (req, res, next) => {
    res.status(200).json(req.user);
}

module.exports.updateUserProfile = async (req, res, next) => {
    const { firstname, lastname, phone } = req.body;

    try {
        const updates = {};
        if (firstname) updates['fullname.firstname'] = firstname;
        if (lastname !== undefined) updates['fullname.lastname'] = lastname;
        if (phone !== undefined) updates.phone = phone;

        const user = await userModel.findByIdAndUpdate(req.user._id, updates, { new: true });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Change password (logged in)
module.exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'New passwords do not match' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const user = await userModel.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = await userModel.hashPassword(newPassword);
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Forgot password - send OTP to email
module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'No account found with this email' });

        const otp = generateOtp();
        await otpModel.deleteMany({ email, userType: 'user-reset' });
        await otpModel.create({ email, otp, userType: 'user-reset' });

        const previewUrl = await emailService.sendOtpEmail(email, otp);
        console.log(`\n===== RESET OTP =====\nUser: ${email}\nOTP: ${otp}\n=====================\n`);

        res.status(200).json({ message: 'OTP sent to your email', email, previewUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Reset password with OTP
module.exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        const otpRecord = await otpModel.findOne({ email, otp, userType: 'user-reset' });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        await otpModel.deleteMany({ email, userType: 'user-reset' });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.password = await userModel.hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now login.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Delete account
module.exports.deleteAccount = async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    try {
        const user = await userModel.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        // Delete all user's rides
        await rideModel.deleteMany({ user: req.user._id });
        // Delete all user's OTPs
        await otpModel.deleteMany({ email: user.email });
        // Delete the user
        await userModel.findByIdAndDelete(req.user._id);

        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports.logoutUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    if (token) await blackListTokenModel.create({ token });

    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(200).json({ message: 'Logged out' });
}
