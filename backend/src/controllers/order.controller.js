const Order = require("../models/Order");
const Cart = require("../models/Cart");

// POST /orders
const createOrder = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user })
    .populate("items.productId")
    .exec();

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.qty * item.productId.price,
    0
  );

  const order = await Order.create({
    user: req.user,
    items: cart.items,
    totalAmount,
  });

  await Cart.findOneAndDelete({ user: req.user });

  res.status(201).json(order);
};

// GET /orders/me
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user })
    .sort({ createdAt: -1 })
    .exec();

  res.json(orders);
};

module.exports = {
  createOrder,
  getMyOrders,
};
