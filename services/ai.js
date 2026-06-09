// ======================================
// services/ai.js
// Layboka AI Engine v3
// GPT-4o-mini Optimized
// Production Ready
// Part 1/3
// ======================================

const fetch = require("node-fetch");

const Client = require("../models/Client");
const Product = require("../models/Product");
const Conversation = require("../models/Conversation");
const Subscription = require("../models/Subscription");

// ======================================
// CONFIG
// ======================================

const OPENAI_URL =
  "https://api.openai.com/v1/chat/completions";

const MODEL =
  process.env.OPENAI_MODEL ||
  "gpt-4o-mini";

const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY;

// ======================================
// HELPERS
// ======================================

function safeText(value) {

  if (!value) return "";

  return String(value)
    .replace(/\s+/g, " ")
    .trim();

}

function truncate(text, max = 1000) {

  if (!text) return "";

  return text.length > max
    ? text.substring(0, max)
    : text;

}

// ======================================
// SYSTEM PROMPT
// ======================================

function buildSystemPrompt(client) {

  let prompt = `

You are Layboka AI.

You are an elite ecommerce sales assistant.

Goals:

1. Increase conversions
2. Increase average order value
3. Recover abandoned carts
4. Improve checkout rate
5. Recommend products naturally

Communication style:

- Friendly
- Professional
- Premium
- Helpful
- Persuasive

Rules:

- Keep replies concise
- Never overwhelm customers
- Guide toward purchase
- Recommend products naturally
- Encourage checkout
- Mention offers when relevant
- Focus on customer needs

`;

  // ==========================
  // STORE INFO
  // ==========================

  if (client?.storeDisplayName) {

    prompt += `

Store:
${client.storeDisplayName}

`;

  }

  if (client?.agentName) {

    prompt += `

Assistant Name:
${client.agentName}

`;

  }

  // ==========================
  // PREMIUM MODE
  // ==========================

  if (

    client?.plan === "premium" ||

    client?.plan === "enterprise"

  ) {

    prompt += `

Premium Features Enabled:

- Checkout closer
- Revenue optimization
- Smart upsells
- Cross-sells
- Scarcity marketing
- Social proof
- Cart recovery psychology

`;

  }

  return prompt;

}

// ======================================
// CUSTOMER MEMORY
// ======================================

function buildCustomerMemory(conversation) {

  if (!conversation) {

    return "";

  }

  let memory = `

Customer Profile

Name:
${conversation.customerName || ""}

Email:
${conversation.email || ""}

Phone:
${conversation.phone || ""}

Interested Product:
${conversation.interestedProduct || ""}

Converted:
${conversation.converted ? "YES" : "NO"}

`;

  if (conversation.summary) {

    memory += `

Conversation Summary:

${truncate(
  conversation.summary,
  1200
)}

`;

  }

  if (

    Array.isArray(
      conversation.tags
    ) &&

    conversation.tags.length

  ) {

    memory += `

Customer Tags:

${conversation.tags.join(", ")}

`;

  }

  return memory;

}

// ======================================
// PRODUCT CONTEXT
// ======================================

function buildProductRecommendations(
  products = []
) {

  if (!products.length) {

    return "";

  }

  let text = `

Available Products:

`;

  products
    .slice(0, 10)
    .forEach((p) => {

      text += `

Title:
${p.title}

Price:
$${p.price}

Category:
${p.productType || ""}

Vendor:
${p.vendor || ""}

`;

    });

  return text;

}

// ======================================
// CART CONTEXT
// ======================================

function buildCartRecovery(
  cart = []
) {

  if (!cart.length) {

    return "";

  }

  return `

Customer Cart:

${JSON.stringify(
  cart,
  null,
  2
)}

Recovery Goal:

- Encourage checkout
- Reduce hesitation
- Increase urgency
- Recover abandoned order

`;

}

// ======================================
// CHECKOUT CLOSER
// ======================================

function buildCheckoutCloser() {

  return `

Checkout Closer Rules:

- Reduce hesitation
- Build confidence
- Highlight benefits
- Encourage checkout
- Avoid aggressive pressure

`;

}

// ======================================
// UPSELL BLOCK
// ======================================

function buildUpsellSuggestions(
  products = []
) {

  if (!products.length) {

    return "";

  }

  const upsells =
    [...products]
      .sort(
        (a, b) =>
          (b.upsellScore || 0) -
          (a.upsellScore || 0)
      )
      .slice(0, 5);

  let text = `

Upsell Products:

`;

  upsells.forEach((p) => {

    text += `

${p.title}
Price: $${p.price}

`;

  });

  return text;

}

// ======================================
// BUILD FULL CONTEXT
// ======================================

function buildFullContext({

  client,
  conversation,
  products,
  cart,
  enableUpsell,
  enableCheckoutCloser,
  enableCartRecovery

}) {

  let context = "";

  context +=
    buildSystemPrompt(client);

  context +=
    buildCustomerMemory(
      conversation
    );

  context +=
    buildProductRecommendations(
      products
    );

  if (enableCartRecovery) {

    context +=
      buildCartRecovery(cart);

  }

  if (enableCheckoutCloser) {

    context +=
      buildCheckoutCloser();

  }

  if (enableUpsell) {

    context +=
      buildUpsellSuggestions(
        products
      );

  }

  return context;

}

// ======================================
// PART 2/3
// Subscription Protection
// Product Engine
// OpenAI Engine
// ======================================

// ======================================
// SUBSCRIPTION VALIDATION
// ======================================

async function validateSubscription(
  clientId
) {

  try {

    const subscription =
      await Subscription.findOne({

        clientId

      });

    if (!subscription) {

      return {

        active: true

      };

    }

    if (subscription.locked) {

      return {

        active: false,

        reason: "locked"

      };

    }

    if (

      subscription.status ===
      "cancelled"

    ) {

      return {

        active: false,

        reason: "cancelled"

      };

    }

    if (

      subscription.status ===
      "expired"

    ) {

      return {

        active: false,

        reason: "expired"

      };

    }

    if (

      subscription.expiresAt &&

      new Date(
        subscription.expiresAt
      ) < new Date()

    ) {

      return {

        active: false,

        reason: "expired"

      };

    }

    return {

      active: true

    };

  } catch (err) {

    console.log(
      "SUBSCRIPTION ERROR:",
      err
    );

    return {

      active: true

    };

  }

}

// ======================================
// RECOMMENDED PRODUCTS
// ======================================

async function getRecommendedProducts(

  clientId,

  limit = 5

) {

  try {

    return await Product.find({

      clientId,

      active: true

    })

      .sort({

        recommended: -1,

        popularityScore: -1,

        conversionScore: -1

      })

      .limit(limit)

      .lean();

  } catch (err) {

    console.log(
      "RECOMMEND ERROR:",
      err
    );

    return [];

  }

}

// ======================================
// UPSELL PRODUCTS
// ======================================

async function getUpsellProducts(

  clientId,

  limit = 5

) {

  try {

    return await Product.find({

      clientId,

      active: true

    })

      .sort({

        upsellScore: -1

      })

      .limit(limit)

      .lean();

  } catch (err) {

    console.log(
      "UPSELL ERROR:",
      err
    );

    return [];

  }

}

// ======================================
// CROSS SELL PRODUCTS
// ======================================

async function getCrossSellProducts(

  clientId,

  limit = 5

) {

  try {

    return await Product.find({

      clientId,

      active: true

    })

      .sort({

        crossSellScore: -1

      })

      .limit(limit)

      .lean();

  } catch (err) {

    console.log(
      "CROSSSELL ERROR:",
      err
    );

    return [];

  }

}

// ======================================
// PRODUCT CARD
// ======================================

function generateProductCard(
  product
) {

  if (!product) return "";

  return `

<div style="
background:#111827;
padding:14px;
border-radius:18px;
margin-top:12px;
border:1px solid rgba(255,255,255,.08);
">

<img
src="${product.image || ""}"
style="
width:100%;
border-radius:14px;
margin-bottom:10px;
"
/>

<h3 style="
color:#fff;
font-size:16px;
margin-bottom:8px;
">
${product.title}
</h3>

<p style="
color:#00ffc3;
font-size:18px;
font-weight:bold;
margin-bottom:12px;
">
$${product.price}
</p>

<button
onclick="window.open('${product.handle || "#"}')"
style="
width:100%;
padding:12px;
border:none;
border-radius:12px;
background:
linear-gradient(
135deg,
#00ffc3,
#00aaff
);
color:#000;
font-weight:bold;
cursor:pointer;
">
🛒 View Product
</button>

</div>

`;

}

// ======================================
// CART RECOVERY MESSAGE
// ======================================

function generateRecoveryMessage(

  customerName = ""

) {

  return `

Hey ${customerName || "there"} 👋

You still have items waiting in your cart.

🔥 Popular products may sell out.

Complete checkout now while they're available.

`;

}

// ======================================
// CHECKOUT BUTTON
// ======================================

function generateCheckoutButton() {

  return `

<div style="
margin-top:14px;
">

<a href="/checkout"
style="
display:inline-block;
padding:12px 18px;
border-radius:12px;
background:
linear-gradient(
135deg,
#00ffc3,
#00aaff
);
color:#000;
font-weight:bold;
text-decoration:none;
box-shadow:
0 10px 30px
rgba(0,255,200,.25);
">
⚡ Complete Checkout
</a>

</div>

`;

}

// ======================================
// OPENAI REQUEST
// ======================================

async function callOpenAI(

  systemPrompt,

  userMessage,

  history = []

) {

  try {

    const messages = [

      {

        role: "system",

        content: systemPrompt

      },

      ...history,

      {

        role: "user",

        content: userMessage

      }

    ];

    const response =
      await fetch(

        OPENAI_URL,

        {

          method: "POST",

          headers: {

            Authorization:
            `Bearer ${OPENAI_API_KEY}`,

            "Content-Type":
            "application/json"

          },

          body: JSON.stringify({

            model: MODEL,

            messages,

            temperature: 0.7,

            max_tokens: 450

          })

        }

      );

    if (!response.ok) {

      const err =
        await response.text();

      throw new Error(err);

    }

    const data =
      await response.json();

    return (

      data?.choices?.[0]
      ?.message?.content ||

      "I'm happy to help you find the right product."

    );

  } catch (err) {

    console.log(
      "OPENAI ERROR:",
      err
    );

    return
      "⚠️ I'm temporarily unavailable. Please try again.";

  }

}

// ======================================
// PART 3/3
// Main AI Engine
// Analytics
// Memory
// Exports
// ======================================

// ======================================
// ANALYZE INTENT
// ======================================

async function analyzeCustomerIntent(
  userMessage
) {

  const message =
    (userMessage || "")
    .toLowerCase();

  if (
    message.includes("buy") ||
    message.includes("purchase")
  ) {
    return "purchase";
  }

  if (
    message.includes("checkout")
  ) {
    return "checkout";
  }

  if (
    message.includes("price") ||
    message.includes("cost")
  ) {
    return "pricing";
  }

  if (
    message.includes("shipping") ||
    message.includes("delivery")
  ) {
    return "shipping";
  }

  return "general";

}

// ======================================
// GENERATE AI RESPONSE
// ======================================

async function generateAIResponse({

  clientId,
  conversationId,
  userMessage,
  cartItems = [],
  viewedProducts = []

}) {

  try {

    // =========================
    // CLIENT
    // =========================

    const client =
      await Client.findById(
        clientId
      );

    if (!client) {

      return {

        success: false,

        reply:
        "Store not found."

      };

    }

    // =========================
    // SUBSCRIPTION
    // =========================

    const sub =
      await validateSubscription(
        client._id
      );

    if (!sub.active) {

      return {

        success: false,

        locked: true,

        reply:
        "Your subscription is inactive."

      };

    }

    // =========================
    // CONVERSATION
    // =========================

    let conversation =
      null;

    if (conversationId) {

      conversation =
        await Conversation.findById(
          conversationId
        );

    }

    // =========================
    // PRODUCTS
    // =========================

    const recommendedProducts =
      await getRecommendedProducts(
        client._id,
        5
      );

    const upsellProducts =
      await getUpsellProducts(
        client._id,
        5
      );

    // =========================
    // BUILD CONTEXT
    // =========================

    const systemPrompt =
      buildFullContext({

        client,

        conversation,

        products:
          recommendedProducts,

        cart:
          cartItems,

        enableUpsell:
          true,

        enableCheckoutCloser:
          client.plan ===
            "premium" ||

          client.plan ===
            "enterprise",

        enableCartRecovery:
          cartItems.length > 0

      });

    // =========================
    // HISTORY
    // =========================

    let history = [];

    if (
      conversation &&
      conversation.messages
    ) {

      history =
        conversation.messages
          .slice(-20)
          .map((m) => ({

            role:
              m.sender ===
              "customer"

                ? "user"

                : "assistant",

            content:
              m.message

          }));

    }

    // =========================
    // GPT
    // =========================

    let reply =
      await callOpenAI(

        systemPrompt,

        userMessage,

        history

      );

    // =========================
    // INTENT
    // =========================

    const intent =
      await analyzeCustomerIntent(
        userMessage
      );

    // =========================
    // CHECKOUT PUSH
    // =========================

    if (

      intent === "purchase" ||

      intent === "checkout" ||

      intent === "pricing"

    ) {

      reply +=
        generateCheckoutButton();

    }

    // =========================
    // CART RECOVERY
    // =========================

    if (
      cartItems.length > 0
    ) {

      reply +=
        generateRecoveryMessage(
          conversation
            ?.customerName
        );

    }

    // =========================
    // PRODUCT RESULTS
    // =========================

    let products = [];

    if (

      intent === "purchase" ||

      intent === "general"

    ) {

      products =
        recommendedProducts
          .slice(0, 3);

    }

    // =========================
    // ANALYTICS
    // =========================

    client.messages =
      (client.messages || 0) + 1;

    client.lastLoginAt =
      new Date();

    await client.save();

    // =========================
    // PRODUCT ANALYTICS
    // =========================

    for (const p of products) {

      try {

        await Product.updateOne(

          {

            _id: p._id

          },

          {

            $inc: {

              views: 1

            }

          }

        );

      } catch (err) {}

    }

    // =========================
    // MEMORY SAVE
    // =========================

    if (conversation) {

      conversation.messages.push({

        sender:
          "customer",

        message:
          userMessage,

        platform:
          "website"

      });

      conversation.messages.push({

        sender:
          "ai",

        message:
          reply,

        platform:
          "website",

        agentName:
          client.agentName ||
          "Emma"

      });

      conversation.totalMessages =
        conversation.messages.length;

      conversation.updatedAt =
        new Date();

      await conversation.save();

    }

    // =========================
    // RETURN
    // =========================

    return {

      success: true,

      reply,

      products,

      conversationId:
        conversation?._id ||

        null

    };

  } catch (err) {

    console.log(
      "AI ENGINE ERROR:",
      err
    );

    return {

      success: false,

      reply:
      "⚠️ AI temporarily unavailable."

    };

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  // PROMPTS

  buildSystemPrompt,
  buildCustomerMemory,
  buildProductRecommendations,
  buildCartRecovery,
  buildCheckoutCloser,
  buildUpsellSuggestions,
  buildFullContext,

  // PRODUCTS

  getRecommendedProducts,
  getUpsellProducts,
  getCrossSellProducts,

  // UI

  generateProductCard,
  generateRecoveryMessage,
  generateCheckoutButton,

  // GPT

  callOpenAI,

  // MAIN

  generateAIResponse,
  analyzeCustomerIntent,

  // BILLING

  validateSubscription

};
