// controllers/authController.js
const User      = require("../models/User");
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  const { email, password, restaurantName } = req.body;

  try {
    // 1) check existing
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // 2) hash & create
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      restaurantName,
    });

    // 3) send welcome email to user
    sendEmail({
      to: user.email,
      subject: "Welcome to CheckMyMenu!",
      html: `
        <p>Hi ${user.email},</p>
        <p>Thanks for registering at CheckMyMenu. 🎉<br/>
        You can now log in and start adding your restaurant.</p>
      `,
    }).catch(err => console.error("Welcome email error:", err));

    // 4) notify admin
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: "🆕 New user signed up",
      html: `
        <p>A new user has just registered:</p>
        <ul>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>User ID:</strong> ${user._id}</li>
        </ul>
      `,
    }).catch(err => console.error("Admin notification email error:", err));

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(201).json({ token });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
