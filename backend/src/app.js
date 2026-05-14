require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const corsOptions   = require("./config/corsOptions");
const credentials   = require("./middleware/credentials");
const logger        = require("./middleware/logger");
const errorHandler  = require("./middleware/errorHandler");

const app = express();

/* ══════════════════════════════════════════
   WEBHOOK RAW BODY — must be BEFORE express.json()
══════════════════════════════════════════ */
app.use("/payments/stripe/webhook",   express.raw({ type: "application/json" }));
// Razorpay webhook uses express.json() — handled inside the route

/* ══════════════════════════════════════════
   GLOBAL MIDDLEWARE
══════════════════════════════════════════ */
app.use(logger);
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ══════════════════════════════════════════
   ROUTES
══════════════════════════════════════════ */
app.use("/auth",     require("./routes/auth.routes"));
app.use("/refresh",  require("./routes/auth.routes"));
app.use("/logout",   require("./routes/auth.routes"));

app.use("/products", require("./routes/product.routes"));
app.use("/cart",     require("./routes/cart.routes"));
app.use("/users",    require("./routes/user.routes"));
app.use("/orders",   require("./routes/order.routes"));
app.use("/payments", require("./routes/payment.routes"));

app.use("/admin",         require("./routes/admin.routes"));
app.use("/admin/coupons", require("./routes/coupon.routes"));

/* ══════════════════════════════════════════
   HEALTH CHECK
══════════════════════════════════════════ */
app.get("/health", (req, res) =>
  res.json({ status: "ok", ts: new Date().toISOString() })
);

/* ══════════════════════════════════════════
   404 + ERROR HANDLER (last)
══════════════════════════════════════════ */
app.all("*", (req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

module.exports = app;
