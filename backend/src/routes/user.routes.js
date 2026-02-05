const express = require("express");
const router = express.Router();

const {
  getProfile,
  getMyOrders,
} = require("../controllers/user.controller");

const verifyJWT = require("../middleware/verifyJWT");

// All user routes are protected
router.use(verifyJWT);

// GET /users/me
router.get("/me", getProfile);

// GET /users/orders
router.get("/orders", getMyOrders);

module.exports = router;
