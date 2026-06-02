// ======================================
// middleware/verifyWebhook.js
// Layboka AI Webhook Verification
// Production Ready
// updated 2Jun 2026
// ======================================

const crypto =
  require("crypto");

// ======================================
// SHOPIFY WEBHOOK VERIFY
// IMPORTANT:
// Route must use express.raw()
// ======================================

function verifyShopifyWebhook(

  req,
  res,
  next

){

  try{

    const hmac =

      req.headers[
        "x-shopify-hmac-sha256"
      ];

    if(!hmac){

      return res
        .status(401)
        .send(
          "Missing Shopify HMAC"
        );

    }

    if(
      !process.env
      .SHOPIFY_API_SECRET
    ){

      console.log(
        "Missing SHOPIFY_API_SECRET"
      );

      return res
        .status(500)
        .send(
          "Webhook configuration error"
        );

    }

    const digest =

      crypto

      .createHmac(

        "sha256",

        process.env
        .SHOPIFY_API_SECRET

      )

      .update(
        req.body
      )

      .digest("base64");

    const valid =

      crypto.timingSafeEqual(

        Buffer.from(digest),

        Buffer.from(hmac)

      );

    if(!valid){

      return res
        .status(401)
        .send(
          "Invalid webhook"
        );

    }

    next();

  }catch(err){

    console.log(

      "SHOPIFY WEBHOOK ERROR:",

      err.message

    );

    return res
      .status(500)
      .send(
        "Webhook failed"
      );

  }

}

// ======================================
// STRIPE WEBHOOK VERIFY
// IMPORTANT:
// Route must use express.raw()
// ======================================

function verifyStripeWebhook(

  req,
  res,
  next

){

  try{

    const signature =

      req.headers[
        "stripe-signature"
      ];

    if(!signature){

      return res
        .status(401)
        .send(
          "Missing stripe signature"
        );

    }

    if(
      !process.env
      .STRIPE_WEBHOOK_SECRET
    ){

      console.log(
        "Missing STRIPE_WEBHOOK_SECRET"
      );

      return res
        .status(500)
        .send(
          "Webhook configuration error"
        );

    }

    req.stripeSignature =
      signature;

    next();

  }catch(err){

    console.log(

      "STRIPE VERIFY ERROR:",

      err.message

    );

    return res
      .status(500)
      .send(
        "Stripe verify failed"
      );

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  verifyShopifyWebhook,

  verifyStripeWebhook

};
