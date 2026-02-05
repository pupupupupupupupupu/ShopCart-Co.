const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
} = require("../controllers/order.controller");

const verifyJWT = require("../middleware/verifyJWT");

// All order routes require login
router.use(verifyJWT);

// POST /orders
router.post("/", createOrder);

// GET /orders/me
router.get("/me", getMyOrders);

module.exports = router;
