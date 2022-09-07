const express = require('express');
const { processPayment, sendStripeKey } = require('../controllers/paymentController');
const router = express.Router();

const { isAuthenticatedUser } = require('../middleware/auth');

router.route("/payment/success").post(isAuthenticatedUser, processPayment);
router.route("/stripeApiKey").get(isAuthenticatedUser, sendStripeKey);

module.exports = router;