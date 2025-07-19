// routes/socialReviews.js
const express = require("express");
const Restaurant = require("../models/Restaurant");
const { fetchGoogleReviews } = require("../utils/googleReviews");
const router = express.Router();

router.get("/:rid/social-reviews", async (req, res) => {
  const r = await Restaurant.findById(req.params.rid);
  if (!r) return res.status(404).json({ error: "Not found" });

  try {
   const google = r.googlePlaceId
     ? await fetchGoogleReviews(r.googlePlaceId)
     : [];
    res.json({google});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

module.exports = router;
