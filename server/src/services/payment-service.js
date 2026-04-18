const crypto = require('crypto');
const axios = require('axios');

// ===== eSewa =====

const ESEWA_CONFIG = {
    merchantCode: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
    esewaPayUrl: process.env.ESEWA_PAY_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
    esewaVerifyUrl: process.env.ESEWA_VERIFY_URL || 'https://uat.esewa.com.np/api/epay/transaction/status/'
};

function generateEsewaSignature(message) {
    const hmac = crypto.createHmac('sha256', ESEWA_CONFIG.secretKey);
    hmac.update(message);
    return hmac.digest('base64');
}

module.exports.getEsewaPaymentData = (rideId, amount) => {
    const transactionUuid = `RIDE-${rideId}-${Date.now()}`;
    const totalAmount = amount;

    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${ESEWA_CONFIG.merchantCode}`;
    const signature = generateEsewaSignature(message);

    return {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: ESEWA_CONFIG.merchantCode,
        product_service_charge: 0,
        product_delivery_charge: 0,
        signed_field_names: signedFieldNames,
        signature: signature
    };
};

module.exports.verifyEsewaPayment = async (encodedData) => {
    const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'));

    if (decodedData.status !== 'COMPLETE') {
        throw new Error('Payment not completed');
    }

    return {
        transactionCode: decodedData.transaction_code,
        status: decodedData.status,
        totalAmount: decodedData.total_amount,
        transactionUuid: decodedData.transaction_uuid,
        productCode: decodedData.product_code,
    };
};

module.exports.ESEWA_CONFIG = ESEWA_CONFIG;

// ===== Khalti =====

const KHALTI_CONFIG = {
    secretKey: process.env.KHALTI_SECRET_KEY || 'live_secret_key_68791341fdd94846a146f0457ff7b455',
    initiateUrl: process.env.KHALTI_INITIATE_URL || 'https://dev.khalti.com/api/v2/epayment/initiate/',
    lookupUrl: process.env.KHALTI_LOOKUP_URL || 'https://dev.khalti.com/api/v2/epayment/lookup/',
};

module.exports.initiateKhaltiPayment = async (rideId, amount, returnUrl) => {
    // Khalti expects amount in paisa (1 Rs = 100 paisa)
    const amountInPaisa = amount * 100;

    const payload = {
        return_url: returnUrl,
        website_url: process.env.FRONTEND_URL,
        amount: amountInPaisa,
        purchase_order_id: `RIDE-${rideId}`,
        purchase_order_name: `RideNepal Ride #${rideId.toString().slice(-6)}`,
    };

    const response = await axios.post(KHALTI_CONFIG.initiateUrl, payload, {
        headers: {
            'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
            'Content-Type': 'application/json',
        }
    });

    // Khalti returns { pidx, payment_url, expires_at, expires_in }
    return {
        pidx: response.data.pidx,
        paymentUrl: response.data.payment_url,
    };
};

module.exports.verifyKhaltiPayment = async (pidx) => {
    const response = await axios.post(KHALTI_CONFIG.lookupUrl, { pidx }, {
        headers: {
            'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
            'Content-Type': 'application/json',
        }
    });

    // response.data: { pidx, total_amount, status, transaction_id, ... }
    if (response.data.status !== 'Completed') {
        throw new Error(`Payment status: ${response.data.status}`);
    }

    return {
        pidx: response.data.pidx,
        totalAmount: response.data.total_amount, // in paisa
        status: response.data.status,
        transactionId: response.data.transaction_id,
        purchaseOrderId: response.data.purchase_order_id,
    };
};

module.exports.KHALTI_CONFIG = KHALTI_CONFIG;
