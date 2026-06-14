// ======================================
// services/ai.js
// Layboka AI Engine v4
// GPT-4o-mini / GPT-5
// Production Ready
// PART 1 / 5
// ======================================

const fetch = require("node-fetch");

const Client = require("../models/Client");
const Product = require("../models/Product");
const Conversation = require("../models/Conversation");
const Subscription = require("../models/Subscription");

// ======================================
// OPENAI CONFIG
// ======================================

const OPENAI_URL =
  "https://api.openai.com/v1/chat/completions";

const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY;

// ======================================
// MODEL SELECTOR
// ======================================

function getModel(
  client,
  subscription
) {

  // 7-Day Trial
  if (
    subscription &&
    subscription.status === "trial"
  ) {
    return "gpt-5";
  }

  // Premium Plans
  if (
    client &&
    (
      client.plan === "premium" ||
      client.plan === "enterprise"
    )
  ) {
    return "gpt-5";
  }

  // Default
  return "gpt-4o-mini";

}

// ======================================
// HELPERS
// ======================================

function safeText(value) {

  if (!value) return "";

  return String(value)
    .replace(/\s+/g, " ")
    .trim();

}

function truncate(
  text,
  max = 1200
) {

  if (!text) return "";

  if (text.length <= max)
    return text;

  return text.substring(0, max);

}

function money(value) {

  return Number(value || 0)
    .toFixed(2);

}

// ======================================
// SYSTEM PROMPT
// ======================================

function buildSystemPrompt(
  client
) {

  let prompt = `

You are Layboka AI.

You are an elite ecommerce sales assistant.

Primary Goals

• Increase conversions
• Recover abandoned carts
• Increase AOV
• Recommend products naturally
• Close sales

Rules

• Friendly
• Professional
• Premium tone
• Never spam
• Never invent products
• Never invent prices
• Keep replies short
• Guide customer toward purchase
• Recommend products only when relevant

`;

  if (client?.storeDisplayName) {

    prompt += `

Store Name

${client.storeDisplayName}

`;

  }

  if (client?.agentName) {

    prompt += `

Assistant Name

${client.agentName}

`;

  }

  if (
    client?.plan === "premium" ||
    client?.plan === "enterprise"
  ) {

    prompt += `

Premium Features Enabled

• Checkout Closer
• Smart Upsells
• Cross Sell
• Sales Psychology
• Revenue Optimization
• Cart Recovery

`;

  }

  return prompt;

}

// ======================================
// CUSTOMER MEMORY
// ======================================

function buildCustomerMemory(
  conversation
) {

  if (!conversation)
    return "";

  let memory = `

Customer

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

Conversation Summary

${truncate(
  conversation.summary,
  1500
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

Tags

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

  if (!products.length)
    return "";

  let text = `

Available Products

`;

  products
    .slice(0, 10)
    .forEach(product => {

      text += `

Title:
${safeText(product.title)}

Price:
$${money(product.price)}

Category:
${safeText(product.productType)}

Vendor:
${safeText(product.vendor)}

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

  if (!cart.length)
    return "";

  return `

Customer Cart

${JSON.stringify(
  cart,
  null,
  2
)}

Recovery Goal

Recover this order.
Reduce hesitation.
Encourage checkout.

`;

}

// ======================================
// CHECKOUT CLOSER
// ======================================

function buildCheckoutCloser() {

  return `

Checkout Closer

Handle objections.

Build trust.

Reduce hesitation.

Increase urgency naturally.

`;

}

// ======================================
// UPSELL PRODUCTS
// ======================================

function buildUpsellSuggestions(
  products = []
) {

  if (!products.length)
    return "";

  const upsells =
    [...products]
      .sort(
        (a,b)=>
          (b.upsellScore||0)-
          (a.upsellScore||0)
      )
      .slice(0,5);

  let text = `

Upsell Products

`;

  upsells.forEach(product=>{

    text += `

${safeText(product.title)}

Price:
$${money(product.price)}

`;

  });

  return text;

}

// ======================================
// BUILD FULL AI CONTEXT
// ======================================

function buildFullContext({

  client,

  conversation,

  products = [],

  cart = [],

  enableUpsell = true,

  enableCheckoutCloser = true,

  enableCartRecovery = true

}){

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

  if(enableCartRecovery){

    context +=
      buildCartRecovery(cart);

  }

  if(enableCheckoutCloser){

    context +=
      buildCheckoutCloser();

  }

  if(enableUpsell){

    context +=
      buildUpsellSuggestions(
        products
      );

  }

  return context;

}
// ======================================
// PART 2 / 5
// Subscription
// Product Engine
// ======================================

// ======================================
// SUBSCRIPTION VALIDATION
// ======================================

async function validateSubscription(
  clientId
){

  try{

    const subscription =
      await Subscription.findOne({
        clientId
      });

    // No subscription yet
    if(!subscription){

      return{
        active:true,
        subscription:null
      };

    }

    // Locked
    if(subscription.locked){

      return{
        active:false,
        reason:"locked",
        subscription
      };

    }

    // Cancelled
    if(
      subscription.status ===
      "cancelled"
    ){

      return{
        active:false,
        reason:"cancelled",
        subscription
      };

    }

    // Expired
    if(
      subscription.status ===
      "expired"
    ){

      return{
        active:false,
        reason:"expired",
        subscription
      };

    }

    // Payment Failed
    if(
      subscription.status ===
      "payment_failed"
    ){

      return{
        active:false,
        reason:"payment_failed",
        subscription
      };

    }

    // Expiry Date
    if(

      subscription.expiryDate &&

      new Date(
        subscription.expiryDate
      ) < new Date()

    ){

      return{

        active:false,

        reason:"expired",

        subscription

      };

    }

    return{

      active:true,

      subscription

    };

  }

  catch(err){

    console.log(
      "Subscription Validation Error",
      err
    );

    return{

      active:true,

      subscription:null

    };

  }

}

// ======================================
// RECOMMENDED PRODUCTS
// ======================================

async function getRecommendedProducts(

  clientId,

  limit = 6

){

  try{

    return await Product.find({

      clientId,

      active:true

    })

    .sort({

      recommended:-1,

      popularityScore:-1,

      conversionScore:-1,

      sales:-1

    })

    .limit(limit)

    .lean();

  }

  catch(err){

    console.log(

      "Recommendation Error",

      err

    );

    return[];

  }

}

// ======================================
// UPSELL PRODUCTS
// ======================================

async function getUpsellProducts(

  clientId,

  limit = 5

){

  try{

    return await Product.find({

      clientId,

      active:true

    })

    .sort({

      upsellScore:-1,

      sales:-1

    })

    .limit(limit)

    .lean();

  }

  catch(err){

    console.log(

      "Upsell Error",

      err

    );

    return[];

  }

}

// ======================================
// CROSS SELL PRODUCTS
// ======================================

async function getCrossSellProducts(

  clientId,

  limit = 5

){

  try{

    return await Product.find({

      clientId,

      active:true

    })

    .sort({

      crossSellScore:-1

    })

    .limit(limit)

    .lean();

  }

  catch(err){

    console.log(

      "Cross Sell Error",

      err

    );

    return[];

  }

}

// ======================================
// SEARCH PRODUCTS
// ======================================

async function searchProducts(

  clientId,

  keyword,

  limit = 5

){

  try{

    if(!keyword){

      return[];

    }

    return await Product.find({

      clientId,

      active:true,

      $or:[

        {

          title:{

            $regex:keyword,

            $options:"i"

          }

        },

        {

          productType:{

            $regex:keyword,

            $options:"i"

          }

        },

        {

          vendor:{

            $regex:keyword,

            $options:"i"

          }

        }

      ]

    })

    .limit(limit)

    .lean();

  }

  catch(err){

    console.log(

      "Product Search Error",

      err

    );

    return[];

  }

}

// ======================================
// UPDATE PRODUCT ANALYTICS
// ======================================

async function updateProductAnalytics(

  products=[]

){

  try{

    for(

      const product of products

    ){

      await Product.updateOne(

        {

          _id:product._id

        },

        {

          $inc:{

            views:1

          }

        }

      );

    }

  }

  catch(err){

    console.log(

      "Analytics Error",

      err

    );

  }

}
// ======================================
// PART 3 / 5
// OpenAI Engine
// UI Components
// ======================================

// ======================================
// PRODUCT CARD
// ======================================

function generateProductCard(
  product,
  store = ""
){

  if(!product) return "";

  const url =
    product.url ||
    `https://${store}/products/${product.handle}`;

  return `

<div style="
background:#111827;
padding:16px;
border-radius:18px;
margin-top:14px;
border:1px solid rgba(255,255,255,.08);
">

<img
src="${product.image || ""}"
style="
width:100%;
border-radius:14px;
margin-bottom:12px;
"
/>

<h3 style="
color:#ffffff;
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
$${money(product.price)}
</p>

<a
href="${url}"
target="_blank"
style="
display:block;
text-align:center;
padding:12px;
border-radius:12px;
background:linear-gradient(
135deg,
#00ffc3,
#00aaff
);
text-decoration:none;
color:#000;
font-weight:bold;
"
>

🛒 View Product

</a>

</div>

`;

}

// ======================================
// CHECKOUT BUTTON
// ======================================

function generateCheckoutButton(
  checkoutUrl="/checkout"
){

  return `

<div style="margin-top:18px;">

<a
href="${checkoutUrl}"
style="
display:inline-block;
padding:12px 20px;
border-radius:12px;
background:
linear-gradient(
135deg,
#00ffc3,
#00aaff
);
text-decoration:none;
font-weight:bold;
color:#000;
">

⚡ Complete Checkout

</a>

</div>

`;

}

// ======================================
// RECOVERY MESSAGE
// ======================================

function generateRecoveryMessage(
  customerName=""
){

  return `

${customerName || "Hi"} 👋

You still have items waiting in your cart.

Complete your order before they sell out.

`;

}

// ======================================
// OPENAI REQUEST
// ======================================

async function callOpenAI({

  model,

  systemPrompt,

  userMessage,

  history=[]

}){

  try{

    const messages=[

      {
        role:"system",
        content:systemPrompt
      },

      ...history,

      {
        role:"user",
        content:userMessage
      }

    ];

    const response =
      await fetch(

        OPENAI_URL,

        {

          method:"POST",

          headers:{

            Authorization:
              `Bearer ${OPENAI_API_KEY}`,

            "Content-Type":
              "application/json"

          },

          body:JSON.stringify({

            model,

            messages,

            temperature:0.7,

            max_tokens:500

          })

        }

      );

    if(!response.ok){

      const error =
        await response.text();

      throw new Error(error);

    }

    const data =
      await response.json();

    return(

      data.choices?.[0]
      ?.message
      ?.content ||

      "I'm happy to help."

    );

  }

  catch(err){

    console.log(
      "OpenAI Error:",
      err.message
    );

    return
      "⚠️ AI is temporarily unavailable.";

  }

}

// ======================================
// BUILD CHAT HISTORY
// ======================================

function buildHistory(
  conversation
){

  if(
    !conversation ||
    !conversation.messages
  ){

    return[];

  }

  return conversation.messages

    .slice(-20)

    .map(message=>({

      role:

        message.sender === "customer"

          ? "user"

          : "assistant",

      content:
        message.message

    }));

}
// ======================================
// PART 4 / 5
// Main AI Engine
// ======================================

async function generateAIResponse({

  clientId,
  conversationId,
  userMessage,
  cartItems = [],
  viewedProducts = []

}){

  try{

    // ==================================
    // CLIENT
    // ==================================

    const client =
      await Client.findById(
        clientId
      );

    if(!client){

      return{

        success:false,

        reply:"Store not found."

      };

    }

    // ==================================
    // SUBSCRIPTION
    // ==================================

    const subscriptionResult =
      await validateSubscription(
        client._id
      );

    if(!subscriptionResult.active){

      return{

        success:false,

        locked:true,

        reply:
        "Your subscription is inactive."

      };

    }

    const subscription =
      subscriptionResult.subscription;

    // ==================================
    // MODEL
    // ==================================

    const model =
      getModel(
        client,
        subscription
      );

    // ==================================
    // CONVERSATION
    // ==================================

    let conversation = null;

    if(conversationId){

      conversation =
        await Conversation.findById(
          conversationId
        );

    }

    // ==================================
    // PRODUCTS
    // ==================================

    const recommendedProducts =
      await getRecommendedProducts(
        client._id,
        6
      );

    const upsellProducts =
      await getUpsellProducts(
        client._id,
        5
      );

    const crossSellProducts =
      await getCrossSellProducts(
        client._id,
        5
      );

    // ==================================
    // CONTEXT
    // ==================================

    const systemPrompt =
      buildFullContext({

        client,

        conversation,

        products:
          recommendedProducts,

        cart:
          cartItems,

        enableUpsell:true,

        enableCheckoutCloser:
          client.plan === "premium" ||
          client.plan === "enterprise" ||
          subscription?.status === "trial",

        enableCartRecovery:
          cartItems.length > 0

      });

    // ==================================
    // HISTORY
    // ==================================

    const history =
      buildHistory(
        conversation
      );

    // ==================================
    // GPT
    // ==================================

    let reply =
      await callOpenAI({

        model,

        systemPrompt,

        userMessage,

        history

      });

    // ==================================
    // CUSTOMER INTENT
    // ==================================

    const intent =
      await analyzeCustomerIntent(
        userMessage
      );

    // ==================================
    // PRODUCT SEARCH
    // ==================================

    let products = [];

    const searchedProducts =
      await searchProducts(

        client._id,

        userMessage,

        4

      );

    if(
      searchedProducts.length
    ){

      products =
        searchedProducts;

    }else{

      products =
        recommendedProducts.slice(0,3);

    }

    // ==================================
    // CHECKOUT PUSH
    // ==================================

    if(

      intent === "purchase" ||

      intent === "checkout" ||

      intent === "pricing"

    ){

      reply +=
        generateCheckoutButton(
          cartItems[0]?.checkoutUrl ||
          "/checkout"
        );

    }

    // ==================================
    // CART RECOVERY
    // ==================================

    if(cartItems.length){

      reply +=
        generateRecoveryMessage(

          conversation?.customerName

        );

    }

    // ==================================
    // PREMIUM UPSELL
    // ==================================

    if(

      intent === "purchase" &&

      upsellProducts.length

    ){

      reply +=
      "\n\nRecommended for you:\n";

      reply +=
        generateProductCard(

          upsellProducts[0],

          client.store

        );

    }

    // ==================================
    // CROSS SELL
    // ==================================

    if(

      intent === "general" &&

      crossSellProducts.length

    ){

      reply +=
        generateProductCard(

          crossSellProducts[0],

          client.store

        );

    }

    // ==================================
    // ANALYTICS
    // ==================================

    client.messages =
      (client.messages || 0) + 1;

    client.lastLoginAt =
      new Date();

    await client.save();

    await updateProductAnalytics(
      products
    );
    // ======================================
// ANALYZE INTENT - PART -5/5
// ======================================

async function analyzeCustomerIntent(userMessage) {

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
// MAIN AI ENGINE
// ======================================

async function generateAIResponse({

  clientId,
  conversationId,
  userMessage,
  cartItems = []

}) {

  try {

    // =====================
    // CLIENT
    // =====================

    const client =
      await Client.findById(
        clientId
      );

    if (!client) {

      return {

        success:false,

        reply:"Store not found."

      };

    }

    // =====================
    // SUBSCRIPTION
    // =====================

    const subscription =
      await Subscription.findOne({

        clientId:client._id

      });

    const validation =
      await validateSubscription(
        client._id
      );

    if(!validation.active){

      return{

        success:false,

        locked:true,

        reply:
        "Your subscription is inactive."

      };

    }

    // =====================
    // MODEL
    // =====================

    const model =
      getModel(
        client,
        subscription
      );

    // =====================
    // CONVERSATION
    // =====================

    let conversation =
      null;

    if(conversationId){

      conversation =
        await Conversation.findById(
          conversationId
        );

    }

    // =====================
    // PRODUCTS
    // =====================

    const recommendedProducts =
      await getRecommendedProducts(
        client._id,
        5
      );

    // =====================
    // CONTEXT
    // =====================

    const systemPrompt =
      buildFullContext({

        client,

        conversation,

        products:
          recommendedProducts,

        cart:
          cartItems,

        enableUpsell:true,

        enableCheckoutCloser:
          client.plan==="premium" ||
          client.plan==="enterprise" ||
          subscription?.status==="trial",

        enableCartRecovery:
          cartItems.length>0

      });

    // =====================
    // HISTORY
    // =====================

    let history=[];

    if(
      conversation &&
      conversation.messages
    ){

      history =
        conversation.messages
        .slice(-20)
        .map(m=>({

          role:
            m.sender==="customer"
            ?"user"
            :"assistant",

          content:
            m.message

        }));

    }

    // =====================
    // GPT
    // =====================

    let reply =
      await callOpenAI(

        model,

        systemPrompt,

        userMessage,

        history

      );

    // =====================
    // INTENT
    // =====================

    const intent =
      await analyzeCustomerIntent(
        userMessage
      );

    if(

      intent==="purchase" ||

      intent==="checkout" ||

      intent==="pricing"

    ){

      reply +=
        generateCheckoutButton();

    }

    if(cartItems.length){

      reply +=
        generateRecoveryMessage(
          conversation?.customerName
        );

    }

    // =====================
    // SAVE CHAT
    // =====================

    if(conversation){

      conversation.messages.push({

        sender:"customer",

        message:userMessage,

        platform:"website"

      });

      conversation.messages.push({

        sender:"ai",

        message:reply,

        platform:"website",

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

    // =====================
    // CLIENT ANALYTICS
    // =====================

    client.messages =
      (client.messages || 0) + 1;

    client.lastLoginAt =
      new Date();

    await client.save();

    return{

      success:true,

      reply,

      products:
        recommendedProducts.slice(0,3),

      conversationId:
        conversation?._id || null

    };

  }

  catch(err){

    console.log(
      "AI ENGINE ERROR:",
      err
    );

    return{

      success:false,

      reply:
      "⚠️ AI temporarily unavailable."

    };

  }

}

// ======================================
// EXPORTS
// ======================================

module.exports = {

  buildSystemPrompt,
  buildCustomerMemory,
  buildProductRecommendations,
  buildCartRecovery,
  buildCheckoutCloser,
  buildUpsellSuggestions,
  buildFullContext,

  validateSubscription,

  getModel,

  getRecommendedProducts,
  getUpsellProducts,
  getCrossSellProducts,

  generateProductCard,
  generateRecoveryMessage,
  generateCheckoutButton,

  callOpenAI,

  analyzeCustomerIntent,

  generateAIResponse

};
