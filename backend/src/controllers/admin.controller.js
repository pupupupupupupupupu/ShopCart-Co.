const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET /admin/users
const getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password -refreshToken")
    .exec();

  res.json(users);
};

// PATCH /admin/users/:id/disable
const disableUser = async (req, res) => {
  const user = await User.findById(req.params.id).exec();
  if (!user) return res.sendStatus(404);

  user.active = false;
  await user.save();

  res.json({ message: "User disabled" });
};

// PATCH /admin/users/:id/enable
const enableUser = async (req, res) => {
  const user = await User.findById(req.params.id).exec();
  if (!user) return res.sendStatus(404);

  user.active = true;
  await user.save();

  res.json({ message: "User enabled" });
};

// GET /admin/stats
const getAdminStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments({ isDeleted: false });
  const totalOrders = await Order.countDocuments();

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
  });
};

module.exports = {
  getAllUsers,
  disableUser,
  enableUser,
  getAdminStats,
};
