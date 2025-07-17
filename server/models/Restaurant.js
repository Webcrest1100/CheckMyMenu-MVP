const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    website: String,
  },
  selectedTemplate: { type: Number, default: 1 },
  // googlePlaceId: { type: String }, // e.g. "ChIJN1t_tDeuEmsRUsoyG83frY4"
  // facebookPageId: { type: String }, // e.g. "123456789012345"
  // instagramAccountId: { type: String }, // e.g. "17841400000000000"
  // ← new fields, all optional
  facebookPageId:      String,
  facebookPageToken:   String,
  instagramBusinessId: String,
  instagramAccessToken:String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
