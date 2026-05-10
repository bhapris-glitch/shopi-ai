// ======================================
// routes/webhook.js
// Production Webhook System
// Razorpay + Auto Renewal + Lock System
// ======================================

const express = require("express");
const crypto = require("crypto");

const Client = require("../models/Client");

const router = express.Router();

// ======================================
// RAZORPAY WEBHOOK
// ======================================

router.post("/razorpay", async (req,res)=>{

  try{

    // ==================================
    // SIGNATURE
    // ==================================

    const signature =
      req.headers["x-razorpay-signature"];

    // ==================================
    // GENERATE HASH
    // ==================================

    const generatedSignature =
      crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(
        JSON.stringify(req.body)
      )
      .digest("hex");

    // ==================================
    // VERIFY
    // ==================================

    if(signature !== generatedSignature){

      console.log("❌ Invalid webhook");

      return res.status(400).json({

        success:false

      });

    }

    // ==================================
    // EVENT
    // ==================================

    const event = req.body.event;

    // ==================================
    // PAYMENT CAPTURED
    // ==================================

    if(event === "payment.captured"){

      const payment =
        req.body.payload.payment.entity;

      const clientId =
        payment.notes.clientId;

      const plan =
        payment.notes.plan || "premium";

      console.log(
        "✅ Payment Captured:",
        clientId
      );

      // ===============================
      // ACTIVATE CLIENT
      // ===============================

      await Client.findByIdAndUpdate(

        clientId,

        {

          paid:true,

          locked:false,

          status:"active",

          plan,

          paymentId:
          payment.id,

          renewalDate:
          Date.now() +
          (28 * 24 * 60 * 60 * 1000)

        }

      );

    }

    // ==================================
    // SUBSCRIPTION ACTIVATED
    // ==================================

    if(event === "subscription.activated"){

      const subscription =
        req.body.payload.subscription.entity;

      console.log(
        "✅ Subscription Active"
      );

      await Client.findOneAndUpdate(

        {

          subscriptionId:
          subscription.id

        },

        {

          paid:true,

          locked:false,

          status:"active",

          renewalDate:
          Date.now() +
          (28 * 24 * 60 * 60 * 1000)

        }

      );

    }

    // ==================================
    // SUBSCRIPTION CHARGED
    // AUTO RENEW SUCCESS
    // ==================================

    if(event === "subscription.charged"){

      const subscription =
        req.body.payload.subscription.entity;

      console.log(
        "🔁 Subscription Renewed"
      );

      await Client.findOneAndUpdate(

        {

          subscriptionId:
          subscription.id

        },

        {

          paid:true,

          locked:false,

          status:"active",

          renewalDate:
          Date.now() +
          (28 * 24 * 60 * 60 * 1000)

        }

      );

    }

    // ==================================
    // PAYMENT FAILED
    // ==================================

    if(event === "payment.failed"){

      const payment =
        req.body.payload.payment.entity;

      const clientId =
        payment.notes.clientId;

      console.log(
        "❌ Payment Failed:",
        clientId
      );

      await Client.findByIdAndUpdate(

        clientId,

        {

          paid:false,

          locked:true,

          status:"payment_failed"

        }

      );

    }

    // ==================================
    // SUBSCRIPTION HALTED
    // ==================================

    if(event === "subscription.halted"){

      const subscription =
        req.body.payload.subscription.entity;

      console.log(
        "⛔ Subscription Halted"
      );

      await Client.findOneAndUpdate(

        {

          subscriptionId:
          subscription.id

        },

        {

          paid:false,

          locked:true,

          status:"halted"

        }

      );

    }

    // ==================================
    // SUBSCRIPTION CANCELLED
    // ==================================

    if(event === "subscription.cancelled"){

      const subscription =
        req.body.payload.subscription.entity;

      console.log(
        "❌ Subscription Cancelled"
      );

      await Client.findOneAndUpdate(

        {

          subscriptionId:
          subscription.id

        },

        {

          paid:false,

          locked:true,

          status:"cancelled"

        }

      );

    }

    // ==================================
    // SUBSCRIPTION PAUSED
    // ==================================

    if(event === "subscription.paused"){

      const subscription =
        req.body.payload.subscription.entity;

      console.log(
        "⏸ Subscription Paused"
      );

      await Client.findOneAndUpdate(

        {

          subscriptionId:
          subscription.id

        },

        {

          locked:true,

          status:"paused"

        }

      );

    }

    // ==================================
    // SUBSCRIPTION RESUMED
    // ==================================

    if(event === "subscription.resumed"){

      const subscription =
        req.body.payload.subscription.entity;

      console.log(
        "▶ Subscription Resumed"
      );

      await Client.findOneAndUpdate(

        {

          subscriptionId:
          subscription.id

        },

        {

          paid:true,

          locked:false,

          status:"active"

        }

      );

    }

    // ==================================
    // SUCCESS
    // ==================================

    res.status(200).json({

      success:true

    });

  }catch(err){

    console.log(
      "Webhook Error:",
      err
    );

    res.status(500).json({

      success:false

    });

  }

});

// ======================================
// STRIPE WEBHOOK
// ======================================

router.post("/stripe", async (req,res)=>{

  try{

    const event = req.body;

    // ==================================
    // PAYMENT SUCCESS
    // ==================================

    if(
      event.type ===
      "checkout.session.completed"
    ){

      const session =
        event.data.object;

      const clientId =
        session.metadata.clientId;

      await Client.findByIdAndUpdate(

        clientId,

        {

          paid:true,

          locked:false,

          status:"active",

          renewalDate:
          Date.now() +
          (28 * 24 * 60 * 60 * 1000)

        }

      );

      console.log(
        "✅ Stripe Payment Success"
      );

    }

    // ==================================
    // PAYMENT FAILED
    // ==================================

    if(
      event.type ===
      "invoice.payment_failed"
    ){

      const invoice =
        event.data.object;

      const clientId =
        invoice.metadata.clientId;

      await Client.findByIdAndUpdate(

        clientId,

        {

          paid:false,

          locked:true,

          status:"payment_failed"

        }

      );

      console.log(
        "❌ Stripe Payment Failed"
      );

    }

    res.status(200).json({

      success:true

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false

    });

  }

});

// ======================================
// EXPORT
// ======================================

module.exports = router;
