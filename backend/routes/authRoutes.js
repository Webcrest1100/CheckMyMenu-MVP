const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { verifyToken: protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant"); 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");



// Add this route at the bottom
router.get("/me", protect, async (req, res) => {
  res.json(req.user); // req.user is set in the protect middleware
});

router.post("/register", register);
router.post("/login", login);

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ msg: "User not found with this email" });

    // 1) generate & store the reset token + expiry
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    user.resetToken       = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // 2) email the link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendEmail({
      to:      user.email,
      subject: "Reset Your Password",
      text:    `Click here to reset your password: ${resetLink}`,
    });

    // 3) respond once
    const usedCount = await Restaurant.countDocuments({ owner: user._id });
    return res.json({
      msg:                 "Reset link sent to email",
      email:               user.email,
      allowedRestaurants:  user.allowedRestaurants,
      usedRestaurants:     usedCount,
      subscriptionStatus:  user.subscriptionStatus,
      currentPeriodEnd:    user.currentPeriodEnd,
    });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err.message);
    return res.status(500).json({ msg: "Server error while sending reset link" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);
    if (
      !user ||
      user.resetToken !== token ||
      Date.now() > user.resetTokenExpiry
    ) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // ── HERE: hash the new password ──
    const salt     = await bcrypt.genSalt(12);
    const hashPass = await bcrypt.hash(password, salt);
    user.password  = hashPass;

    // clear out reset fields
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ msg: "Password reset successful" });
  } catch (err) {
    console.error("Reset error:", err.message);
    res.status(500).json({ msg: "Failed to reset password" });
  }
});



module.exports = router;
