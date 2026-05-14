const express = require("express");
const router = express.Router();
const {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
} = require("../controllers/product.controller");
const { addReview } = require("../controllers/review.controller");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const upload = require("../middleware/upload");
const ROLES = require("../config/roles");

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Authenticated — reviews
router.post("/:id/reviews", verifyJWT, addReview);

// Admin only
router.post("/admin", verifyJWT, verifyRoles(ROLES.Admin), upload.array("images", 5), createProduct);
router.put("/admin/:id", verifyJWT, verifyRoles(ROLES.Admin), upload.array("images", 5), updateProduct);
router.delete("/admin/:id", verifyJWT, verifyRoles(ROLES.Admin), deleteProduct);

module.exports = router;
