const express = require("express");
const router = express.Router();
const { verifyToken: protect } = require("../middleware/authMiddleware");
const MenuItem = require("../models/MenuItem");
const upload = require("../middleware/multer");

// ✅ GET: Paginated & Searchable Menu Items
router.get("/:restaurantId/menu", protect, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const restaurantId = req.params.restaurantId;

    const query = { restaurant: restaurantId };

    if (search.trim() !== "") {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    const totalItems = await MenuItem.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const currentPage = parseInt(page);

    const items = await MenuItem.find(query)
      .skip((currentPage - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      items,
      totalPages,
      currentPage,
    });
  } catch (err) {
    console.error("Pagination error:", err);
    res
      .status(500)
      .json({ msg: "Failed to fetch menu items", error: err.message });
  }
});

// ✅ GET: All Template Items (if needed)
router.get("/templates/all", async (req, res) => {
  try {
    const templates = await MenuItem.find({ isTemplate: true });
    res.json(templates);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching templates", error: err.message });
  }
});

// ✅ POST: Create New Menu Item
router.post(
  "/:restaurantId/menu",
  protect,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, description, price, category } = req.body;

      if (!name || !description || !price || !category) {
        return res.status(400).json({ msg: "All fields are required" });
      }

      if (isNaN(price) || Number(price) <= 0) {
        return res.status(400).json({ msg: "Price must be a positive number" });
      }

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

      const newItem = await MenuItem.create({
        restaurant: req.params.restaurantId,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        imageUrl,
      });

      res.status(201).json(newItem);
    } catch (err) {
      console.error("Create error:", err);
      res
        .status(500)
        .json({ msg: "Failed to add menu item", error: err.message });
    }
  }
);

const fs = require("fs");
const path = require("path");

// ✅ PUT: Update Existing Menu Item
// router.put(
//   "/:restaurantId/menu/:menuItemId",
//   protect,
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { name, description, price, category } = req.body;

//       if (!name || !description || !price || !category) {
//         return res.status(400).json({ msg: "All fields are required" });
//       }

//       if (isNaN(price) || Number(price) <= 0) {
//         return res.status(400).json({ msg: "Price must be a positive number" });
//       }

//       const updateData = {
//         name: name.trim(),
//         description: description.trim(),
//         price: parseFloat(price),
//         category: category.trim(),
//       };

//       const item = await MenuItem.findOne({
//         _id: req.params.menuItemId,
//         restaurant: req.params.restaurantId,
//       });

//       if (!item) {
//         return res.status(404).json({ msg: "Menu item not found" });
//       }

//       // If a new image is uploaded, delete the old one
//       if (req.file && req.file.filename) {
//         if (item.imageUrl) {
//           const oldImagePath = path.join(__dirname, "..", item.imageUrl);
//           fs.unlink(oldImagePath, (err) => {
//             if (err) {
//               console.warn("Failed to delete old image:", oldImagePath);
//             }
//           });
//         }

//         updateData.imageUrl = `/uploads/${req.file.filename}`;
//       }

//       const updatedItem = await MenuItem.findByIdAndUpdate(
//         item._id,
//         updateData,
//         { new: true }
//       );

//       res.json(updatedItem);
//     } catch (err) {
//       console.error("Update error:", err);
//       res
//         .status(500)
//         .json({ msg: "Failed to update menu item", error: err.message });
//     }
//   }
// );




router.put("/menu/:id", upload.single("image"), async (req, res) => {
  const { name, description, price, category, font, color, fontColor } = req.body;
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ error: "Item not found" });
    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price) menuItem.price = price;
    if (category) menuItem.category = category;
    if (font) menuItem.font = font;
    if (color) menuItem.color = color;
    if (fontColor) menuItem.fontColor = fontColor; // :white_check_mark: add this
    if (req.file) {
      menuItem.imageUrl = `/uploads/${req.file.filename}`;
    }
    await menuItem.save();
    res.json(menuItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ✅ DELETE: Delete Menu Item
router.delete("/:restaurantId/menu/:menuItemId", protect, async (req, res) => {
  try {
    const { restaurantId, menuItemId } = req.params;

    // 1. Find the item first to get its image path
    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurant: restaurantId,
    });

    if (!menuItem) {
      return res.status(404).json({ msg: "Menu item not found" });
    }

    // 2. Delete the image file if it exists
    if (menuItem.imageUrl) {
      const imagePath = path.join(__dirname, "..", menuItem.imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("❌ Failed to delete image:", imagePath, err.message);
        } else {
          console.log("✅ Image deleted:", imagePath);
        }
      });
    }

    // 3. Now delete the menu item from the database
    await MenuItem.findByIdAndDelete(menuItemId);

    res.json({ msg: "Menu item and image deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// GET /api/public/restaurants/:restaurantId/menu/:itemId
router.get("/restaurants/:restaurantId/menu/:itemId", async (req, res) => {
  const { restaurantId, itemId } = req.params;

  try {
    const item = await MenuItem.findOne({
      _id: itemId,
      restaurant: restaurantId,
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(item);
  } catch (err) {
    console.error("Error fetching menu item:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/menu/:id", upload.single("image"), async (req, res) => {
  const { name, description, price, category, font, color, fontColor } = req.body;

  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) return res.status(404).json({ error: "Item not found" });

    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (price) menuItem.price = price;
    if (category) menuItem.category = category;
    if (font) menuItem.font = font;
    if (color) menuItem.color = color;
    if (fontColor) menuItem.fontColor = fontColor; // ✅ add this

    if (req.file) {
      menuItem.imageUrl = `/uploads/${req.file.filename}`;
    }

    await menuItem.save();
    res.json(menuItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

module.exports = router;

