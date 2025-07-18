// routes/webhookRoutes.js
const express   = require("express");
const router    = express.Router();
const stripe    = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User      = require("../models/User");
const sendEmail = require("../utils/sendEmail");              // ← add this

// helper to safely convert a UNIX timestamp to JS Date
const safeDate = ts =>
  typeof ts === "number" && !isNaN(ts)
    ? new Date(ts * 1000)
    : undefined;

router.post(
  "/",
  express.raw({ type: "application/json" }), // raw body for signature
  async (req, res) => {
    console.log("→ [webhook] got raw body:", req.body.toString().slice(0,200));
    let event;
    try {
      const sig = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("✅ [webhook] event type:", event.type);
    } catch (err) {
      console.error("⚠️ Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed": {
        console.log("→ [webhook] handling checkout.session.completed");
        const sess   = event.data.object;
        const subId  = sess.subscription;
        const userId = sess.metadata.userId;
        const count  = parseInt(sess.metadata.count, 10) || 0;

        // fetch subscription for dates & status
        const sub = await stripe.subscriptions.retrieve(subId);

        // find & guard
        const user = await User.findById(userId);
        if (!user) {
          console.warn(`⚠️ No user ${userId} found`);
          break;
        }
        if (user.stripeSubscriptionId === subId) {
          console.log(`⚠️ Already processed sub ${subId} for ${userId}`);
          break;
        }

        // update user record
        const update = {
          $inc: { allowedRestaurants: count },
          stripeSubscriptionId: subId,
          subscriptionStatus:   sub.status,
        };
        const periodEnd = safeDate(sub.current_period_end);
        if (periodEnd) update.currentPeriodEnd = periodEnd;
        await User.findByIdAndUpdate(userId, update);
        console.log(`✅ Credited user ${userId} +${count} restaurant(s)`);

        // ── EMAIL THE CUSTOMER ──
       try {
        await sendEmail({
          to: user.email,
          subject: "Your subscription is active 🎉",
          html: `
            <p>Hi ${user.email},</p>
            <p>Thanks for subscribing! You’ve been credited with 
              <strong>${count}</strong> additional restaurant slot${count>1?"s":""}.
            </p>
            ${ periodEnd
              ? `<p>Your next billing date is <strong>${periodEnd.toLocaleDateString()}</strong>.</p>`
              : ""
            }
            <p>Enjoy the app!</p>
          `
        });
        console.log("✅ [webhook] customer email sent");
      } catch (err) {
        console.error("❌ [webhook] failed sending customer email:", err);
      }

        // ── EMAIL THE ADMIN ──
        if (process.env.ADMIN_EMAIL) {
         try {
          await sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: "New subscription received",
            html: `
              <p>User <strong>${user.email}</strong> just subscribed for 
                <strong>${count}</strong> restaurant slot${count>1?"s":""}.
              </p>
              <p>Subscription ID: <code>${subId}</code></p>
            `
          });
          console.log("✅ [webhook] admin email sent");
        } catch (err) {
          console.error("❌ [webhook] failed sending admin email:", err);
        }
      }
        break;
      }

      // keep your other handlers in place…
      case "invoice.payment_succeeded":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub2 = event.data.object;
        const user2 = await User.findOne({ stripeSubscriptionId: sub2.id });
        if (user2) {
          const upd = { subscriptionStatus: sub2.status };
          const pe = safeDate(sub2.current_period_end);
          if (pe) upd.currentPeriodEnd = pe;
          await User.findByIdAndUpdate(user2._id, upd);
          console.log(`🔄 Updated ${user2.email} → ${sub2.status}`);
        }
        break;
      }

      default:
        // ignore other events
    }

    // ack to Stripe
    res.json({ received: true });
  }
);

module.exports = router;
