// ======================================
// middleware/verifyWebhook.js
// Razorpay + Stripe Webhook Verification
// Production Ready
// ======================================

require("dotenv").config();

const crypto = require("crypto");

// ======================================
// VERIFY RAZORPAY WEBHOOK
// ======================================

const verifyRazorpayWebhook = (

  req,
  res,
  next

)=>{

  try{

    const signature =
      req.headers["x-razorpay-signature"];

    if(!signature){

      return res.status(400).json({

        success:false,

        message:
          "Missing Razorpay signature"

      });

    }

    // ======================================
    // CREATE EXPECTED SIGNATURE
    // ======================================

    const expectedSignature =

      crypto
        .createHmac(

          "sha256",

          process.env.RAZORPAY_WEBHOOK_SECRET

        )

        .update(req.body)

        .digest("hex");

    // ======================================
    // VERIFY
    // ======================================

    if(signature !== expectedSignature){

      console.log(
        "❌ Invalid Razorpay Webhook"
      );

      return res.status(401).json({

        success:false,

        message:
          "Invalid webhook signature"

      });

    }

    console.log(
      "✅ Razorpay Webhook Verified"
    );

    next();

  }catch(err){

    console.log(
      "❌ Razorpay Verify Error:",
      err.message
    );

    return res.status(500).json({

      success:false,

      message:
        "Webhook verification failed"

    });

  }

};

// ======================================
// VERIFY STRIPE WEBHOOK
// ======================================

const verifyStripeWebhook = (

  stripe

)=>{

  return (

    req,
    res,
    next

  )=>{

    try{

      const signature =
        req.headers["stripe-signature"];

      if(!signature){

        return res.status(400).json({

          success:false,

          message:
            "Missing Stripe signature"

        });

      }

      // ======================================
      // VERIFY EVENT
      // ======================================

      const event =
        stripe.webhooks.constructEvent(

          req.body,

          signature,

          process.env.STRIPE_WEBHOOK_SECRET

        );

      req.stripeEvent = event;

      console.log(
        "✅ Stripe Webhook Verified"
      );

      next();

    }catch(err){

      console.log(
        "❌ Stripe Verify Error:",
        err.message
      );

      return res.status(400).json({

        success:false,

        message:
          "Stripe webhook invalid"

      });

    }

  };

};

// ======================================
// SHOPIFY WEBHOOK VERIFY
// ======================================

const verifyShopifyWebhook = (

  req,
  res,
  next

)=>{

  try{

    const hmac =
      req.headers["x-shopify-hmac-sha256"];

    if(!hmac){

      return res.status(400).json({

        success:false,

        message:
          "Missing Shopify HMAC"

      });

    }

    // ======================================
    // GENERATE HASH
    // ======================================

    const generatedHash =

      crypto
        .createHmac(

          "sha256",

          process.env.SHOPIFY_API_SECRET

        )

        .update(req.body)

        .digest("base64");

    // ======================================
    // VERIFY
    // ======================================

    if(generatedHash !== hmac){

      console.log(
        "❌ Invalid Shopify Webhook"
      );

      return res.status(401).json({

        success:false,

        message:
          "Invalid Shopify webhook"

      });

    }

    console.log(
      "✅ Shopify Webhook Verified"
    );

    next();

  }catch(err){

    console.log(
      "❌ Shopify Verify Error:",
      err.message
    );

    return res.status(500).json({

      success:false,

      message:
        "Shopify webhook failed"

    });

  }

};

// ======================================
// EXPORTS
// ======================================

module.exports = {

  verifyRazorpayWebhook,

  verifyStripeWebhook,

  verifyShopifyWebhook

};
