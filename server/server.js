const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const restaurantRoutes = require("./routes/restaurantRoutes");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const publicRoutes = require("./routes/public");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// CORS
app.use(cors());

//
// 1) Webhook endpoint with raw body parser
//
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

//
// 2) All other JSON routes
//
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
// app.use("/api/restaurants", socialReviews);
app.use("/api/restaurants", menuRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/subscribe", subscriptionRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB error:", err));
