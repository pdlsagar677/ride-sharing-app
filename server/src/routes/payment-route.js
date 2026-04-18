const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/payment-controller');
const authMiddleware = require('../middleware/auth-middleware');

// eSewa
router.post('/esewa/initiate',
    authMiddleware.authUser,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    paymentController.initiateEsewaPayment
);
router.get('/esewa/success', paymentController.esewaSuccess);
router.get('/esewa/failure', paymentController.esewaFailure);

// Khalti
router.post('/khalti/initiate',
    authMiddleware.authUser,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    paymentController.initiateKhaltiPayment
);
router.get('/khalti/callback', paymentController.khaltiCallback);

module.exports = router;
