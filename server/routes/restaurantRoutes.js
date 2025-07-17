// routes/restaurantRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware").verifyToken;
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const upload = require("../middleware/multer");
  const { getFacebookReviews, getInstagramReviews } = require("../utils/socialReviews");


// — CREATE a new restaurant (with quota check AND API-fields) —
router.post("/", protect, async (req, res) => {
  try {
    // 1) load user & count existing
    const user      = await User.findById(req.user._id);
    const usedCount = await Restaurant.countDocuments({ owner: user._id });

    // 2) quota guard
    if (usedCount >= user.allowedRestaurants) {
      return res
        .status(403)
        .json({ msg: "You reached your restaurant limit. Upgrade your plan." });
    }

    // 3) debug log
    console.log("→ create-restaurant payload:", req.body);

    // 4) pull out all fields
    const {
      name,
      socialLinks = {},
      facebookPageId,
      facebookPageToken,
      instagramBusinessId,
      instagramAccessToken,
    } = req.body;

    // 5) create & return
    const restaurant = await Restaurant.create({
      name,
      owner: req.user._id,
      socialLinks,
      facebookPageId,
      facebookPageToken,
      instagramBusinessId,
      instagramAccessToken,
    });

    return res.status(201).json(restaurant);
  } catch (err) {
    console.error("❌ Create restaurant error:", err);
    return res.status(500).json({ msg: "Failed to create restaurant" });
  }
});


router.get("/:id/reviews", protect, async (req, res) => {
  try {
    const rest = await Restaurant.findById(req.params.id);
    if (!rest) return res.sendStatus(404);

    const [fb, ig] = await Promise.all([
      getFacebookReviews(rest.facebookPageId,     rest.facebookPageToken),
      getInstagramReviews(rest.instagramBusinessId, rest.instagramAccessToken),
    ]);

    // merge, sort descending by date, and cap at, say, 10 total
    const combined = [...fb, ...ig]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);

    res.json(combined);
  } catch (err) {
    console.error("Fetch reviews error:", err);
    res.status(500).json({ msg: "Could not fetch reviews" });
  }
});


// — LIST all restaurants for this user —
router.get("/", protect, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    return res.json(restaurants);
  } catch (err) {
    console.error("Fetch restaurants error:", err);
    return res.status(500).json({ msg: "Failed to fetch restaurants" });
  }
});

// — DELETE a restaurant —
router.delete("/:id", protect, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    return res.json({ msg: "Restaurant deleted" });
  } catch (err) {
    console.error("Delete restaurant error:", err);
    return res.status(500).json({ msg: "Failed to delete restaurant" });
  }
});

// — SAVE selected template for a restaurant —
router.put("/:id/template", protect, async (req, res) => {
  const { selectedTemplate } = req.body;
  if (!selectedTemplate) {
    return res.status(400).json({ msg: "Template ID required" });
  }
  try {
    const updated = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { selectedTemplate },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    return res.json({ msg: "Template saved successfully!", data: updated });
  } catch (err) {
    console.error("Save template error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// — MENU ITEM ROUTES —

// Add a menu item (with image upload)
router.post(
  "/:restaurantId/menu",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, category } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const menuItem = await MenuItem.create({
        restaurant: req.params.restaurantId,
        name,
        description,
        price,
        category,
        imageUrl,
      });

      return res.status(201).json(menuItem);
    } catch (err) {
      console.error("Add menu item error:", err);
      return res.status(500).json({ msg: "Failed to add menu item" });
    }
  }
);

// List menu items for a restaurant
router.get("/:restaurantId/menu", protect, async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.restaurantId });
    return res.json(items);
  } catch (err) {
    console.error("Fetch menu items error:", err);
    return res.status(500).json({ msg: "Failed to fetch menu items" });
  }
});

module.exports = router;
