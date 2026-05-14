const express = require("express");
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/coupon.controller");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES = require("../config/roles");

router.use(verifyJWT);
router.use(verifyRoles(ROLES.Admin));

router.get("/", getCoupons);
router.post("/", createCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
