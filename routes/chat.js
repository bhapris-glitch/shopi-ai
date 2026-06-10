// ======================================
// routes/chat.js
// Layboka AI Chat Router V2 Part 1
// GPT-4o-mini Optimized
// US / UK / Canada / Australia
// ======================================

const express = require("express");

const Client = require("../models/Client");
const Product = require("../models/Product");
const Conversation = require("../models/Conversation");
const Subscription = require("../models/Subscription");

const {
  generateAIResponse,
  analyzeCustomerIntent
} = require("../services/ai");

const router = express.Router();

// ======================================
// HELPERS
// ======================================

async function getActiveSubscription(clientId) {

  return Subscription.findOne({

    clientId,

    status: {
      $in: [
        "active",
        "trial"
      ]
    }

  });

}

async function loadProducts(clientId) {

  return Product.find({

    clientId,
    active: true

  })
  .sort({
    popularityScore: -1
  })
  .limit(50);

}

async function loadConversation(
  clientId,
  customerId,
  email
) {

  if (customerId) {

    return Conversation.findOne({

      clientId,
      customerId

    });

  }

  if (email) {

    return Conversation.findOne({

      clientId,
      email

    });

  }

  return null;

}

// ======================================
// CHAT
// ======================================

router.post("/", async (req,res)=>{

  try{

    const {

      clientId,
      message,
      customerId,
      customerName,
      email,
      cartItems = []

    } = req.body;

    // ==============================
    // VALIDATION
    // ==============================

    if(!message){

      return res.status(400).json({

        success:false,
        reply:"Message required"

      });

    }

    // ==============================
    // CLIENT
    // ==============================

    const client =
      await Client.findById(clientId);

    if(!client){

      return res.status(404).json({

        success:false,
        reply:"Store not found"

      });

    }

    // ==============================
    // SUBSCRIPTION
    // ==============================

    const subscription =
      await getActiveSubscription(client._id);

    const trialExpired =

      client.trialEnds &&

      Date.now() > client.trialEnds;

    if(

      !subscription &&

      trialExpired

    ){

      return res.json({

        success:false,

        locked:true,

        reply:
`🚫 Your Layboka AI trial has ended.

Upgrade to continue using AI sales agents.

Starter → $25/month
Growth → $59/month
Premium → $149/month`

      });

    }

    // ==============================
    // LOAD MEMORY
    // ==============================

    let conversation =
      await loadConversation(

        client._id,
        customerId,
        email

      );

    if(!conversation){

      conversation =
      await Conversation.create({

        clientId: client._id,

        customerId,

        customerName,

        email,

        platform:"website"

      });

    }

    // ==============================
    // PRODUCTS
    // ==============================

    const products =
      await loadProducts(
        client._id
      );

    // ==============================
    // INTENT
    // ==============================

    const intent =
      await analyzeCustomerIntent(
        message,
        client._id
      );
        // ==============================
    // GENERATE AI RESPONSE - Part 2
    // ===================================

    const aiResult =
      await generateAIResponse({

        clientId: client._id,

        conversationId:
          conversation._id,

        userMessage: message,

        productList: products,

        cartItems

      });

    let reply =
      aiResult?.response ||
      "I'm here to help.";

    // ==============================
    // SAVE MESSAGE
    // ==============================

    conversation.messages.push({

      sender:"customer",

      message,

      platform:"website"

    });

    conversation.messages.push({

      sender:"ai",

      message:reply,

      platform:"website",

      agentName:
        client.agentName || "Emma"

    });

    conversation.totalMessages =
      (conversation.totalMessages || 0) + 2;

    conversation.customerName =
      customerName ||
      conversation.customerName;

    conversation.email =
      email ||
      conversation.email;

    conversation.sentiment =
      intent.sentiment ||
      "neutral";

    await conversation.save();

    // ==============================
    // CLIENT ANALYTICS
    // ==============================

    client.messages =
      (client.messages || 0) + 1;

    client.lastSeen =
      new Date();

    client.lastMessage =
      message;

    await client.save();

    // ==============================
    // PRODUCT RECOMMENDATIONS
    // ==============================

    let recommendedProducts = [];

    const recommendationIntent = [

      "browse",
      "search",
      "product_inquiry"

    ];

    if(

      recommendationIntent.includes(
        intent.intent
      )

    ){

      recommendedProducts =
        products
          .sort(

            (a,b)=>

              (b.popularityScore || 0)

              -

              (a.popularityScore || 0)

          )

          .slice(0,3)

          .map((p)=>({

            id:p.productId,

            title:p.title,

            price:
              `$${Number(
                p.price || 0
              ).toFixed(2)}`,

            image:p.image,

            url:
              `/products/${p.handle}`,

            vendor:p.vendor,

            productType:
              p.productType

          }));

    }

    // ==============================
    // CHECKOUT CLOSER
    // ==============================

    if(

      client.checkoutCloser &&

      cartItems?.length > 0

    ){

      reply +=

`\n\n🛒 You already have items in your cart.

Complete checkout today to secure your order.`;

    }

    // ==============================
    // CART RECOVERY FLAG
    // ==============================

    if(

      cartItems?.length > 0

    ){

      conversation.addedToCart = true;

      await conversation.save();

    }
    // ======================================
// ANALYTICS TRACK OPEN
// POST /chat/track-open Part 3
// ======================================

router.post("/track-open", async (req, res) => {

  try {

    const { clientId } = req.body;

    if (!clientId) {
      return res.json({
        success: false
      });
    }

    await Client.findByIdAndUpdate(
      clientId,
      {
        $inc: {
          opens: 1
        },
        lastSeenAt: new Date()
      }
    );

    return res.json({
      success: true
    });

  } catch (error) {

    console.error(
      "Track Open Error:",
      error
    );

    return res.json({
      success: false
    });

  }

});

// ======================================
// CART RECOVERY
// POST /chat/cart-recovery
// ======================================

router.post(
  "/cart-recovery",
  async (req, res) => {

    try {

      const {
        clientId,
        email,
        cart
      } = req.body;

      if (!clientId) {

        return res.json({
          success: false
        });

      }

      await Client.findByIdAndUpdate(
        clientId,
        {
          abandonedCart: true,
          abandonedEmail: email || "",
          abandonedItems: cart || [],
          lastSeenAt: new Date()
        }
      );

      console.log(
        "🛒 Abandoned Cart Saved:",
        email
      );

      return res.json({
        success: true
      });

    } catch (error) {

      console.error(
        "Cart Recovery Error:",
        error
      );

      return res.json({
        success: false
      });

    }

  }
);

// ======================================
// HEALTH CHECK
// GET /chat/ping
// ======================================

router.get("/ping", async (req, res) => {

  return res.json({

    success: true,

    service: "Layboka AI Chat",

    model: process.env.OPENAI_MODEL ||
      "gpt-4o-mini",

    timestamp: Date.now()

  });

});

// ======================================
// EXPORT
// ======================================

module.exports = router;
