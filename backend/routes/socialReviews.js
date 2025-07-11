// routes/socialReviews.js
const express = require("express");
const Restaurant = require("../models/Restaurant");
const {
  fetchGoogleReviews,
  fetchFacebookReviews,
  fetchInstagramComments,
} = require("../services/socialReviews");
const router = express.Router();

router.get("/:rid/social-reviews", async (req, res) => {
  const r = await Restaurant.findById(req.params.rid);
  if (!r) return res.status(404).json({ error: "Not found" });

  try {
    const [google = [], facebook = [], instagram = []] = await Promise.all([
      r.googlePlaceId ? fetchGoogleReviews(r.googlePlaceId) : [],
      r.facebookPageId ? fetchFacebookReviews(r.facebookPageId) : [],
      r.instagramAccountId ? fetchInstagramComments(r.instagramAccountId) : [],
    ]);
    res.json({ google, facebook, instagram });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch social reviews" });
  }
});

module.exports = router;
