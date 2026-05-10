// ======================================
// services/checkoutCloser.js
// AI Checkout Closer Engine
// Shopify Sales Conversion AI
// ======================================

require("dotenv").config();

const fetch = require("node-fetch");

// ======================================
// AI CHECKOUT CLOSER
// ======================================

async function generateCheckoutReply({

  customerMessage,
  customerName,
  cartItems,
  totalPrice,
  discountCode,
  checkoutUrl,
  storeName

}){

  try{

    const prompt = `

You are an elite Shopify AI sales closer.

Your goal:
- Push user to checkout
- Remove hesitation
- Increase conversion
- Create urgency
- Sound human
- Be short and persuasive

Customer Name:
${customerName || "Customer"}

Cart:
${cartItems || "Products"}

Cart Total:
${totalPrice || "0"}

Discount:
${discountCode || "SAVE10"}

Checkout URL:
${checkoutUrl}

Store:
${storeName || "Layboka"}

Customer Message:
${customerMessage}

Rules:
- Keep response under 120 words
- Add urgency
- Mention benefits
- Push checkout naturally
- Add emojis
- End with CTA

`;

    const response =
      await fetch(

        "https://api.openai.com/v1/chat/completions",

        {

          method:"POST",

          headers:{

            "Authorization":
              `Bearer ${process.env.OPENAI_API_KEY}`,

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            model:"gpt-4o-mini",

            messages:[

              {

                role:"system",

                content:
                  "You are a world-class ecommerce sales closer."

              },

              {

                role:"user",

                content:prompt

              }

            ]

          })

        }

      );

    const data =
      await response.json();

    return {

      success:true,

      reply:
        data.choices?.[0]?.message?.content ||

        `🔥 Your cart is almost sold out.

Complete checkout now:

${checkoutUrl}`

    };

  }catch(err){

    console.log(
      "❌ Checkout Closer Error:",
      err.message
    );

    return {

      success:false,

      reply:
        `⚡ Your cart is ready.

Complete checkout now:

${checkoutUrl}`

    };

  }

}

// ======================================
// CART RECOVERY MESSAGE
// ======================================

async function generateRecoveryMessage({

  customerName,
  productTitle,
  checkoutUrl

}){

  try{

    return `

🛒 Hey ${customerName || "there"}!

You left:

🔥 ${productTitle || "items"}

in your cart.

Stock is moving fast ⚡

Complete your order now before
it sells out.

👉 ${checkoutUrl}

`;

  }catch(err){

    return `

⚡ Your cart is waiting.

👉 ${checkoutUrl}

`;

  }

}

// ======================================
// DISCOUNT PUSHER
// ======================================

function generateDiscountPush({

  discountCode,
  checkoutUrl

}){

  return `

🎁 Special Discount Unlocked

Use code:

${discountCode || "SAVE10"}

at checkout today.

⚡ Complete your order:

${checkoutUrl}

`;

}

// ======================================
// URGENCY BOOSTER
// ======================================

function generateUrgencyMessage({

  product,
  checkoutUrl

}){

  return `

🔥 ${product || "This product"}
is trending right now.

Only limited stock remaining.

⚡ Buy before it sells out:

${checkoutUrl}

`;

}

// ======================================
// SMART RECOMMENDATION
// ======================================

async function generateUpsell({

  currentProduct,
  recommendedProduct,
  checkoutUrl

}){

  return `

💡 Customers who bought
${currentProduct}

also loved:

🔥 ${recommendedProduct}

Add it before checkout.

👉 ${checkoutUrl}

`;

}

// ======================================
// EXIT INTENT MESSAGE
// ======================================

function generateExitIntent({

  checkoutUrl

}){

  return `

⏳ Wait!

Before you leave...

Your cart is still reserved.

Complete checkout now:

${checkoutUrl}

`;

}

// ======================================
// FREE SHIPPING PUSH
// ======================================

function freeShippingPush({

  remainingAmount,
  checkoutUrl

}){

  return `

🚚 You're only ₹${remainingAmount}
away from FREE shipping.

Add one more item and save more.

👉 ${checkoutUrl}

`;

}

// ======================================
// PAYMENT FAILURE RECOVERY
// ======================================

function paymentRetry({

  checkoutUrl

}){

  return `

⚠️ Your payment did not complete.

No worries — your cart is saved.

Try again here:

${checkoutUrl}

`;

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  generateCheckoutReply,

  generateRecoveryMessage,

  generateDiscountPush,

  generateUrgencyMessage,

  generateUpsell,

  generateExitIntent,

  freeShippingPush,

  paymentRetry

};
