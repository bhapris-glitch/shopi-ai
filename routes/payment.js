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
