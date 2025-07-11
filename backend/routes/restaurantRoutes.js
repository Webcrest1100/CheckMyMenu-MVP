// const express = require("express");
// const router = express.Router();
// const protect = require("../middleware/authMiddleware");
// const Restaurant = require("../models/Restaurant");
// const MenuItem = require("../models/MenuItem");
// const upload = require("../middleware/multer");

// // Create a restaurant
// router.post("/", protect, async (req, res) => {
//   try {
//     const restaurant = await Restaurant.create({
//       name: req.body.name,
//       owner: req.user._id,
//       socialLinks: req.body.socialLinks || {},
//     });
//     res.status(201).json(restaurant);

//     const user = await User.findById(req.user.id);
// const restaurantCount = await Restaurant.countDocuments({ owner: user._id });

// if (restaurantCount >= user.allowedRestaurants) {
//   return res.status(403).json({ msg: "You reached your restaurant limit. Upgrade your plan." });
// }

//   } catch (err) {
//     res.status(500).json({ msg: "Failed to create restaurant" });
//   }
// });

// // Get all restaurants for a user
// router.get("/", protect, async (req, res) => {
//   try {
//     const restaurants = await Restaurant.find({ owner: req.user._id });
//     res.json(restaurants);
//   } catch (err) {
//     res.status(500).json({ msg: "Failed to fetch restaurants" });
//   }
// });

// router.post("/:restaurantId/menu", protect, upload.single("image"), async (req, res) => {
//   try {
//     const { name, description, price, category } = req.body;
//     const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

//     const menuItem = await MenuItem.create({
//       restaurant: req.params.restaurantId,
//       name,
//       description,
//       price,
//       category,
//       imageUrl,
//     });

//     res.status(201).json(menuItem);
//   } catch (err) {
//     console.error("Failed to add menu item", err.message);
//     res.status(500).json({ msg: "Failed to add menu item", error: err.message });
//   }
// });

// // Get menu items for a restaurant
// router.get("/:restaurantId/menu", protect, async (req, res) => {
//   try {
//     const items = await MenuItem.find({ restaurant: req.params.restaurantId });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ msg: "Failed to fetch menu items" });
//   }
// });

// // Update restaurant social links
// router.put("/:restaurantId/social-links", protect, async (req, res) => {
//   try {
//     const updated = await Restaurant.findByIdAndUpdate(
//       req.params.restaurantId,
//       { socialLinks: req.body.socialLinks },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ msg: "Failed to update social links" });
//   }
// });

// // routes/restaurantRoutes.js
// router.post("/", protect, async (req, res) => {
//   const { name } = req.body;
//   const newRestaurant = new Restaurant({
//     name,
//     owner: req.user._id,
//   });
//   await newRestaurant.save();
//   res.json(newRestaurant);
// });

// router.put("/restaurants/:id/template", async (req, res) => {
//   const { id } = req.params;
//   const { selectedTemplate } = req.body;

//   if (!selectedTemplate) {
//     return res.status(400).json({ msg: "Template ID required" });
//   }

//   try {
//     const updated = await Restaurant.findByIdAndUpdate(
//       id,
//       { selectedTemplate },
//       { new: true }
//     );
//     if (!updated) {
//       return res.status(404).json({ msg: "Restaurant not found" });
//     }
//     res.json({ msg: "Template saved successfully!", data: updated });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// // ✅ DO NOT add '/restaurants' again here
// router.delete('/:id', protect, async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
//     if (!restaurant) {
//       return res.status(404).json({ msg: "Restaurant not found" });
//     }
//     res.json({ msg: "Restaurant deleted" });
//   } catch (err) {
//     console.error("Delete error:", err.message);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

// module.exports = router;

// routes/restaurantRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware").verifyToken;
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const upload = require("../middleware/multer");

// — CREATE a new restaurant (with quota check) —
router.post("/", protect, async (req, res) => {
  try {
    // 1) load user
    const user = await User.findById(req.user._id);
    const usedCount = await Restaurant.countDocuments({ owner: user._id });

    // 2) check quota
    if (usedCount >= user.allowedRestaurants) {
      return res
        .status(403)
        .json({ msg: "You reached your restaurant limit. Upgrade your plan." });
    }

    // 3) create restaurant
    const restaurant = await Restaurant.create({
      name: req.body.name,
      owner: req.user._id,
      socialLinks: req.body.socialLinks || {},
    });

    return res.status(201).json(restaurant);
  } catch (err) {
    console.error("Create restaurant error:", err);
    return res.status(500).json({ msg: "Failed to create restaurant" });
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
