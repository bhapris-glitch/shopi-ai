// ======================================
// services/whatsapp.js
// Layboka AI WhatsApp Service
// Part 1
// Twilio Configuration
// USD Market Ready
// US • UK • Canada • Australia
// Updated 2026
// ======================================

require("dotenv").config();

const twilio = require("twilio");

// ======================================
// TWILIO CONFIG
// ======================================

const TWILIO_SID =
  process.env.TWILIO_SID;

const TWILIO_AUTH_TOKEN =
  process.env.TWILIO_AUTH_TOKEN;

const TWILIO_WHATSAPP_NUMBER =
  process.env.TWILIO_WHATSAPP_NUMBER;

// ======================================
// CLIENT
// ======================================

let client = null;

if (

  TWILIO_SID &&
  TWILIO_AUTH_TOKEN

){

  client = twilio(

    TWILIO_SID,
    TWILIO_AUTH_TOKEN

  );

}

// ======================================
// SEND WHATSAPP
// Universal Sender
// ======================================

async function sendWhatsApp({

  to,
  phone,
  message

}){

  try{

    if(!client){

      throw new Error(
        "Twilio not configured"
      );

    }

    const recipient =
      to || phone;

    if(!recipient){

      return {

        success:false,

        error:
        "Recipient missing"

      };

    }

    const response =
      await client.messages.create({

        from:
          `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${recipient}`,

        body:
          message

      });

    console.log(

      "✅ WhatsApp Sent:",

      response.sid

    );

    return {

      success:true,

      sid:
        response.sid

    };

  }catch(err){

    console.log(

      "❌ WhatsApp Error:",

      err.message

    );

    return {

      success:false,

      error:
        err.message

    };

  }

}

// ======================================
// SEND TEMPLATE
// Reusable Message Builder
// ======================================

async function sendWhatsAppTemplate({

  phone,
  title,
  body,
  footer

}){

  try{

    const message = `

${title || ""}

${body || ""}

${footer || "— Layboka AI"}

`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(

      "Template Error:",

      err.message

    );

    return {

      success:false

    };

  }

}

// ======================================
// PART 2
// ======================================
// CART RECOVERY
// Shopify Recovery Message
// ======================================

async function sendCartRecovery({

  phone,
  customerName,
  checkoutUrl,
  productTitle,
  discountCode

}){

  try{

    const message = `

🛒 Hi ${customerName || "there"}!

You left:

${productTitle || "items"}

in your cart.

${discountCode
? `🎁 Discount Code: ${discountCode}`
: ""}

Complete checkout before
stock runs out.

👉 ${checkoutUrl}

— ${process.env.BRAND_NAME || "Layboka AI"}

`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(

      "Cart Recovery Error:",

      err.message

    );

    return {

      success:false

    };

  }

}

// ======================================
// ADVANCED RECOVERY
// Used By Abandoned Cart Cron
// ======================================

async function sendWhatsAppRecovery({

  phone,
  name,
  store,
  recoveryUrl,
  secondReminder = false

}){

  try{

    const message = secondReminder

      ?

`🔥 Hi ${name || "there"}!

Your cart at ${store}
is still reserved.

This may be your final reminder.

Complete checkout now:

${recoveryUrl}

— Team ${store}`

      :

`🛒 Hi ${name || "there"}!

You left items in your cart at:

${store}

Complete checkout here:

${recoveryUrl}

We'll keep your cart ready for a limited time.

— Team ${store}`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(

      "Recovery Error:",

      err.message

    );

    return {

      success:false

    };

  }

}

// ======================================
// AI PRODUCT RECOMMENDATION
// GPT Generated Upsell
// ======================================

async function sendAIRecommendation({

  phone,
  customerName,
  productName,
  productUrl,
  price,
  discount

}){

  try{

    const message = `

⭐ Hi ${customerName || "there"}!

Based on what customers love,
we recommend:

${productName}

${price
? `💵 Price: $${price}`
: ""}

${discount
? `🎁 Save ${discount}`
: ""}

View Product:

${productUrl}

— Layboka AI

`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(

      "Recommendation Error:",

      err.message

    );

    return {

      success:false

    };

  }

}

// ======================================
// PART 3
// PAYMENT SUCCESS
// Subscription Activated
// ======================================

async function sendPaymentSuccess({

  phone,
  customerName,
  amount,
  plan

}){

  try{

    const message = `

✅ Payment Successful

Hi ${customerName || "there"}!

Your payment has been received.

💵 Amount:
$${amount || 0}

🚀 Plan:
${plan || "Starter"}

Your Layboka AI chatbot
is now active.

Thank you for choosing
Layboka AI.

`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(

      "Payment Success Error:",

      err.message

    );

    return {

      success:false

    };

  }

}

// ======================================
// PAYMENT FAILED
// Renewal Failure Alert
// ======================================

async function sendPaymentFailedWhatsApp({

  phone,
  paymentUrl

}){

  try{

    const message = `

❌ Payment Failed

Your Layboka AI subscription
could not be renewed.

Your chatbot may be paused
until payment is updated.

Renew now:

${paymentUrl}

`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(

      "Payment Failed Error:",

      err.message

    );

    return {

      success:false

    };

  }

}

// ======================================
// RENEWAL REMINDER
// Before Billing Date
// ======================================

async function sendRenewalReminder({

  phone,
  customerName,
  renewDate,
  paymentUrl

}){

  try{

    const message = `

⏰ Subscription Reminder

Hi ${customerName || "there"}!

Your Layboka AI plan
renews on:

${renewDate}

To avoid interruption,
please ensure your payment
method is active.

Manage Subscription:

${paymentUrl}

`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(

      "Renewal Reminder Error:",

      err.message

    );

    return {

      success:false

    };

  }

}

// ======================================
// PART 4
// SEND SUBSCRIPTION EXPIRY ALERT
// ======================================

async function sendSubscriptionExpiry({
  phone,
  customerName,
  renewDate,
  paymentUrl
}) {

  try {

    const msg = `

⚠️ Subscription Renewal Reminder

Hi ${customerName || "there"} 👋

Your Layboka AI subscription
renews on:

${renewDate}

To avoid chatbot interruption,
please ensure your payment method
is active.

💳 Manage Subscription:
${paymentUrl}

Thank you for using Layboka AI.

`;

    const response =
      await sendWhatsApp({

        phone,
        message: msg

      });

    return response;

  } catch (err) {

    console.log(
      "❌ Renewal Reminder Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// SEND AI SALES PUSH
// ======================================

async function sendSalesPush({
  phone,
  customerName,
  product,
  checkoutUrl
}) {

  try {

    const msg = `

🔥 ${customerName || "Hey"}!

Customers are loving:

${product}

⚡ Limited stock available.

Secure yours now:

${checkoutUrl}

- Team Layboka

`;

    const response =
      await sendWhatsApp({

        phone,
        message: msg

      });

    return response;

  } catch (err) {

    console.log(
      "❌ Sales Push Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  sendWhatsApp,

  sendWhatsAppRecovery,

  sendPaymentFailedWhatsApp,

  sendCartRecovery,

  sendOrderUpdate,

  sendPaymentSuccess,

  sendSubscriptionExpiry,

  sendSalesPush

};
