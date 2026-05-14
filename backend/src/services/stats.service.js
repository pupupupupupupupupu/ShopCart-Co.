const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getPlatformStats = async () => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments({ isDeleted: false });
  const totalOrders = await Order.countDocuments();

  return {
    totalUsers,
    totalProducts,
    totalOrders,
  };
};

module.exports = {
  getPlatformStats,
};
