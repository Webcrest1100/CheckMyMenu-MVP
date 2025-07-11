// backend/scripts/createSuperAdmin.js
require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../models/User");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const email    = "Mehraba46@gmail.com";
  const password = "Testing123";
  const hash     = await bcrypt.hash(password, 12);

  const user = await User.findOneAndUpdate(
    { email },
    {
      email,
      password:           hash,
      allowedRestaurants: 0,
      role:               "superadmin",
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Superadmin ready: ${user.email} / password: ${password}`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
