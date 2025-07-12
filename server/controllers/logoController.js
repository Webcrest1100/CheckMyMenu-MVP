const AddLogo = require("../models/addLogo");
const Restaurant = require("../models/Restaurant");

exports.uploadLogo = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const logoUrl = `/uploads/${req.file.filename}`;

    let record = await AddLogo.findOne({ restaurantId });

    if (record) {
      record.logo = logoUrl;
      await record.save();
    } else {
      record = await AddLogo.create({ restaurantId, logo: logoUrl });
    }

    // Optional: update restaurant model too
    await Restaurant.findByIdAndUpdate(restaurantId, { logo: logoUrl });

    res.json({ msg: "Logo uploaded", logo: record.logo });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await AddLogo.findOne({ restaurantId: id });
    if (!record) return res.status(404).json({ msg: "Logo not found" });

    res.json({ logo: record.logo });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deleteLogo = async (req, res) => {
  try {
    const { id } = req.params;

    const logoRecord = await AddLogo.findOne({ restaurantId: id });
    if (!logoRecord) return res.status(404).json({ msg: "Logo not found" });

    logoRecord.logo = "";
    await logoRecord.save();

    // Optional: clear from Restaurant too
    await Restaurant.findByIdAndUpdate(id, { logo: "" });

    res.json({ msg: "Logo deleted" });
  } catch (err) {
    console.error("Delete logo error:", err);
    res.status(500).json({ msg: "Failed to delete logo" });
  }
};




// exports.deleteLogo = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the logo record
//     const logoRecord = await AddLogo.findOne({ restaurantId: id });
//     if (!logoRecord) return res.status(404).json({ msg: "Logo not found" });

//     logoRecord.logo = "";
//     await logoRecord.save();

//     // Optional: clear logo from Restaurant model too
//     await Restaurant.findByIdAndUpdate(id, { logo: "" });

//     res.json({ msg: "Logo deleted" });
//   } catch (err) {
//     console.error("Delete logo error:", err);
//     res.status(500).json({ msg: "Failed to delete logo" });
//   }
// };





exports.deleteLogo = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    console.log("⛳ Deleting logo for restaurantId:", restaurantId);

    if (!restaurantId) {
      console.log("❌ Missing restaurantId param");
      return res.status(400).json({ msg: "Missing restaurantId" });
    }

    const logoRecord = await AddLogo.findOne({ restaurantId });
    console.log("📦 Logo record found:", logoRecord);

    if (!logoRecord) {
      console.log("❌ No logo found in AddLogo collection");
      return res.status(404).json({ msg: "Logo not found" });
    }

    logoRecord.logo = "";
    await logoRecord.save();
    console.log("✅ Cleared logo field in AddLogo");

    const updated = await Restaurant.findByIdAndUpdate(restaurantId, { logo: "" }, { new: true });
    if (!updated) {
      console.log("⚠️ Restaurant not found");
    } else {
      console.log("✅ Cleared logo in Restaurant model too");
    }

    res.json({ msg: "Logo deleted successfully" });
  } catch (err) {
    console.error("💥 DELETE logo crash:", err.message);
    res.status(500).json({ msg: "Server crash", error: err.message });
  }
};

