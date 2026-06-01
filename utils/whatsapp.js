// ======================================
// utils/whatsapp.js
// Layboka AI WhatsApp Service
// Production Ready
// Updated 1 Jun 2026
// ======================================

require("dotenv").config();

const fetch = require("node-fetch");

// ======================================
// CONFIG
// ======================================

const WHATSAPP_TOKEN =
  process.env.WHATSAPP_TOKEN;

const PHONE_NUMBER_ID =
  process.env.WHATSAPP_PHONE_ID;

// ======================================
// SEND MESSAGE
// ======================================

async function sendWhatsApp({

  phone,
  message

}){

  try{

    if(
      !WHATSAPP_TOKEN ||
      !PHONE_NUMBER_ID
    ){

      console.log(
        "WhatsApp credentials missing"
      );

      return {
        success:false
      };

    }

    const response =
      await fetch(

        `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,

        {

          method:"POST",

          headers:{

            Authorization:
              `Bearer ${WHATSAPP_TOKEN}`,

            "Content-Type":
              "application/json"

          },

          body:JSON.stringify({

            messaging_product:
              "whatsapp",

            to:phone,

            type:"text",

            text:{
              body:message
            }

          })

        }

      );

    const data =
      await response.json();

    if(data.error){

      console.log(
        "WhatsApp Error:",
        data.error.message
      );

      return {

        success:false,

        error:
          data.error.message

      };

    }

    return {

      success:true,

      data

    };

  }catch(err){

    console.log(

      "WhatsApp Error:",

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
// ABANDONED CART MESSAGE
// ======================================

async function sendWhatsAppRecovery({

  phone,
  name = "Customer",
  store = "Store",
  recoveryUrl,
  secondReminder = false

}){

  try{

    const message = secondReminder

      ?

`⏰ Last reminder ${name}

Your cart at ${store} is still waiting.

Complete your order now:

${recoveryUrl}`

      :

`🛒 Hi ${name}

You left items in your cart at ${store}.

Complete checkout here:

${recoveryUrl}`;

    return await sendWhatsApp({

      phone,
      message

    });

  }catch(err){

    console.log(
      err.message
    );

    return {

      success:false

    };

  }

}

// ======================================
// REFERRAL MESSAGE
// ======================================

async function sendReferralWhatsApp({

  phone,
  referralLink

}){

  return sendWhatsApp({

    phone,

    message:

`🎁 Invite friends and earn rewards.

Your referral link:

${referralLink}`

  });

}

// ======================================
// SUBSCRIPTION ALERT
// ======================================

async function sendSubscriptionWhatsApp({

  phone,
  plan

}){

  return sendWhatsApp({

    phone,

    message:

`✅ Your ${plan} subscription is active.

Thank you for choosing Layboka AI.`

  });

}

// ======================================
// COUPON ALERT
// ======================================

async function sendCouponWhatsApp({

  phone,
  code,
  discount

}){

  return sendWhatsApp({

    phone,

    message:

`🎁 Special Offer

Use code:

${code}

and save ${discount}% today.`

  });

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  sendWhatsApp,

  sendWhatsAppRecovery,

  sendReferralWhatsApp,

  sendSubscriptionWhatsApp,

  sendCouponWhatsApp

};
