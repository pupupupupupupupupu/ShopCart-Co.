const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

// POST /products/:id/reviews
const addReview = async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  const product = await Product.findById(req.params.id).exec();
  if (!product || product.isDeleted) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Verify user has purchased and received this product
  const hasPurchased = await Order.findOne({
    user: req.user,
    status: "delivered",
    "items.productId": product._id,
  });
  if (!hasPurchased) {
    return res.status(403).json({ message: "You can only review products you have received" });
  }

  // One review per user per product
  const alreadyReviewed = product.reviews.some(
    (r) => r.username === req.user
  );
  if (alreadyReviewed) {
    return res.status(400).json({ message: "You have already reviewed this product" });
  }

  const userDoc = await User.findOne({ username: req.user });

  product.reviews.push({
    userId:   userDoc._id,
    username: req.user,
    rating:   Number(rating),
    comment:  comment?.trim() || "",
  });
  product.recalcRating();
  await product.save();

  res.status(201).json({
    ratingAvg: product.ratingAvg,
    ratingCount: product.ratingCount,
    review: product.reviews[product.reviews.length - 1],
  });
};

// DELETE /products/:id/reviews/:reviewId  (admin)
const deleteReview = async (req, res) => {
  const product = await Product.findById(req.params.id).exec();
  if (!product) return res.status(404).json({ message: "Product not found" });

  const review = product.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ message: "Review not found" });

  review.deleteOne();
  product.recalcRating();
  await product.save();

  res.json({ message: "Review removed" });
};

module.exports = { addReview, deleteReview };
