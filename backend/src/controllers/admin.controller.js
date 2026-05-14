const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET /admin/users
const getAllUsers = async (req, res) => {
  const users = await User.find()
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
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
  const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ isDeleted: false }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
};

// GET /admin/analytics
const getAnalytics = async (req, res) => {
  const { days = 30 } = req.query;
  const since = new Date();
  since.setDate(since.getDate() - Number(days));

  // Daily revenue
  const dailyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top products by revenue
  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        name:     { $first: "$items.name" },
        revenue:  { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        unitsSold:{ $sum: "$items.qty" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
  ]);

  // Order status breakdown
  const statusBreakdown = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  // Low stock alert
  const lowStock = await Product.find({ stock: { $lte: 10 }, isDeleted: false })
    .select("name stock")
    .sort({ stock: 1 })
    .limit(10);

  res.json({ dailyRevenue, topProducts, statusBreakdown, lowStock });
};

module.exports = {
  getAllUsers,
  disableUser,
  enableUser,
  getAdminStats,
  getAnalytics,
};
