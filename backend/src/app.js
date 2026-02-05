require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const corsOptions = require("./config/corsOptions");
const credentials = require("./middleware/credentials");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/* =========================
   GLOBAL MIDDLEWARE
========================= */

// Custom request logger
app.use(logger);

// Handle credentials BEFORE CORS
app.use(credentials);

// CORS
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookies
app.use(cookieParser());

/* =========================
   ROUTES
========================= */

// Auth
app.use("/auth", require("./routes/auth.routes"));
app.use("/refresh", require("./routes/auth.routes")); // refresh handled inside
app.use("/logout", require("./routes/auth.routes"));

// Core features
app.use("/products", require("./routes/product.routes"));
app.use("/cart", require("./routes/cart.routes"));
app.use("/users", require("./routes/user.routes"));
app.use("/orders", require("./routes/order.routes"));

// Admin
app.use("/admin", require("./routes/admin.routes"));

/* =========================
   404 HANDLER
========================= */

app.all("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* =========================
   ERROR HANDLER (LAST)
========================= */

app.use(errorHandler);

module.exports = app;
