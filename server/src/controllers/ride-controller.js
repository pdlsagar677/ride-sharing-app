const rideService = require('../services/ride-service');
const { validationResult } = require('express-validator');
const mapService = require('../services/map-services');
const { sendMessageToSocketId } = require('../../socket/socket');
const rideModel = require('../models/ride-model');
const captainModel = require('../models/captain-model');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType, pickupCoords, destinationCoords } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType, pickupCoords, destinationCoords });
        res.status(201).json(ride);

        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

        // Search within 50km radius to find captains matching the vehicle type
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 50, vehicleType);

        console.log(`Found ${captainsInRadius.length} captains near pickup`);

        ride.otp = ""

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain => {
            console.log(`Sending ride to captain: ${captain.fullname.firstname}, socketId: ${captain.socketId}`);
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            })
        })

    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }

};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, pickupLtd, pickupLng, destLtd, destLng } = req.query;

    // Build coordinate objects if provided
    const pickupCoords = (pickupLtd && pickupLng) ? { ltd: parseFloat(pickupLtd), lng: parseFloat(pickupLng) } : null;
    const destCoords = (destLtd && destLng) ? { ltd: parseFloat(destLtd), lng: parseFloat(destLng) } : null;

    try {
        const fare = await rideService.getFare(pickup, destination, pickupCoords, destCoords);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        // Send ride WITH OTP to user so they can see it
        const rideData = ride.toObject();
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: rideData
        })

        // Send ride WITHOUT OTP to captain
        const captainResponse = { ...rideData };
        delete captainResponse.otp;
        return res.status(200).json(captainResponse);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        console.log('startRide error:', err.message);
        if (err.message === 'Invalid OTP') {
            return res.status(400).json({ message: 'Invalid OTP. Please ask the rider for the correct OTP.' });
        }
        if (err.message === 'Ride not found') {
            return res.status(404).json({ message: 'Ride not found' });
        }
        if (err.message === 'Ride not accepted') {
            return res.status(400).json({ message: 'This ride has not been accepted yet' });
        }
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.cancelRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.cancelRide({ rideId, user: req.user });

        // Notify the captain if one was assigned
        if (ride.captain && ride.captain.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'ride-cancelled',
                data: ride
            });
        }

        return res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (err) {
        if (err.message.includes('Cancellation window expired')) {
            return res.status(400).json({ message: err.message });
        }
        if (err.message.includes('cannot be cancelled')) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: err.message });
    }
}

module.exports.getUserRideHistory = async (req, res) => {
    try {
        const rides = await rideModel.find({
            user: req.user._id,
            status: { $in: ['completed', 'cancelled'] }
        })
        .populate('captain')
        .sort({ createdAt: -1 })
        .limit(50);

        return res.status(200).json(rides);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.getCaptainRideHistory = async (req, res) => {
    try {
        const rides = await rideModel.find({
            captain: req.captain._id,
            status: { $in: ['completed', 'cancelled'] }
        })
        .populate('user')
        .sort({ createdAt: -1 })
        .limit(50);

        const totalEarnings = rides
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + r.fare, 0);

        return res.status(200).json({ rides, totalEarnings });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Rate a ride (user rates captain after ride completes)
module.exports.rateRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, rating, review } = req.body;

    try {
        const ride = await rideModel.findOne({ _id: rideId, user: req.user._id });
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (ride.status !== 'completed') return res.status(400).json({ message: 'Can only rate completed rides' });
        if (ride.rating) return res.status(400).json({ message: 'Ride already rated' });

        // Save rating on ride
        ride.rating = rating;
        if (review) ride.review = review;
        await ride.save();

        // Update captain's average rating
        const captain = await captainModel.findById(ride.captain);
        if (captain) {
            const newTotal = captain.totalRatings + 1;
            const newAvg = ((captain.averageRating * captain.totalRatings) + rating) / newTotal;
            captain.averageRating = Math.round(newAvg * 10) / 10;
            captain.totalRatings = newTotal;
            await captain.save();
        }

        res.status(200).json({ message: 'Rating submitted', rating });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Create ride with negotiable fare
module.exports.createNegotiableRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType, suggestedFare, pickupCoords, destinationCoords } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType, pickupCoords, destinationCoords });

        // Update with negotiation data
        ride.suggestedFare = suggestedFare;
        ride.isNegotiable = true;
        await ride.save();

        res.status(201).json(ride);

        // Find and notify captains
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 50, vehicleType);

        ride.otp = "";
        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.forEach(captain => {
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}

// Captain sends counter offer
module.exports.counterOffer = async (req, res) => {
    const { rideId, amount } = req.body;

    try {
        const ride = await rideModel.findById(rideId).populate('user');
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (ride.status !== 'pending') return res.status(400).json({ message: 'Ride no longer pending' });

        ride.counterOffers.push({
            captainId: req.captain._id,
            amount
        });
        await ride.save();

        // Notify user of counter offer
        if (ride.user.socketId) {
            const captainData = await captainModel.findById(req.captain._id);
            sendMessageToSocketId(ride.user.socketId, {
                event: 'counter-offer',
                data: {
                    rideId: ride._id,
                    captainId: req.captain._id,
                    captainName: captainData.fullname.firstname,
                    captainRating: captainData.averageRating,
                    vehicleType: captainData.vehicle.vehicleType,
                    vehiclePlate: captainData.vehicle.plate,
                    amount
                }
            });
        }

        res.status(200).json({ message: 'Counter offer sent' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// User accepts a counter offer
module.exports.acceptOffer = async (req, res) => {
    const { rideId, captainId, amount } = req.body;

    try {
        const ride = await rideModel.findById(rideId);
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (ride.status !== 'pending') return res.status(400).json({ message: 'Ride no longer pending' });

        // Update fare to accepted amount and assign captain
        ride.fare = amount;
        ride.captain = captainId;
        ride.status = 'accepted';
        await ride.save();

        const fullRide = await rideModel.findById(rideId).populate('user').populate('captain').select('+otp');

        // Notify user with OTP
        const rideData = fullRide.toObject();
        sendMessageToSocketId(fullRide.user.socketId, {
            event: 'ride-confirmed',
            data: rideData
        });

        // Notify captain
        const captainResponse = { ...rideData };
        delete captainResponse.otp;
        const captain = await captainModel.findById(captainId);
        if (captain.socketId) {
            sendMessageToSocketId(captain.socketId, {
                event: 'offer-accepted',
                data: captainResponse
            });
        }

        res.status(200).json(captainResponse);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// User sends counter-offer back to a captain
module.exports.userCounterOffer = async (req, res) => {
    const { rideId, captainId, amount } = req.body;

    try {
        const ride = await rideModel.findOne({ _id: rideId, user: req.user._id });
        if (!ride) return res.status(404).json({ message: 'Ride not found' });
        if (ride.status !== 'pending') return res.status(400).json({ message: 'Ride no longer pending' });

        // Notify the captain with user's counter
        const captain = await captainModel.findById(captainId);
        if (captain && captain.socketId) {
            const rideWithUser = await rideModel.findById(rideId).populate('user');
            sendMessageToSocketId(captain.socketId, {
                event: 'user-counter-offer',
                data: {
                    rideId: ride._id,
                    ride: rideWithUser,
                    amount,
                    userName: req.user.fullname.firstname,
                }
            });
        }

        res.status(200).json({ message: 'Counter offer sent to captain' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}