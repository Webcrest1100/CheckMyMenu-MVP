const User = require("../models/User"); // make sure this is imported
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const FRONTEND_URL = process.env.FRONTEND_URL;
console.log("☁️ FRONTEND_URL =", FRONTEND_URL);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { verifyToken: protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/authMiddleware");
const ALLOWED_PRICE_IDS = [
  process.env.PRICE_ID_ONE, // e.g. price_1RiQqK1QnqDtnaVeVle4T8Jq
  process.env.PRICE_ID_FIVE, // e.g. price_1RiQpL2QnqDtnaVe4TJ0XYZ
];

router.get("/prices", protect, async (req, res) => {
  try {
    const { data } = await stripe.prices.list({
      active: true,
      type: "recurring",
    });
    // only send back the two we actually want
    const filtered = data.filter((p) => ALLOWED_PRICE_IDS.includes(p.id));
    res.json(filtered);
  } catch (err) {
    console.error("Error fetching prices:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  const { priceId, count } = req.body;

  try {
    // // Always quantity:1 so Stripe charges exactly the price you set up
    // const session = await stripe.checkout.sessions.create({
    //   mode: "subscription",
    //   payment_method_types: ["card"],
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   success_url: `${FRONTEND_URL}/dashboard?payment=success`,
    //   cancel_url: `${FRONTEND_URL}/dashboard?payment=cancel`,
    //   customer_email: req.user.email,
    //   metadata: {
    //     userId: req.user.id,
    //     count: count.toString(),
    //   },
    // });

    // 1) create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      // line_items: [{ price: priceId, quantity: parseInt(count, 10) }],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success`,
      cancel_url:  `${process.env.FRONTEND_URL}/dashboard?payment=cancel`,
      customer_email: req.user.email,
      metadata: { userId: req.user.id, count: count.toString() },
    });

     // 2) Save the subscription ID immediately so admin can cancel right after redirect
    //    (it will be populated once the session completes)
    if (session.subscription) {
      await User.findByIdAndUpdate(req.user.id, {
        stripeSubscriptionId: session.subscription
      });
    }

    // 3) return the URL
    return res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("🔥 Stripe subscription error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.post("/admin/cancel", requireAdmin, async (req, res) => {
  const { subscriptionId } = req.body;
  if (!subscriptionId) {
    return res.status(400).json({ msg: "subscriptionId required" });
  }
  try {
    // You can either fully delete:
    await stripe.subscriptions.del(subscriptionId);
    return res.json({ msg: "Subscription canceled" });
  } catch (err) {
    console.error("Cancel error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PAUSE a subscription at period end
router.post("/admin/pause", requireAdmin, async (req, res) => {
  const { subscriptionId } = req.body;
  if (!subscriptionId) {
    return res.status(400).json({ msg: "subscriptionId required" });
  }
  try {
    await stripe.subscriptions.update(subscriptionId, {
      pause_collection: { behavior: "mark_uncollectible" },
    });
    return res.json({ msg: "Subscription paused" });
  } catch (err) {
    console.error("Pause error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
