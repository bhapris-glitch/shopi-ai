// ======================================
// routes/stripeBilling.js
// Stripe Recurring Billing
// ======================================

const express =
require("express");

const router =
express.Router();

const Stripe =
require("stripe");

const Client =
require("../models/Client");

const Subscription =
require(
  "../models/Subscription"
);

const stripe =
Stripe(
  process.env.STRIPE_SECRET
);

// ======================================
// STRIPE PRICES
// ======================================

const PRICE_IDS = {

  starter:
    process.env
    .STRIPE_STARTER_PRICE,

  growth:
    process.env
    .STRIPE_GROWTH_PRICE,

  scale:
    process.env
    .STRIPE_SCALE_PRICE

};

// ======================================
// CREATE CHECKOUT
// ======================================

router.post(
"/create-subscription",
async(req,res)=>{

try{

  const {
    plan,
    clientId,
    email
  } = req.body;

  const client =
    await Client.findById(
      clientId
    );

  if(!client){

    return res.status(404)
    .json({
      error:"Client not found"
    });

  }

  const session =

    await stripe
    .checkout.sessions.create({

      payment_method_types:[
        "card"
      ],

      mode:"subscription",

      customer_email:email,

      line_items:[{

        price:
          PRICE_IDS[plan],

        quantity:1

      }],

      success_url:
`${process.env.BASE_URL}/dashboard.html?success=true`,

      cancel_url:
`${process.env.BASE_URL}/pricing.html`,

      metadata:{
        clientId,
        plan
      }

    });

  res.json({

    success:true,

    url:session.url

  });

}catch(err){

  console.log(err);

  res.status(500).json({

    error:"Stripe failed"

  });

}

});

// ======================================
// WEBHOOK
// ======================================

router.post(
"/stripe-webhook",
express.raw({
  type:"application/json"
}),
async(req,res)=>{

try{

  const sig =
    req.headers[
      "stripe-signature"
    ];

  const event =
    stripe.webhooks.constructEvent(

      req.body,

      sig,

      process.env
      .STRIPE_WEBHOOK_SECRET

    );

  // ==========================
  // SUCCESS
  // ==========================

  if(

    event.type ===
    "checkout.session.completed"

  ){

    const session =
      event.data.object;

    const clientId =
      session.metadata.clientId;

    const plan =
      session.metadata.plan;

    await Client.findByIdAndUpdate(

      clientId,

      {

        paid:true,

        plan,

        status:"active"

      }

    );

    await Subscription.create({

      clientId,

      plan,

      status:"active",

      customerId:
        session.customer,

      subscriptionId:
        session.subscription

    });

  }

  // ==========================
  // CANCEL
  // ==========================

  if(

    event.type ===
    "customer.subscription.deleted"

  ){

    const subscription =
      event.data.object;

    await Subscription
    .findOneAndUpdate(

      {

        subscriptionId:
          subscription.id

      },

      {

        status:"cancelled"

      }

    );

  }

  res.json({
    received:true
  });

}catch(err){

  console.log(err);

  res.status(400).send(
    `Webhook Error: ${err.message}`
  );

}

});

module.exports =
router;
