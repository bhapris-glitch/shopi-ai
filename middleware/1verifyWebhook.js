// ======================================
// middleware/verifyWebhook.js
// Layboka AI Webhook Verification
// ======================================

const crypto =
  require("crypto");

// ======================================
// SHOPIFY WEBHOOK VERIFY
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

    const digest =
      crypto

      .createHmac(

        "sha256",

        process.env
        .SHOPIFY_API_SECRET

      )

      .update(
        req.body,
        "utf8"
      )

      .digest("base64");

    if(digest !== hmac){

      return res.status(401)
      .send("Invalid webhook");

    }

    next();

  }catch(err){

    console.log(
      "SHOPIFY WEBHOOK ERROR:",
      err
    );

    res.status(500).send(
      "Webhook failed"
    );

  }

}

// ======================================
// STRIPE WEBHOOK VERIFY
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

      return res.status(401)
      .send(
        "Missing stripe signature"
      );

    }

    next();

  }catch(err){

    console.log(
      "STRIPE VERIFY ERROR:",
      err
    );

    res.status(500).send(
      "Stripe verify failed"
    );

  }

}

module.exports = {

  verifyShopifyWebhook,
  verifyStripeWebhook

};
