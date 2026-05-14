const Coupon = require("../models/Coupon");

// GET /admin/coupons
const getCoupons = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const [coupons, total] = await Promise.all([
    Coupon.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Coupon.countDocuments(),
  ]);
  res.json({ coupons, total });
};

// POST /admin/coupons
const createCoupon = async (req, res) => {
  const { code, type, value, minCartValue, maxUses, expiresAt, isActive } = req.body;
  if (!code || !type || value === undefined) {
    return res.status(400).json({ message: "code, type, value required" });
  }
  if (!["percent", "fixed"].includes(type)) {
    return res.status(400).json({ message: "type must be 'percent' or 'fixed'" });
  }
  if (type === "percent" && value > 100) {
    return res.status(400).json({ message: "Percent discount cannot exceed 100" });
  }
  const coupon = await Coupon.create({
    code, type, value, minCartValue, maxUses, expiresAt, isActive,
    createdBy: req.user,
  });
  res.status(201).json(coupon);
};

// PUT /admin/coupons/:id
const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id).exec();
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });

  const fields = ["type", "value", "minCartValue", "maxUses", "expiresAt", "isActive"];
  fields.forEach((f) => { if (req.body[f] !== undefined) coupon[f] = req.body[f]; });

  await coupon.save();
  res.json(coupon);
};

// DELETE /admin/coupons/:id
const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id).exec();
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  await coupon.deleteOne();
  res.json({ message: "Coupon deleted" });
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon };
