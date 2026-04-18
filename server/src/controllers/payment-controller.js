const rideModel = require('../models/ride-model');
const paymentService = require('../services/payment-service');
const { sendMessageToSocketId } = require('../../socket/socket');
const { validationResult } = require('express-validator');

// ===== eSewa =====

module.exports.initiateEsewaPayment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideModel.findOne({ _id: rideId, user: req.user._id });
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        const paymentData = paymentService.getEsewaPaymentData(rideId, ride.fare);

        await rideModel.findByIdAndUpdate(rideId, {
            paymentMethod: 'esewa',
            transactionId: paymentData.transaction_uuid,
        });

        res.status(200).json({
            paymentData,
            esewaUrl: paymentService.ESEWA_CONFIG.esewaPayUrl,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to initiate payment' });
    }
};

module.exports.esewaSuccess = async (req, res) => {
    const { data } = req.query;

    try {
        const paymentInfo = await paymentService.verifyEsewaPayment(data);

        const parts = paymentInfo.transactionUuid.split('-');
        const rideId = parts[1];

        const ride = await rideModel.findById(rideId).populate('user').populate('captain');
        if (!ride) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
        }

        await rideModel.findByIdAndUpdate(rideId, {
            paymentStatus: 'completed',
            transactionId: paymentInfo.transactionCode,
        });

        console.log(`eSewa payment successful for ride ${rideId}`);

        if (ride.captain && ride.captain.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'payment-received',
                data: { rideId: ride._id, amount: ride.fare, method: 'esewa' }
            });
        }

        res.redirect(`${process.env.FRONTEND_URL}/payment-success?rideId=${rideId}`);
    } catch (err) {
        console.error('eSewa verification failed:', err);
        res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
};

module.exports.esewaFailure = async (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
};

// ===== Khalti =====

module.exports.initiateKhaltiPayment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideModel.findOne({ _id: rideId, user: req.user._id });
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        // Khalti redirects here after payment - backend verifies then redirects to frontend
        const serverUrl = `http://localhost:${process.env.PORT || 3000}`;
        const returnUrl = `${serverUrl}/api/payment/khalti/callback?rideId=${rideId}`;

        const khaltiData = await paymentService.initiateKhaltiPayment(rideId, ride.fare, returnUrl);

        await rideModel.findByIdAndUpdate(rideId, {
            paymentMethod: 'khalti',
            transactionId: khaltiData.pidx,
        });

        console.log(`Khalti payment initiated for ride ${rideId} | pidx: ${khaltiData.pidx}`);

        res.status(200).json({
            paymentUrl: khaltiData.paymentUrl,
            pidx: khaltiData.pidx,
        });
    } catch (err) {
        console.error('Khalti initiation failed:', err.response?.data || err.message);
        res.status(500).json({ message: 'Failed to initiate Khalti payment' });
    }
};

module.exports.khaltiCallback = async (req, res) => {
    const { pidx, rideId } = req.query;

    if (!pidx || !rideId) {
        return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    try {
        const paymentInfo = await paymentService.verifyKhaltiPayment(pidx);

        const ride = await rideModel.findById(rideId).populate('user').populate('captain');
        if (!ride) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
        }

        await rideModel.findByIdAndUpdate(rideId, {
            paymentStatus: 'completed',
            transactionId: paymentInfo.transactionId,
        });

        console.log(`Khalti payment successful for ride ${rideId} | txn: ${paymentInfo.transactionId}`);

        if (ride.captain && ride.captain.socketId) {
            sendMessageToSocketId(ride.captain.socketId, {
                event: 'payment-received',
                data: { rideId: ride._id, amount: ride.fare, method: 'khalti' }
            });
        }

        res.redirect(`${process.env.FRONTEND_URL}/payment-success?rideId=${rideId}`);
    } catch (err) {
        console.error('Khalti verification failed:', err.response?.data || err.message);
        res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
};
