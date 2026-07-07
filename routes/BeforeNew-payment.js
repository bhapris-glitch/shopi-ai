// ======================================
// routes/payment.js
// Layboka AI Billing System
// Stripe USD Subscription Billing
// Updated Jun 2026 - Part 1
// ======================================

const express = require("express");
const Stripe = require("stripe");

const Client = require("../models/Client");
const Subscription = require("../models/Subscription");

const router = express.Router();

const stripe = Stripe(
  process.env.STRIPE_SECRET_KEY
);

// ======================================
// PLAN CONFIG
// ======================================

const PLANS = {

  starter: {
    name: "Starter",
    price: 25,
    stripePriceId:
      process.env.STRIPE_STARTER_PRICE_ID
  },

  growth: {
    name: "Growth",
    price: 59,
    stripePriceId:
      process.env.STRIPE_GROWTH_PRICE_ID
  },

  premium: {
    name: "Premium",
    price: 149,
    stripePriceId:
      process.env.STRIPE_PREMIUM_PRICE_ID
  }

};

// ======================================
// CREATE CHECKOUT SESSION
// ======================================

router.post(
  "/create-checkout-session",
  async (req,res)=>{
    try{

      const {
        clientId,
        plan
      } = req.body;

      if(!clientId){

        return res.status(400).json({
          success:false,
          message:"Client ID required"
        });

      }

      if(!PLANS[plan]){

        return res.status(400).json({
          success:false,
          message:"Invalid plan"
        });

      }

      const client =
        await Client.findById(clientId);

      if(!client){

        return res.status(404).json({
          success:false,
          message:"Client not found"
        });

      }

      const session =
        await stripe.checkout.sessions.create({

          mode:"subscription",

          payment_method_types:[
            "card"
          ],

          customer_email:
            client.email || undefined,

          line_items:[

            {
              price:
              PLANS[plan].stripePriceId,

              quantity:1
            }

          ],

          metadata:{

            clientId:
            String(client._id),

            plan

          },

          success_url:
            `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${process.env.APP_URL}/pricing`

        });

      return res.json({

        success:true,

        url:session.url

      });

    }catch(err){

      console.error(err);

      return res.status(500).json({

        success:false,

        message:"Checkout creation failed"

      });

    }
  }
);

// ======================================
// STRIPE CHECKOUT SESSION
// USD BILLING - Part 2
// ======================================

router.post(
  "/create-checkout-session",
  async (req, res) => {
    try {

      const {
        clientId,
        plan,
        billingCycle = "monthly"
      } = req.body;

      // =============================
      // VALIDATION
      // =============================

      if (!clientId) {
        return res.status(400).json({
          success: false,
          message: "Client ID required"
        });
      }

      const client =
        await Client.findById(clientId);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found"
        });
      }

      // =============================
      // PRICE IDS
      // =============================

      const PRICE_MAP = {

        starter: {
          monthly:
            process.env.STRIPE_STARTER_MONTHLY
        },

        growth: {
          monthly:
            process.env.STRIPE_GROWTH_MONTHLY
        },

        premium: {
          monthly:
            process.env.STRIPE_PREMIUM_MONTHLY
        }

      };

      const priceId =
        PRICE_MAP?.[plan]?.[billingCycle];

      if (!priceId) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan"
        });
      }

      // =============================
      // STRIPE SESSION
      // =============================

      const session =
        await stripe.checkout.sessions.create({

          mode: "subscription",

          customer_email:
            client.email || undefined,

          payment_method_types: [
            "card"
          ],

          line_items: [
            {
              price: priceId,
              quantity: 1
            }
          ],

          metadata: {

            clientId:
              client._id.toString(),

            plan,

            billingCycle

          },

          subscription_data: {

            metadata: {

              clientId:
                client._id.toString(),

              plan,

              billingCycle

            }

          },

          success_url:
            `${process.env.FRONTEND_URL}/billing-success?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${process.env.FRONTEND_URL}/pricing`

        });

      // =============================
      // RESPONSE
      // =============================

      res.json({

        success: true,

        sessionId:
          session.id,

        checkoutUrl:
          session.url

      });

    } catch (err) {

      console.log(
        "Stripe Checkout Error:",
        err
      );

      res.status(500).json({

        success: false,

        message:
          "Stripe checkout failed"

      });

    }
  }
);

// ======================================
// BILLING PORTAL
// CANCEL ANYTIME
// ======================================

router.post(
  "/billing-portal",
  async (req, res) => {

    try {

      const { clientId } = req.body;

      const client =
        await Client.findById(clientId);

      if (
        !client ||
        !client.customerId
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Customer not found"

        });

      }

      const portalSession =
        await stripe.billingPortal.sessions.create({

          customer:
            client.customerId,

          return_url:
            `${process.env.FRONTEND_URL}/dashboard`

        });

      res.json({

        success: true,

        url:
          portalSession.url

      });

    } catch (err) {

      console.log(
        "Billing Portal Error:",
        err
      );

      res.status(500).json({

        success: false

      });

    }
  }
);
// ======================================
// CLIENT PLAN - Part 3
// GET CURRENT SUBSCRIPTION STATUS
// ======================================

router.get("/client-plan/:clientId", async (req, res) => {

  try {

    const { clientId } = req.params;

    const client =
      await Client.findById(clientId)
      .select(
        "plan paid locked status trialEnds"
      );

    if (!client) {

      return res.status(404).json({

        success: false,
        message: "Client not found"

      });

    }

    const subscription =
      await Subscription.findOne({

        clientId: client._id

      }).sort({ createdAt: -1 });

    let locked = client.locked;

    // ==================================
    // TRIAL CHECK
    // ==================================

    if (

      client.plan === "free" &&
      client.trialEnds &&
      Date.now() > client.trialEnds

    ) {

      locked = true;

    }

    // ==================================
    // SUBSCRIPTION EXPIRED
    // ==================================

    if (

      subscription &&
      subscription.expiresAt &&
      new Date(subscription.expiresAt) < new Date()

    ) {

      locked = true;

    }

    // ==================================
    // RESPONSE
    // ==================================

    return res.json({

      success: true,

      plan:
        client.plan,

      status:
        subscription?.status ||
        client.status,

      paid:
        subscription?.paid ??
        client.paid,

      locked,

      autoRenew:
        subscription?.autoRenew ??
        false,

      renewalDate:
        subscription?.renewalDate ||
        null,

      expiresAt:
        subscription?.expiresAt ||
        null

    });

  } catch (err) {

    console.error(
      "Client Plan Error:",
      err
    );

    res.status(500).json({

      success: false,
      message: "Failed to fetch plan"

    });

  }

});

// ======================================
// CANCEL SUBSCRIPTION
// CANCEL ANYTIME
// ======================================

router.post(
  "/cancel-subscription",
  async (req, res) => {

    try {

      const { clientId } =
        req.body;

      if (!clientId) {

        return res.status(400).json({

          success: false,
          message: "Client ID required"

        });

      }

      const subscription =
        await Subscription.findOne({

          clientId

        });

      if (!subscription) {

        return res.status(404).json({

          success: false,
          message:
            "Subscription not found"

        });

      }

      // ===============================
      // STRIPE SUBSCRIPTION
      // ===============================

      if (

        subscription.provider ===
          "stripe" &&

        subscription.subscriptionId

      ) {

        try {

          await stripe.subscriptions.update(

            subscription.subscriptionId,

            {

              cancel_at_period_end:
                true

            }

          );

        } catch (e) {

          console.error(
            "Stripe Cancel Error:",
            e.message
          );

        }

      }

      // ===============================
      // UPDATE DATABASE
      // ===============================

      subscription.status =
        "cancelled";

      subscription.autoRenew =
        false;

      subscription.cancelledAt =
        new Date();

      await subscription.save();

      await Client.findByIdAndUpdate(

        clientId,

        {

          status: "cancelled"

        }

      );

      return res.json({

        success: true,

        message:
          "Subscription cancelled. Access remains active until expiry.",

        expiresAt:
          subscription.expiresAt

      });

    } catch (err) {

      console.error(
        "Cancel Subscription Error:",
        err
      );

      res.status(500).json({

        success: false,
        message:
          "Failed to cancel subscription"

      });

    }

  }
);

// ======================================
// REACTIVATE SUBSCRIPTION
// ======================================

router.post(
  "/reactivate-subscription",
  async (req, res) => {

    try {

      const { clientId } =
        req.body;

      const subscription =
        await Subscription.findOne({

          clientId

        });

      if (!subscription) {

        return res.status(404).json({

          success: false,
          message:
            "Subscription not found"

        });

      }

      subscription.status =
        "active";

      subscription.autoRenew =
        true;

      subscription.cancelledAt =
        null;

      await subscription.save();

      await Client.findByIdAndUpdate(

        clientId,

        {

          status: "active",
          locked: false

        }

      );

      res.json({

        success: true,
        message:
          "Subscription reactivated"

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false

      });

    }

  }
);


// ======================================
// AUTO RENEW CHECK - Part 4.
// Used by Cron Job
// ======================================

router.post(
  "/auto-renew-check",
  async (req, res) => {

    try {

      const subscriptions =
        await Subscription.find({

          status: {
            $in: [
              "active",
              "past_due"
            ]
          }

        });

      let lockedCount = 0;

      for (const sub of subscriptions) {

        // ============================
        // EXPIRED
        // ============================

        if (

          sub.expiresAt &&

          new Date(sub.expiresAt) <
          new Date()

        ) {

          sub.locked = true;

          sub.status = "expired";

          await sub.save();

          await Client.findByIdAndUpdate(

            sub.clientId,

            {

              paid: false,

              locked: true,

              status: "expired"

            }

          );

          lockedCount++;

        }

      }

      return res.json({

        success: true,

        lockedAccounts:
          lockedCount

      });

    } catch (err) {

      console.error(
        "Auto Renew Error:",
        err
      );

      res.status(500).json({

        success: false

      });

    }

  }
);

// ======================================
// ADMIN ACTIVATE SUBSCRIPTION
// Enterprise / Manual Billing
// ======================================

router.post(
  "/admin/activate",
  async (req, res) => {

    try {

      const {

        clientId,

        plan = "premium",

        months = 1

      } = req.body;

      const client =
        await Client.findById(clientId);

      if (!client) {

        return res.status(404).json({

          success: false,

          message:
            "Client not found"

        });

      }

      let subscription =
        await Subscription.findOne({

          clientId

        });

      if (!subscription) {

        subscription =
          new Subscription({

            clientId

          });

      }

      const renewalDate =
        new Date(
          Date.now() +
          months *
          30 *
          24 *
          60 *
          60 *
          1000
        );

      subscription.plan =
        plan;

      subscription.provider =
        "manual";

      subscription.status =
        "active";

      subscription.paid =
        true;

      subscription.locked =
        false;

      subscription.autoRenew =
        false;

      subscription.renewalDate =
        renewalDate;

      subscription.expiresAt =
        renewalDate;

      await subscription.save();

      await Client.findByIdAndUpdate(

        clientId,

        {

          plan,

          paid: true,

          locked: false,

          status: "active",

          renewalDate

        }

      );

      return res.json({

        success: true,

        message:
          "Subscription activated"

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

// ======================================
// SUBSCRIPTION STATS
// Dashboard Billing Widget
// ======================================

router.get(
  "/subscription-stats",
  async (req, res) => {

    try {

      const active =
        await Subscription.countDocuments({

          status: "active"

        });

      const cancelled =
        await Subscription.countDocuments({

          status: "cancelled"

        });

      const expired =
        await Subscription.countDocuments({

          status: "expired"

        });

      return res.json({

        success: true,

        active,

        cancelled,

        expired

      });

    } catch (err) {

      console.error(err);

      res.status(500).json({

        success: false

      });

    }

  }
);

// ======================================
// EXPORT
// ======================================

module.exports = router;
