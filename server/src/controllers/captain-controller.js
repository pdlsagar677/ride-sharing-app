const captainModel = require('../models/captain-model');
const captainService = require('../services/captain-services');
const blackListTokenModel = require('../models/blacklistToken-model');
const { validationResult } = require('express-validator');
const otpModel = require('../models/otp-model');
const rideModel = require('../models/ride-model');
const emailService = require('../services/email-service');
const crypto = require('crypto');

function generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
}

// Signup: create captain → send OTP → captain verifies → then can login
module.exports.registerCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isCaptainAlreadyExist = await captainModel.findOne({ email });
    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain already exist' });
    }

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    // Send OTP for email verification
    const otp = generateOtp();
    await otpModel.deleteMany({ email, userType: 'captain' });
    await otpModel.create({ email, otp, userType: 'captain' });

    const previewUrl = await emailService.sendOtpEmail(email, otp);
    console.log(`\n===== CAPTAIN SIGNUP OTP =====\nCaptain: ${email}\nOTP: ${otp}\n==============================\n`);

    res.status(201).json({ message: 'Captain account created. Verify your email with OTP.', email, previewUrl });
}

// Login: just email + password → return token directly (no OTP)
module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select('+password');
    if (!captain) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await captain.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = captain.generateAuthToken();
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });
    res.status(200).json({ captain });
}

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
}

module.exports.updateCaptainProfile = async (req, res, next) => {
    const { firstname, lastname, phone, vehicleColor, vehiclePlate, vehicleCapacity } = req.body;

    try {
        const updates = {};
        if (firstname) updates['fullname.firstname'] = firstname;
        if (lastname !== undefined) updates['fullname.lastname'] = lastname;
        if (phone !== undefined) updates.phone = phone;
        if (vehicleColor) updates['vehicle.color'] = vehicleColor;
        if (vehiclePlate) updates['vehicle.plate'] = vehiclePlate;
        if (vehicleCapacity) updates['vehicle.capacity'] = vehicleCapacity;

        const captain = await captainModel.findByIdAndUpdate(req.captain._id, updates, { new: true });
        res.status(200).json({ captain });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

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
        const captain = await captainModel.findById(req.captain._id).select('+password');
        const isMatch = await captain.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

        captain.password = await captainModel.hashPassword(newPassword);
        await captain.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const captain = await captainModel.findOne({ email });
        if (!captain) return res.status(404).json({ message: 'No captain account found with this email' });

        const otp = generateOtp();
        await otpModel.deleteMany({ email, userType: 'captain-reset' });
        await otpModel.create({ email, otp, userType: 'captain-reset' });

        const previewUrl = await emailService.sendOtpEmail(email, otp);
        console.log(`\n===== CAPTAIN RESET OTP =====\nCaptain: ${email}\nOTP: ${otp}\n=============================\n`);

        res.status(200).json({ message: 'OTP sent to your email', email, previewUrl });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

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
        const otpRecord = await otpModel.findOne({ email, otp, userType: 'captain-reset' });
        if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

        await otpModel.deleteMany({ email, userType: 'captain-reset' });

        const captain = await captainModel.findOne({ email });
        if (!captain) return res.status(404).json({ message: 'Captain not found' });

        captain.password = await captainModel.hashPassword(newPassword);
        await captain.save();

        res.status(200).json({ message: 'Password reset successfully. You can now login.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports.deleteAccount = async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    try {
        const captain = await captainModel.findById(req.captain._id).select('+password');
        const isMatch = await captain.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        // Delete all captain's rides
        await rideModel.deleteMany({ captain: req.captain._id });
        // Delete all OTPs
        await otpModel.deleteMany({ email: captain.email });
        // Delete the captain
        await captainModel.findByIdAndDelete(req.captain._id);

        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    if (token) await blackListTokenModel.create({ token });

    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(200).json({ message: 'Logout successfully' });
}
