const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:         { type: String, enum: ["percent", "fixed"], required: true },
    value:        { type: Number, required: true, min: 0 },
    minCartValue: { type: Number, default: 0, min: 0 },
    maxUses:      { type: Number, default: null },
    usedCount:    { type: Number, default: 0, min: 0 },
    expiresAt:    { type: Date, default: null },
    isActive:     { type: Boolean, default: true },
    createdBy:    { type: String, required: true },
  },
  { timestamps: true }
);

// unique:true on the field already creates the index — no schema.index() needed
couponSchema.index({ isActive: 1, expiresAt: 1 });

couponSchema.methods.isValid = function (cartTotal) {
  if (!this.isActive)
    return { valid: false, reason: "Coupon is inactive" };
  if (this.expiresAt && new Date() > this.expiresAt)
    return { valid: false, reason: "Coupon has expired" };
  if (this.maxUses !== null && this.usedCount >= this.maxUses)
    return { valid: false, reason: "Coupon usage limit reached" };
  if (cartTotal < this.minCartValue)
    return { valid: false, reason: `Minimum cart value $${this.minCartValue.toFixed(2)} required` };
  return { valid: true };
};

couponSchema.methods.calcDiscount = function (cartTotal) {
  if (this.type === "percent") return Math.min(cartTotal, (cartTotal * this.value) / 100);
  return Math.min(cartTotal, this.value);
};

module.exports = mongoose.model("Coupon", couponSchema);
