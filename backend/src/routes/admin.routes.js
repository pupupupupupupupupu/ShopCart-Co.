const express = require("express");
const router = express.Router();
const {
  getAllUsers, disableUser, enableUser, getAdminStats, getAnalytics,
} = require("../controllers/admin.controller");
const {
  updateOrderStatus, getAllOrders,
} = require("../controllers/order.controller");
const { deleteReview } = require("../controllers/review.controller");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

router.use(verifyJWT);
router.use(verifyRoles(ROLES.Admin));

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/disable", disableUser);
router.patch("/users/:id/enable", enableUser);

// Stats & analytics
router.get("/stats", getAdminStats);
router.get("/analytics", getAnalytics);

// Orders
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

// Reviews (moderation)
router.delete("/products/:id/reviews/:reviewId", deleteReview);

module.exports = router;
