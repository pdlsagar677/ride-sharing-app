const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    userType: {
        type: String,
        enum: ['user', 'captain', 'user-reset', 'captain-reset'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP expires in 5 minutes
    }
});

const otpModel = mongoose.model('otp', otpSchema);

module.exports = otpModel;
