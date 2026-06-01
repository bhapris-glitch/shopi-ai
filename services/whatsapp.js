// ======================================
// services/whatsapp.js
// Production WhatsApp Service
// Twilio + Shopify Recovery
// ======================================

require("dotenv").config();

const twilio = require("twilio");

// ======================================
// TWILIO CLIENT
// ======================================

const client = twilio(

  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN

);

// ======================================
// SEND SIMPLE MESSAGE
// ======================================
// COMPATIBLE SEND WHATSAPP
// Supports:
// sendWhatsApp({to,message})
// sendWhatsApp({phone,message})
// ======================================

async function sendWhatsApp({

  to,
  phone,
  message

}){

  try{

    const recipient = to || phone;

    if(!recipient){

      return {

        success:false,

        error:"Phone number missing"

      };

    }

    const response =
      await client.messages.create({

        from:
          `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${recipient}`,

        body: message

      });

    console.log(
      "✅ WhatsApp Sent:",
      response.sid
    );

    return {

      success:true,

      sid:response.sid

    };

  }catch(err){

    console.log(
      "❌ WhatsApp Error:",
      err.message
    );

    return {

      success:false,

      error:err.message

    };

  }

}

// ======================================
// RECOVERY WRAPPER
// Used by abandonedCartCron.js
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

`🛒 Hi ${name || "there"}!

Your cart at ${store}
is still waiting.

Complete checkout:

${recoveryUrl}

This reminder may expire soon.`

      :

`🛒 Hi ${name || "there"}!

You left items in your cart at ${store}.

Complete your checkout:

${recoveryUrl}

We'll save your cart for a limited time.`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(
      "Recovery WhatsApp Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// PAYMENT FAILED ALERT
// Used by renewalCron.js
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

Renew now:

${paymentUrl}

`;

    return await sendWhatsApp({

      phone,

      message

    });

  }catch(err){

    console.log(
      "Payment Failed WhatsApp Error:",
      err.message
    );

    return {

      success:false

    };

  }

}
// ======================================
// SEND CART RECOVERY
// ======================================

async function sendCartRecovery({

  phone,
  customerName,
  checkoutUrl,
  productTitle,
  discountCode

}){

  try{

    const msg = `

🛒 Hi ${customerName || "there"}!

You left:

${productTitle || "items"}

in your cart.

🔥 Complete checkout now before
stock runs out.

🎁 Discount:
${discountCode || "SAVE10"}

⚡ Checkout:
${checkoutUrl}

- Team Layboka

`;

    const response =
      await client.messages.create({

        from:
          `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${phone}`,

        body: msg

      });

    console.log(
      "✅ Recovery WhatsApp Sent"
    );

    return {

      success:true,

      sid:response.sid

    };

  }catch(err){

    console.log(
      "❌ Recovery WhatsApp Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// SEND ORDER UPDATE
// ======================================

async function sendOrderUpdate({

  phone,
  customerName,
  orderId,
  trackingUrl

}){

  try{

    const msg = `

📦 Hi ${customerName || "Customer"}!

Your order #${orderId}
has been shipped 🚚

Track here:
${trackingUrl}

Thank you for shopping with us ❤️

`;

    const response =
      await client.messages.create({

        from:
          `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${phone}`,

        body: msg

      });

    console.log(
      "✅ Order Update Sent"
    );

    return {

      success:true,

      sid:response.sid

    };

  }catch(err){

    console.log(
      "❌ Order Update Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// SEND PAYMENT SUCCESS
// ======================================

async function sendPaymentSuccess({

  phone,
  customerName,
  amount

}){

  try{

    const msg = `

💳 Payment Successful

Hi ${customerName || "there"} 👋

Your payment of ₹${amount}
was received successfully.

✅ Your AI chatbot is now active.

🚀 Welcome to Layboka AI

`;

    const response =
      await client.messages.create({

        from:
          `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${phone}`,

        body: msg

      });

    console.log(
      "✅ Payment WhatsApp Sent"
    );

    return {

      success:true,

      sid:response.sid

    };

  }catch(err){

    console.log(
      "❌ Payment WhatsApp Error:",
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// SEND SUBSCRIPTION EXPIRY ALERT
// ======================================

async function sendSubscriptionExpiry({

  phone,
  customerName,
  renewDate,
  paymentUrl

}){

  try{

    const msg = `

⚠️ Subscription Renewal Reminder

Hi ${customerName || "there"} 👋

Your Layboka AI subscription
renews on:

${renewDate}

To avoid chatbot interruption,
please ensure autopay is active.

💳 Renew Here:
${paymentUrl}

`;

    const response =
      await client.messages.create({

        from:
          `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${phone}`,

        body: msg

      });

    console.log(
      "✅ Renewal Reminder Sent"
    );

    return {

      success:true,

      sid:response.sid

    };

  }catch(err){

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

}){

  try{

    const msg = `

🔥 ${customerName || "Hey"}!

Customers are buying:

${product}

right now.

⚡ Grab yours before stock ends.

👉 ${checkoutUrl}

`;

    const response =
      await client.messages.create({

        from:
          `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

        to:
          `whatsapp:${phone}`,

        body: msg

      });

    console.log(
      "✅ AI Sales Push Sent"
    );

    return {

      success:true,

      sid:response.sid

    };

  }catch(err){

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

  sendCartRecovery,

  sendWhatsAppRecovery,

  sendOrderUpdate,

  sendPaymentSuccess,

  sendPaymentFailedWhatsApp,

  sendSubscriptionExpiry,

  sendSalesPush

};
