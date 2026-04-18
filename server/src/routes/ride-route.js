const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const rideController = require('../controllers/ride-controller');
const authMiddleware = require('../middleware/auth-middleware');


router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn([ 'auto', 'car', 'motorcycle' ]).withMessage('Invalid vehicle type'),
    rideController.createRide
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    query('pickupLtd').optional().isFloat(),
    query('pickupLng').optional().isFloat(),
    query('destLtd').optional().isFloat(),
    query('destLng').optional().isFloat(),
    rideController.getFare
)

router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.confirmRide
)

router.get('/start-ride',
    authMiddleware.authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({ min: 6, max: 6 }).withMessage('Invalid OTP'),
    rideController.startRide
)

router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)

router.post('/cancel',
    authMiddleware.authUser,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.cancelRide
)

router.get('/user-history',
    authMiddleware.authUser,
    rideController.getUserRideHistory
)

router.get('/captain-history',
    authMiddleware.authCaptain,
    rideController.getCaptainRideHistory
)

router.post('/rate',
    authMiddleware.authUser,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    rideController.rateRide
)

router.post('/create-negotiable',
    authMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }),
    body('destination').isString().isLength({ min: 3 }),
    body('vehicleType').isIn(['auto', 'car', 'motorcycle']),
    body('suggestedFare').isNumeric(),
    rideController.createNegotiableRide
)

router.post('/counter-offer',
    authMiddleware.authCaptain,
    body('rideId').isMongoId(),
    body('amount').isNumeric(),
    rideController.counterOffer
)

router.post('/accept-offer',
    authMiddleware.authUser,
    body('rideId').isMongoId(),
    body('captainId').isMongoId(),
    body('amount').isNumeric(),
    rideController.acceptOffer
)

router.post('/user-counter-offer',
    authMiddleware.authUser,
    body('rideId').isMongoId(),
    body('captainId').isMongoId(),
    body('amount').isNumeric(),
    rideController.userCounterOffer
)

module.exports = router;