const express = require("express");
const router = express.Router();
const {
  createOrder, getMyOrders, getOrderById, cancelOrder,
} = require("../controllers/order.controller");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.post("/", createOrder);
router.get("/me", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);

module.exports = router;
