const User = require("../models/User");
const Order = require("../models/Order");

// GET /users/me
const getProfile = async (req, res) => {
  const user = await User.findOne({ username: req.user })
    .select("-password -refreshToken")
    .exec();

  if (!user) return res.sendStatus(404);

  res.json(user);
};

// GET /orders/me
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user })
    .sort({ createdAt: -1 })
    .exec();

  res.json(orders);
};

module.exports = {
  getProfile,
  getMyOrders,
};
