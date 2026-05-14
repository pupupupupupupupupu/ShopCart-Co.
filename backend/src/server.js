require("dotenv").config();   // MUST be first — loads .env before anything else runs

const http     = require("http");
const mongoose = require("mongoose");
const app      = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3500;

connectDB();

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
  http.createServer(app).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
