const Cart = require("../models/Cart");
const Product = require("../models/Product");

// GET /cart
const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user })
    .populate("items.productId")
    .exec();

  if (!cart) {
    return res.json({ items: [] });
  }

  res.json(cart);
};

// POST /cart
const addToCart = async (req, res) => {
  const { productId, qty } = req.body;

  if (!productId || !qty) {
    return res.status(400).json({ message: "Product and quantity required" });
  }

  const product = await Product.findById(productId).exec();
  if (!product || product.isDeleted) {
    return res.status(404).json({ message: "Product not found" });
  }

  let cart = await Cart.findOne({ user: req.user }).exec();

  if (!cart) {
    cart = await Cart.create({
      user: req.user,
      items: [{ productId, qty }],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({ productId, qty });
    }

    await cart.save();
  }

  res.status(201).json(cart);
};

// PUT /cart
const updateCartItem = async (req, res) => {
  const { productId, qty } = req.body;

  const cart = await Cart.findOne({ user: req.user }).exec();
  if (!cart) return res.sendStatus(404);

  const item = cart.items.find(
    (i) => i.productId.toString() === productId
  );

  if (!item) return res.sendStatus(404);

  item.qty = qty;
  await cart.save();

  res.json(cart);
};

// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user }).exec();
  if (!cart) return res.sendStatus(404);

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== req.params.productId
  );

  await cart.save();
  res.json(cart);
};

// DELETE /cart
const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user });
  res.sendStatus(204);
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
