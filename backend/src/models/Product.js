const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },
    comment:  { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    price:       { type: Number, required: true, min: 0 },
    description: { type: String },
    category:    { type: String, trim: true, index: true },
    tags:        [String],
    images:      [String], // Cloudinary URLs
    stock:       { type: Number, default: 0, min: 0 },
    isDeleted:   { type: Boolean, default: false },
    createdBy:   { type: String, required: true },

    // Reviews & ratings (denormalized for performance)
    reviews:     [reviewSchema],
    ratingAvg:   { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Indexes
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, isDeleted: 1 });
productSchema.index({ price: 1, isDeleted: 1 });
productSchema.index({ stock: 1 });

// Recalculate rating avg when reviews change
productSchema.methods.recalcRating = function () {
  if (!this.reviews.length) { this.ratingAvg = 0; this.ratingCount = 0; return; }
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  this.ratingCount = this.reviews.length;
  this.ratingAvg = Math.round((sum / this.ratingCount) * 10) / 10;
};

module.exports = mongoose.model("Product", productSchema);
