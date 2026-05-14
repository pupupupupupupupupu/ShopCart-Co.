const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const crypto = require("crypto");

const TAX_RATE = 0.08;
const SHIPPING_FLAT = 5.99;

/* ─────────────────────────────────────────────────
   SHARED: compute cart totals + build order payload
───────────────────────────────────────────────── */
const buildOrderPayload = async (req) => {
  const { couponCode, shippingAddressId } = req.body;

  const cart = await Cart.findOne({ user: req.user })
    .populate("items.productId")
    .exec();

  if (!cart || cart.items.length === 0)
    throw Object.assign(new Error("Cart is empty"), { status: 400 });

  for (const item of cart.items) {
    if (!item.productId || item.productId.isDeleted)
      throw Object.assign(new Error("A product in your cart is no longer available"), { status: 400 });
    if (item.productId.stock < item.qty)
      throw Object.assign(new Error(`Insufficient stock for "${item.productId.name}"`), { status: 400 });
  }

  const subtotal = cart.items.reduce((s, i) => s + i.qty * i.productId.price, 0);

  let couponDiscount = 0, couponCodeApplied = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const v = coupon.isValid(subtotal);
      if (!v.valid) throw Object.assign(new Error(v.reason), { status: 400 });
      couponDiscount = coupon.calcDiscount(subtotal);
      couponCodeApplied = coupon.code;
    }
  }

  const discounted = subtotal - couponDiscount;
  const tax      = Math.round(discounted * TAX_RATE * 100) / 100;
  const shipping = discounted >= 75 ? 0 : SHIPPING_FLAT;
  const totalAmount = Math.round((discounted + tax + shipping) * 100) / 100;

  let shippingAddress = null;
  if (shippingAddressId) {
    const userDoc = await User.findOne({ username: req.user });
    shippingAddress = userDoc?.addresses?.id(shippingAddressId) || null;
  }

  const orderItems = cart.items.map((item) => ({
    productId: item.productId._id,
    name:  item.productId.name,
    price: item.productId.price,
    qty:   item.qty,
    image: item.productId.images?.[0] || null,
  }));

  return {
    orderItems, subtotal, couponDiscount, couponCodeApplied,
    tax, shipping, totalAmount, shippingAddress,
    cart,
  };
};

/* ─────────────────────────────────────────────────
   POST /payments/validate-coupon
───────────────────────────────────────────────── */
const validateCoupon = async (req, res) => {
  const { code, cartTotal } = req.query;
  if (!code) return res.status(400).json({ message: "Code required" });

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });

  const validity = coupon.isValid(Number(cartTotal) || 0);
  if (!validity.valid) return res.status(400).json({ message: validity.reason });

  const discount = coupon.calcDiscount(Number(cartTotal) || 0);
  res.json({ valid: true, discount, type: coupon.type, value: coupon.value });
};

/* ═══════════════════════════════════════════════
   STRIPE
═══════════════════════════════════════════════ */

// POST /payments/stripe/create-intent
const stripeCreateIntent = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

  try {
    const payload = await buildOrderPayload(req);
    const { orderItems, subtotal, couponDiscount, couponCodeApplied,
      tax, shipping, totalAmount, shippingAddress } = payload;

    const order = await Order.create({
      user: req.user, items: orderItems,
      subtotal, tax, shipping, couponDiscount, couponCode: couponCodeApplied,
      totalAmount, shippingAddress, status: "pending", paymentStatus: "unpaid",
    });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),   // cents
      currency: "usd",
      metadata: { orderId: order._id.toString(), username: req.user },
      automatic_payment_methods: { enabled: true },
    });

    order.stripePaymentIntentId = intent.id;
    await order.save();

    res.json({
      gateway: "stripe",
      clientSecret: intent.client_secret,
      orderId: order._id,
      breakdown: { subtotal, couponDiscount, tax, shipping, totalAmount },
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// POST /payments/stripe/webhook  (raw body — set in app.js)
const stripeWebhook = async (req, res) => {
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: intent.id });
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.transactionId  = intent.id;
        order.status         = "processing";
        await order.save();
        if (order.couponCode)
          await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
        for (const item of order.items)
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
        await Cart.findOneAndDelete({ user: order.user });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: intent.id });
      if (order && order.paymentStatus === "unpaid") { order.status = "cancelled"; await order.save(); }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      const order = await Order.findOne({ transactionId: charge.payment_intent });
      if (order) { order.paymentStatus = "refunded"; order.status = "refunded"; await order.save(); }
      break;
    }
  }

  res.json({ received: true });
};

/* ═══════════════════════════════════════════════
   RAZORPAY
═══════════════════════════════════════════════ */

// POST /payments/razorpay/create-order
const razorpayCreateOrder = async (req, res) => {
  const Razorpay = require("razorpay");
  const instance = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const payload = await buildOrderPayload(req);
    const { orderItems, subtotal, couponDiscount, couponCodeApplied,
      tax, shipping, totalAmount, shippingAddress } = payload;

    // Create pending order first
    const order = await Order.create({
      user: req.user, items: orderItems,
      subtotal, tax, shipping, couponDiscount, couponCode: couponCodeApplied,
      totalAmount, shippingAddress, status: "pending", paymentStatus: "unpaid",
      paymentMethod: "razorpay",
    });

    // Razorpay amounts are in paise (INR) or smallest currency unit
    // For USD we still use cents; Razorpay supports multi-currency
    const currency = process.env.RAZORPAY_CURRENCY || "INR";
    const multiplier = currency === "INR" ? 100 : 100; // paise / cents

    const rzpOrder = await instance.orders.create({
      amount:   Math.round(totalAmount * multiplier),
      currency,
      receipt:  order._id.toString(),
      notes:    { orderId: order._id.toString(), username: req.user },
    });

    // Store Razorpay order id for verification
    order.transactionId = rzpOrder.id;   // razorpay_order_id stored here
    await order.save();

    res.json({
      gateway:       "razorpay",
      rzpOrderId:    rzpOrder.id,
      amount:        rzpOrder.amount,
      currency:      rzpOrder.currency,
      keyId:         process.env.RAZORPAY_KEY_ID,
      orderId:       order._id,
      breakdown:     { subtotal, couponDiscount, tax, shipping, totalAmount },
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// POST /payments/razorpay/verify
// Called by frontend after successful Razorpay payment
const razorpayVerify = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,           // our internal order _id
  } = req.body;

  // 1. Verify HMAC-SHA256 signature
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed: signature mismatch" });
  }

  // 2. Update order
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.paymentStatus !== "paid") {
    order.paymentStatus           = "paid";
    order.status                  = "processing";
    order.stripePaymentIntentId   = undefined;   // not stripe
    order.transactionId           = razorpay_payment_id;
    await order.save();

    // Coupon usage
    if (order.couponCode)
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });

    // Decrement stock
    for (const item of order.items)
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });

    // Clear cart
    await Cart.findOneAndDelete({ user: order.user });
  }

  res.json({ success: true, orderId: order._id });
};

// POST /payments/razorpay/webhook  (Razorpay async events)
const razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature     = req.headers["x-razorpay-signature"];

  if (webhookSecret) {
    const digest = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (digest !== signature)
      return res.status(400).json({ message: "Webhook signature mismatch" });
  }

  const event = req.body;

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment.entity;
      // Find by razorpay_order_id stored as transactionId
      const order = await Order.findOne({ transactionId: payment.order_id });
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.status        = "processing";
        order.transactionId = payment.id;
        await order.save();
      }
      break;
    }
    case "payment.failed": {
      const payment = event.payload.payment.entity;
      const order = await Order.findOne({ transactionId: payment.order_id });
      if (order && order.paymentStatus === "unpaid") { order.status = "cancelled"; await order.save(); }
      break;
    }
    case "refund.created": {
      const refund = event.payload.refund.entity;
      const order  = await Order.findOne({ transactionId: refund.payment_id });
      if (order) { order.paymentStatus = "refunded"; order.status = "refunded"; await order.save(); }
      break;
    }
  }

  res.json({ received: true });
};

module.exports = {
  validateCoupon,
  stripeCreateIntent, stripeWebhook,
  razorpayCreateOrder, razorpayVerify, razorpayWebhook,
};
