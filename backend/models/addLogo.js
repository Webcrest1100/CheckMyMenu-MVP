const mongoose = require("mongoose");

const addLogoSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
 logo: { type: String, required: false, default: "" }
,
});

module.exports = mongoose.model("AddLogo", addLogoSchema);
