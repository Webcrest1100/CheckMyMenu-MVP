const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function verifyToken(req, res, next) {
 
  console.log("🔐 auth header:", req.headers.authorization);

  const header = req.headers.authorization;
  if (!header) {
    console.log("🔐 Missing Authorization header");
    return res.status(401).json({ error: "No token provided" });
  }

  const [scheme, token] = header.split(" ");
  console.log("🔐 scheme:", scheme, "token:", token);

  if (scheme !== "Bearer" || !token) {
    console.log("🔐 Malformed auth header");
    return res.status(401).json({ error: "Malformed token header" });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 jwt payload.id =", id);
    const user = await User.findById(id);
    if (!user) {
      console.log("🔐 No user for that token id");
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("🔐 jwt.verify error:", err.message);
    return res.status(401).json({ error: "Token verification failed" });
  }
}

function requireAdmin(req, res, next) {
  // both "admin" and "superadmin" can do admin tasks
  if (req.user.role === "admin" || req.user.role === "superadmin") {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
}

function requireSuperAdmin(req, res, next) {
  if (req.user.role === "superadmin") {
    return next();
  }
  res.status(403).json({ error: "Superadmin access required" });
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireSuperAdmin,
};
