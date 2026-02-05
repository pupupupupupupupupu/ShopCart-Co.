const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  disableUser,
  enableUser,
  getAdminStats,
} = require("../controllers/admin.controller");

const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

// All admin routes are protected
router.use(verifyJWT);
router.use(verifyRoles(ROLES.Admin));

// GET /admin/users
router.get("/users", getAllUsers);

// PATCH /admin/users/:id/disable
router.patch("/users/:id/disable", disableUser);

// PATCH /admin/users/:id/enable
router.patch("/users/:id/enable", enableUser);

// GET /admin/stats
router.get("/stats", getAdminStats);

module.exports = router;
