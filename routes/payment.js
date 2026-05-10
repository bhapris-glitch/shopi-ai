// ======================================
// routes/payment.js
// Premium Payment Router
// ======================================

const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Client = require("../models/Client");

const router = express.Router();

// ======================================
// RAZORPAY INIT
// ======================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

// ======================================
// CREATE PAYMENT ORDER
// ======================================

router.post("/create-order", async (req,res)=>{

  try{

    const {
      clientId,
      plan
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if(!clientId){

      return res.status(400).json({
        success:false,
        message:"Client ID missing"
      });

    }

    // =========================
    // PLAN PRICE
    // =========================

    let amount = 79900;

    if(plan === "starter"){
      amount = 39900;
    }

    if(plan === "premium"){
      amount = 79900;
    }

    // =========================
    // CREATE ORDER
    // =========================

    const order = await razorpay.orders.create({

      amount,

      currency:"INR",

      receipt:
      "receipt_" + Date.now(),

      notes:{

        clientId,
        plan

      }

    });

    // =========================
    // RESPONSE
    // =========================

    res.json({

      success:true,

      order,

      key:
      process.env.RAZORPAY_KEY

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false,

      message:"Payment order failed"

    });

  }

});

// ======================================
// VERIFY PAYMENT
// ======================================

router.post("/verify-payment", async (req,res)=>{

  try{

    const {

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      clientId,
      plan

    } = req.body;

    // =========================
    // SIGNATURE VERIFY
    // =========================

    const generatedSignature =
      crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_SECRET
      )
      .update(
        razorpay_order_id +
        "|" +
        razorpay_payment_id
      )
      .digest("hex");

    // =========================
    // INVALID
    // =========================

    if(
      generatedSignature !==
      razorpay_signature
    ){

      return res.status(400).json({

        success:false,

        message:"Payment verification failed"

      });

    }

    // =========================
    // UPDATE CLIENT
    // =========================

    await Client.findByIdAndUpdate(

      clientId,

      {

        paid:true,

        status:"active",

        plan:
        plan || "premium",

        paymentId:
        razorpay_payment_id,

        orderId:
        razorpay_order_id,

        renewalDate:
        Date.now() +
        (28 * 24 * 60 * 60 * 1000),

        locked:false

      }

    );

    // =========================
    // SUCCESS
    // =========================

    res.json({

      success:true,

      message:"Payment verified"

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false,

      message:"Verification failed"

    });

  }

});

// ======================================
// CLIENT PLAN
// ======================================

router.get("/client-plan/:id", async (req,res)=>{

  try{

    const client =
      await Client.findById(
        req.params.id
      );

    // =========================
    // NOT FOUND
    // =========================

    if(!client){

      return res.json({

        plan:"starter",

        locked:true

      });

    }

    // =========================
    // LOCK CHECK
    // =========================

    let locked = false;

    // Trial expired
    if(

      Date.now() > client.trialEnds &&

      !client.paid

    ){

      locked = true;

    }

    // Renewal expired
    if(

      client.paid &&

      client.renewalDate &&

      Date.now() > client.renewalDate

    ){

      locked = true;

    }

    // =========================
    // RESPONSE
    // =========================

    res.json({

      success:true,

      plan:
      client.plan || "starter",

      paid:
      client.paid,

      locked,

      status:
      client.status,

      renewalDate:
      client.renewalDate

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false

    });

  }

});

// ======================================
// CANCEL SUBSCRIPTION
// ======================================

router.post("/cancel-subscription", async (req,res)=>{

  try{

    const {
      clientId
    } = req.body;

    await Client.findByIdAndUpdate(

      clientId,

      {

        paid:false,

        locked:true,

        status:"cancelled"

      }

    );

    res.json({

      success:true,

      message:"Subscription cancelled"

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false

    });

  }

});

// ======================================
// AUTO RENEW CHECK
// ======================================

router.post("/auto-renew-check", async (req,res)=>{

  try{

    const clients =
      await Client.find({
        paid:true
      });

    for(const client of clients){

      // EXPIRED
      if(

        client.renewalDate &&

        Date.now() >
        client.renewalDate

      ){

        // LOCK CHATBOT
        client.locked = true;

        client.paid = false;

        client.status = "expired";

        await client.save();

      }

    }

    res.json({

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
