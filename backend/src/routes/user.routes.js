const express = require("express");
const router = express.Router();
const {
  getProfile, updateProfile, getMyOrders,
  getAddresses, addAddress, updateAddress, deleteAddress,
  toggleWishlist, getWishlist,
} = require("../controllers/user.controller");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.get("/orders", getMyOrders);

// Addresses
router.get("/me/addresses", getAddresses);
router.post("/me/addresses", addAddress);
router.put("/me/addresses/:addressId", updateAddress);
router.delete("/me/addresses/:addressId", deleteAddress);

// Wishlist
router.get("/me/wishlist", getWishlist);
router.post("/me/wishlist/:productId", toggleWishlist);

module.exports = router;
