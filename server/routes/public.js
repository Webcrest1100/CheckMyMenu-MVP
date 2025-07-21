const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");

// GET /api/public/restaurants/:restaurantId/menu/:itemId
router.get("/restaurants/:restaurantId/menu/:itemI  d", async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;

    const menuItem = await MenuItem.findOne({
      _id: itemId,
      restaurant: restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (err) {
    console.error("Error fetching public menu item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
