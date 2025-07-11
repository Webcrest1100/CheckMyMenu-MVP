// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   allowedRestaurants: { type: Number, default: 0},
//     role: {
//     type: String,
//     enum: ["user", "admin", "superadmin"],
//     default: "user",
//   },
//    resetToken:       String,
//   resetTokenExpiry: Date,
//    stripeSubscriptionId: { type: String },
//   subscriptionStatus:   { type: String },  // e.g. 'active', 'past_due', 'canceled'
//   currentPeriodEnd:     { type: Date }

// });

// module.exports = mongoose.model('User', userSchema);

// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin", "superadmin"],
    default: "user",
  },
  stripeSubscriptionId: { type: String },
  subscriptionStatus: { type: String },
  currentPeriodEnd: { type: Date },
  allowedRestaurants: { type: Number, default: 0 },
  resetToken:          { type: String },
  resetTokenExpiry:    { type: Number },  // store as ms-since-epoch
});

module.exports = mongoose.model("User", userSchema);
