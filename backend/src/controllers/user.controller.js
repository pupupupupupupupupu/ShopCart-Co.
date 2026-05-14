const User = require("../models/User");
const Order = require("../models/Order");
const bcrypt = require("bcrypt");
const Product = require("../models/Product");

// GET /users/me
const getProfile = async (req, res) => {
  const user = await User.findOne({ username: req.user })
    .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
    .populate("wishlist", "name price images ratingAvg stock isDeleted")
    .exec();

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// PUT /users/me
const updateProfile = async (req, res) => {
  const { fullName, email, currentPassword, newPassword } = req.body;

  const user = await User.findOne({ username: req.user }).exec();
  if (!user) return res.status(404).json({ message: "User not found" });

  if (fullName !== undefined) user.fullName = fullName.trim();
  if (email !== undefined) user.email = email.trim().toLowerCase();

  if (newPassword) {
    if (!currentPassword) return res.status(400).json({ message: "Current password required" });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });
    if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  res.json({ message: "Profile updated" });
};

// GET /users/me/orders (alias kept for backward compat)
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user }).sort({ createdAt: -1 }).exec();
  res.json(orders);
};

// ─── ADDRESSES ───────────────────────────────────────────

// GET /users/me/addresses
const getAddresses = async (req, res) => {
  const user = await User.findOne({ username: req.user }).select("addresses").exec();
  res.json(user.addresses);
};

// POST /users/me/addresses
const addAddress = async (req, res) => {
  const { label, street, city, state, zip, country, isDefault } = req.body;
  if (!street || !city || !state || !zip) {
    return res.status(400).json({ message: "street, city, state, zip are required" });
  }

  const user = await User.findOne({ username: req.user }).exec();

  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push({ label, street, city, state, zip, country, isDefault: !!isDefault });
  await user.save();
  res.status(201).json(user.addresses);
};

// PUT /users/me/addresses/:addressId
const updateAddress = async (req, res) => {
  const user = await User.findOne({ username: req.user }).exec();
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ message: "Address not found" });

  const { label, street, city, state, zip, country, isDefault } = req.body;
  if (label !== undefined) addr.label = label;
  if (street !== undefined) addr.street = street;
  if (city !== undefined) addr.city = city;
  if (state !== undefined) addr.state = state;
  if (zip !== undefined) addr.zip = zip;
  if (country !== undefined) addr.country = country;

  if (isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
    addr.isDefault = true;
  }

  await user.save();
  res.json(user.addresses);
};

// DELETE /users/me/addresses/:addressId
const deleteAddress = async (req, res) => {
  const user = await User.findOne({ username: req.user }).exec();
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ message: "Address not found" });
  addr.deleteOne();
  await user.save();
  res.json({ message: "Address removed" });
};

// ─── WISHLIST ─────────────────────────────────────────────

// POST /users/me/wishlist/:productId  (toggle)
const toggleWishlist = async (req, res) => {
  const user = await User.findOne({ username: req.user }).exec();
  const productId = req.params.productId;

  const idx = user.wishlist.findIndex((id) => id.toString() === productId);
  let action;
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
    action = "removed";
  } else {
    const exists = await Product.findById(productId).exec();
    if (!exists || exists.isDeleted) return res.status(404).json({ message: "Product not found" });
    user.wishlist.push(productId);
    action = "added";
  }

  await user.save();
  res.json({ action, wishlist: user.wishlist });
};

// GET /users/me/wishlist
const getWishlist = async (req, res) => {
  const user = await User.findOne({ username: req.user })
    .populate("wishlist", "name price images ratingAvg stock isDeleted")
    .exec();
  const active = (user.wishlist || []).filter((p) => !p.isDeleted);
  res.json(active);
};

module.exports = {
  getProfile,
  updateProfile,
  getMyOrders,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
};
