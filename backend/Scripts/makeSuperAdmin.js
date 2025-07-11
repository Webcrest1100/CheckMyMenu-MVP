// backend/scripts/makeSuperAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User     = require("../models/User");    // ← note the “..”

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const u = await User.findOneAndUpdate(
      { email: "Mehraba46@gmail.com" },
      { role: "superadmin" }
    );
    if (!u) console.error("❌ No user with that email");
    else    console.log("✅ Promoted to superadmin");
  })
  .catch(console.error)
  .finally(() => process.exit());
