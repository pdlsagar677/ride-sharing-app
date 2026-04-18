const rideModel = require('../models/ride-model');
const mapService = require('./map-services');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function getFare(pickup, destination, pickupCoords, destCoords) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    // Use coordinates directly if available, otherwise geocode from address strings
    let distanceTime;
    if (pickupCoords && destCoords && pickupCoords.ltd && destCoords.ltd) {
        distanceTime = await mapService.getDistanceTimeFromCoords(pickupCoords, destCoords);
    } else {
        distanceTime = await mapService.getDistanceTime(pickup, destination);
    }

    const baseFare = {
        auto: 30,
        car: 50,
        motorcycle: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        motorcycle: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        motorcycle: 1.5
    };

    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        motorcycle: Math.round(baseFare.motorcycle + ((distanceTime.distance.value / 1000) * perKmRate.motorcycle) + ((distanceTime.duration.value / 60) * perMinuteRate.motorcycle)),
        distance: distanceTime.distance,
        duration: distanceTime.duration,
        polyline: distanceTime.polyline
    };

    return fare;


}

module.exports.getFare = getFare;


function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}


module.exports.createRide = async ({
    user, pickup, destination, vehicleType, pickupCoords, destinationCoords
}) => {
    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await getFare(pickup, destination, pickupCoords, destinationCoords);

    const otp = getOtp(6);
    console.log(`\n===== RIDE OTP =====`);
    console.log(`OTP: ${otp}`);
    console.log(`Pickup: ${pickup}`);
    console.log(`Destination: ${destination}`);
    console.log(`====================\n`);

    const rideData = {
        user,
        pickup,
        destination,
        otp,
        fare: fare[ vehicleType ]
    };

    // Store coordinates and route polyline if available
    if (pickupCoords && pickupCoords.ltd) {
        rideData.pickupCoords = pickupCoords;
    }
    if (destinationCoords && destinationCoords.ltd) {
        rideData.destinationCoords = destinationCoords;
    }
    if (fare.polyline) {
        rideData.routePolyline = fare.polyline;
    }

    const ride = await rideModel.create(rideData);

    return ride;
}

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'accepted',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}

module.exports.startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error('Ride id and OTP are required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'accepted') {
        throw new Error('Ride not accepted');
    }

    if (ride.otp !== otp) {
        throw new Error('Invalid OTP');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'ongoing'
    })

    return ride;
}

module.exports.endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'ongoing') {
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'completed'
    })

    return ride;
}

module.exports.cancelRide = async ({ rideId, user }) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        user: user._id
    }).populate('user').populate('captain');

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status === 'ongoing' || ride.status === 'completed' || ride.status === 'cancelled') {
        throw new Error('This ride cannot be cancelled');
    }

    // Check if ride was created within the last 1 minute
    const now = new Date();
    const rideCreatedAt = new Date(ride.createdAt);
    const diffMs = now - rideCreatedAt;
    const diffSeconds = diffMs / 1000;

    if (diffSeconds > 60) {
        throw new Error('Cancellation window expired. You can only cancel within 1 minute of booking.');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'cancelled'
    });

    return ride;
}