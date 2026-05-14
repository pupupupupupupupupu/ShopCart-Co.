const express = require("express");
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

const verifyJWT = require("../middleware/verifyJWT");

// All cart routes are protected
router.use(verifyJWT);

// GET /cart
router.get("/", getCart);

// POST /cart
router.post("/", addToCart);

// PUT /cart
router.put("/", updateCartItem);

// DELETE /cart/:productId
router.delete("/:productId", removeFromCart);

// DELETE /cart
router.delete("/", clearCart);

module.exports = router;
