// // routes/webhookRoutes.js
// const express = require("express");
// const router = express.Router();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const User = require("../models/User");

// const safeDate = (ts) =>
//   typeof ts === "number" && !isNaN(ts) ? new Date(ts * 1000) : undefined;

// router.post(
//   "/",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     let event;
//     if (process.env.NODE_ENV === "production") {
//       try {
//         event = stripe.webhooks.constructEvent(
//           req.body,
//           req.headers["stripe-signature"],
//           process.env.STRIPE_WEBHOOK_SECRET
//         );
//       } catch (err) {
//         console.error("⚠️ Webhook signature failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//       }
//     } else {
//       try {
//         event = JSON.parse(req.body.toString());
//       } catch (err) {
//         console.error("Invalid JSON in webhook (dev mode)", err);
//         return res.status(400).send("Invalid JSON");
//       }
//     }

//     if (event.type === "checkout.session.completed") {
//       const sess = event.data.object;
//       const subId = sess.subscription;
//       const userId = sess.metadata.userId;
//       // **use the metadata.count** to credit the user
//       const count = parseInt(sess.metadata.count, 10) || 0;

//       // fetch the subscription so we can set status & period end
//       const sub = await stripe.subscriptions.retrieve(subId);

//       // prevent double-processing
//       const user = await User.findById(userId);
//       if (!user) {
//         console.warn(`⚠️ No user ${userId} found`);
//       } else if (user.stripeSubscriptionId === subId) {
//         console.log(
//           `⚠️ Subscription ${subId} already processed for user ${userId}`
//         );
//       } else {
//         const update = {
//           $inc: { allowedRestaurants: count },
//           stripeSubscriptionId: subId,
//           subscriptionStatus: sub.status,
//         };
//         const periodEnd = safeDate(sub.current_period_end);
//         if (periodEnd) update.currentPeriodEnd = periodEnd;

//         await User.findByIdAndUpdate(userId, update);
//         console.log(`✅ [webhook] User ${userId} credited +${count}`);
//       }
//     }

//     // handle renewals / cancels if you like...
//     switch (event.type) {
//       case "invoice.payment_succeeded":
//       case "customer.subscription.updated":
//       case "customer.subscription.deleted": {
//         const sub = event.data.object;
//         const user = await User.findOne({ stripeSubscriptionId: sub.id });
//         if (user) {
//           const update = { subscriptionStatus: sub.status };
//           const periodEnd = safeDate(sub.current_period_end);
//           if (periodEnd) update.currentPeriodEnd = periodEnd;
//           await User.findByIdAndUpdate(user._id, update);
//           console.log(`🔄 [webhook] ${user.email} → ${sub.status}`);
//         }
//         break;
//       }
//       default:
//       // ignore
//     }

//     res.json({ received: true });
//   }
// );

// module.exports = router;


// routes/webhookRoutes.js
const express = require("express");
const router  = express.Router();
const stripe  = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User    = require("../models/User");

// helper to safely convert a UNIX timestamp to JS Date
const safeDate = ts =>
  typeof ts === "number" && !isNaN(ts)
    ? new Date(ts * 1000)
    : undefined;

router.post(
  "/",
  // Stripe requires the raw body to verify signatures
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("⚠️ Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const sess   = event.data.object;
        const subId  = sess.subscription;
        const userId = sess.metadata.userId;
        // count was passed in metadata when creating the session
        const count  = parseInt(sess.metadata.count, 10) || 0;

        // fetch the full subscription so we can read its status & period end
        const sub = await stripe.subscriptions.retrieve(subId);

        // guard: only credit once
        const user = await User.findById(userId);
        if (!user) {
          console.warn(`⚠️ No user ${userId} found`);
          break;
        }
        if (user.stripeSubscriptionId === subId) {
          console.log(`⚠️ Already processed sub ${subId} for ${userId}`);
          break;
        }

        // build our update payload
        const update = {
          $inc: { allowedRestaurants: count },
          stripeSubscriptionId: subId,
          subscriptionStatus:   sub.status,
        };
        const periodEnd = safeDate(sub.current_period_end);
        if (periodEnd) update.currentPeriodEnd = periodEnd;

        await User.findByIdAndUpdate(userId, update);
        console.log(`✅ Credited user ${userId} +${count} restaurant(s)`);
        break;
      }

      // (optional) keep your renewals / cancellations in sync
      case "invoice.payment_succeeded":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub  = event.data.object;
        const user = await User.findOne({ stripeSubscriptionId: sub.id });
        if (user) {
          const update = { subscriptionStatus: sub.status };
          const periodEnd = safeDate(sub.current_period_end);
          if (periodEnd) update.currentPeriodEnd = periodEnd;

          await User.findByIdAndUpdate(user._id, update);
          console.log(`🔄 Updated ${user.email} → ${sub.status}`);
        }
        break;
      }

      default:
        // ignore other events
    }

    // let Stripe know we received the event
    res.json({ received: true });
  }
);

module.exports = router;
