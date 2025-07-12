// routes/adminRoutes.js
console.log("🔑 AdminRoutes is being loaded!");

const express = require("express");
const router  = express.Router();
const Stripe  = require("stripe");
const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);

const User       = require("../models/User");
const Restaurant = require("../models/Restaurant");
const {
  verifyToken,
  requireAdmin,       // allow both admin+superadmin
} = require("../middleware/authMiddleware");

// — List all users (admin+) —
router.get(
  "/users",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
);

// — View a user’s subscription (admin+) —
router.get(
  "/users/:id/subscription",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user?.stripeSubscriptionId) return res.json(null);
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    res.json(subscription);
  }
);

// — Delete any restaurant (admin+) —
router.delete(
  "/restaurants/:id",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  }
);

router.delete(
  "/users/:id",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      // 1) remove all restaurants they own, if you want:
      await Restaurant.deleteMany({ owner: req.params.id });
      // 2) remove the user
      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      console.error("❌ [adminRoutes] delete user error:", err);
      res.status(500).json({ error: "Could not delete user" });
    }
  }
);

// — Delete / Cancel / Pause / Resume a subscription (admin+) —
router.post(
  "/users/:id/subscription/:action",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    const { id, action } = req.params;
    const user = await User.findById(id);

    if (!user?.stripeSubscriptionId) {
      return res.status(404).json({ error: "No subscription to modify" });
    }

    console.log(`—→ About to ${action} subscription for user ${id}, subscriptionId =`, user.stripeSubscriptionId);

    try {
      let stripeSub = null;
      let newStatus;

      if (action === "cancel") {
        stripeSub = await stripe.subscriptions.cancel(user.stripeSubscriptionId);
        newStatus = "canceled";
      } else if (action === "pause") {
        stripeSub = await stripe.subscriptions.update(user.stripeSubscriptionId, {
          pause_collection: { behavior: "mark_uncollectible" },
        });
        newStatus = "paused";
      } else if (action === "resume") {
        stripeSub = await stripe.subscriptions.update(user.stripeSubscriptionId, {
          pause_collection: "", // un-pause
        });
        newStatus = "active";
      } else {
        return res.status(400).json({ error: "Unknown action" });
      }

      // build our own update doc
      const updateDoc = {
        subscriptionStatus: newStatus,
      };
      if (stripeSub.current_period_end) {
        updateDoc.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
      }
      if (newStatus === "canceled") {
        // clear ID so UI shows “—”
        updateDoc.stripeSubscriptionId = null;
      }

      // persist
      await User.findByIdAndUpdate(user._id, updateDoc);

      // send back the *forced* status
      return res.json({
        status: newStatus,
        current_period_end: stripeSub.current_period_end,
      });

    } catch (err) {
      console.error("❌ [adminRoutes] error in /subscription/:action:", err);
      if (err.raw?.code === "resource_missing") {
        // clear out stale sub
        await User.findByIdAndUpdate(user._id, {
          stripeSubscriptionId: null,
          subscriptionStatus:   null,
          currentPeriodEnd:     null,
        });
        return res.status(404).json({ error: "Subscription not found (cleared)" });
      }
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
