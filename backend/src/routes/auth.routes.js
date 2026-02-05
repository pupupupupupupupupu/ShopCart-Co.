const express = require("express");
const router = express.Router();

const { login } = require("../controllers/auth.controller");
const { register } = require("../controllers/register.controller");
const { refreshToken } = require("../controllers/refresh.controller");
const { logout } = require("../controllers/logout.controller");

const loginLimiter = require("../middleware/rateLimiter");

// POST /auth/login
router.post("/login", loginLimiter, login);

// POST /auth/register
router.post("/register", register);

// GET /auth/refresh
router.get("/refresh", refreshToken);

// POST /auth/logout
router.post("/logout", logout);

module.exports = router;
