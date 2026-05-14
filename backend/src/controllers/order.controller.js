const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");

const TAX_RATE = 0.08;     // 8%
const SHIPPING_FLAT = 5.99; // flat rate; free over $75

// POST /orders — create order from cart
const createOrder = async (req, res) => {
  const { couponCode, shippingAddressId } = req.body;

  const cart = await Cart.findOne({ user: req.user })
    .populate("items.productId")
    .exec();

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Validate stock and build order items
  for (const item of cart.items) {
    if (!item.productId || item.productId.isDeleted) {
      return res.status(400).json({ message: `Product no longer available` });
    }
    if (item.productId.stock < item.qty) {
      return res.status(400).json({ message: `Insufficient stock for ${item.productId.name}` });
    }
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.qty * item.productId.price, 0
  );

  // Apply coupon
  let couponDiscount = 0;
  let couponCodeApplied = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid(subtotal);
      if (!validity.valid) return res.status(400).json({ message: validity.reason });
      couponDiscount = coupon.calcDiscount(subtotal);
      couponCodeApplied = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  const discountedSubtotal = subtotal - couponDiscount;
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const shipping = discountedSubtotal >= 75 ? 0 : SHIPPING_FLAT;
  const totalAmount = Math.round((discountedSubtotal + tax + shipping) * 100) / 100;

  // Resolve shipping address
  let shippingAddress = null;
  if (shippingAddressId) {
    const userDoc = await User.findOne({ username: req.user });
    shippingAddress = userDoc?.addresses?.id(shippingAddressId) || null;
  }

  // Build snapshot items (prices locked at order time)
  const orderItems = cart.items.map((item) => ({
    productId: item.productId._id,
    name:      item.productId.name,
    price:     item.productId.price,
    qty:       item.qty,
    image:     item.productId.images?.[0] || null,
  }));

  const order = await Order.create({
    user: req.user,
    items: orderItems,
    subtotal,
    tax,
    shipping,
    couponDiscount,
    couponCode: couponCodeApplied,
    totalAmount,
    shippingAddress,
    status: "processing", // direct checkout = processing
    paymentStatus: "paid",
  });

  // Decrement stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.productId._id, { $inc: { stock: -item.qty } });
  }

  await Cart.findOneAndDelete({ user: req.user });

  res.status(201).json(order);
};

// GET /orders/me
const getMyOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { user: req.user };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .exec();

  const total = await Order.countDocuments(query);
  res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / limit) });
};

// GET /orders/:id
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).exec();
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user !== req.user) return res.status(403).json({ message: "Forbidden" });
  res.json(order);
};

// PATCH /orders/:id/cancel  (user self-cancel)
const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).exec();
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.user !== req.user) return res.status(403).json({ message: "Forbidden" });
  if (!order.canTransitionTo("cancelled")) {
    return res.status(400).json({ message: `Cannot cancel an order in '${order.status}' status` });
  }
  order.status = "cancelled";
  await order.save();
  res.json(order);
};

// PATCH /admin/orders/:id/status  (admin)
const updateOrderStatus = async (req, res) => {
  const { status, adminNote } = req.body;
  const order = await Order.findById(req.params.id).exec();
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (!order.canTransitionTo(status)) {
    return res.status(400).json({
      message: `Invalid transition: ${order.status} → ${status}`,
    });
  }
  order.status = status;
  if (adminNote) order.adminNote = adminNote;
  if (status === "refunded") order.paymentStatus = "refunded";
  await order.save();
  res.json(order);
};

// GET /admin/orders
const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.user = { $regex: search, $options: "i" };

  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Order.countDocuments(query),
  ]);

  res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / limit) });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
};
