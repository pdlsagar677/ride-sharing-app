const mongoose = require('mongoose');


const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
    },
    pickup: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    pickupCoords: {
        ltd: { type: Number },
        lng: { type: Number }
    },
    destinationCoords: {
        ltd: { type: Number },
        lng: { type: Number }
    },
    routePolyline: {
        type: String,
    },
    fare: {
        type: Number,
        required: true,
    },
    suggestedFare: {
        type: Number,
    },
    counterOffers: [{
        captainId: { type: mongoose.Schema.Types.ObjectId, ref: 'captain' },
        amount: Number,
        createdAt: { type: Date, default: Date.now }
    }],
    isNegotiable: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    review: {
        type: String,
    },

    status: {
        type: String,
        enum: [ 'pending', 'accepted', "ongoing", 'completed', 'cancelled' ],
        default: 'pending',
    },

    duration: {
        type: Number,
    }, // in seconds

    distance: {
        type: Number,
    }, // in meters

    paymentMethod: {
        type: String,
        enum: ['cash', 'esewa', 'khalti'],
        default: 'cash',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending',
    },
    transactionId: {
        type: String,
    },

    otp: {
        type: String,
        select: false,
        required: true,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('ride', rideSchema);