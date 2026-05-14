const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    label:     { type: String, default: "Home" },
    street:    { type: String, required: true },
    city:      { type: String, required: true },
    state:     { type: String, required: true },
    zip:       { type: String, required: true },
    country:   { type: String, default: "US" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    roles: {
      User:  { type: Number, default: 2001 },
      Admin: Number,
    },
    refreshToken: String,
    active:   { type: Boolean, default: true },
    email:    { type: String, trim: true },        // NO index:true here
    fullName: { type: String, trim: true },
    addresses: [addressSchema],
    wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    passwordResetToken:   String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

// Single definition — no duplicate
userSchema.index({ email: 1 }, { sparse: true });

module.exports = mongoose.model("User", userSchema);
