const express = require("express");
const router  = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const {
  validateCoupon,
  stripeCreateIntent, stripeWebhook,
  razorpayCreateOrder, razorpayVerify, razorpayWebhook,
} = require("../controllers/payment.controller");

/* ── Webhooks (raw body, no JWT) ── */
router.post("/stripe/webhook",   express.raw({ type: "application/json" }), stripeWebhook);
router.post("/razorpay/webhook", express.json(), razorpayWebhook);   // Razorpay sends JSON

/* ── Protected endpoints ── */
router.use(verifyJWT);

router.get("/validate-coupon", validateCoupon);

// Stripe
router.post("/stripe/create-intent", stripeCreateIntent);

// Razorpay
router.post("/razorpay/create-order", razorpayCreateOrder);
router.post("/razorpay/verify",       razorpayVerify);

module.exports = router;
