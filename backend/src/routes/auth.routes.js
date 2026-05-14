const express = require("express");
const router  = express.Router();

const { login }          = require("../controllers/auth.controller");
const { register }       = require("../controllers/register.controller");
const { refreshToken }   = require("../controllers/refresh.controller");
const { logout }         = require("../controllers/logout.controller");
const { forgotPassword, resetPassword } = require("../controllers/password.controller");

const loginLimiter = require("../middleware/rateLimiter");

router.post("/login",    loginLimiter, login);
router.post("/register", register);
router.get("/refresh",   refreshToken);
router.post("/logout",   logout);

// Password reset (public — no JWT needed)
router.post("/forgot-password",          forgotPassword);
router.post("/reset-password/:token",    resetPassword);

module.exports = router;
