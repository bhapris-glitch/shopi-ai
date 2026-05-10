// ======================================
// routes/chat.js
// Premium AI Chat System
// ======================================

const express = require("express");
const fetch = require("node-fetch");

const Client = require("../models/Client");

const router = express.Router();

// ======================================
// AI CHAT
// ======================================

router.post("/", async (req,res)=>{

  try{

    const {

      message,
      clientId,
      cart,
      customerName

    } = req.body;

    // ==================================
    // VALIDATION
    // ==================================

    if(!message){

      return res.json({

        reply:"Please type a message."

      });

    }

    // ==================================
    // CLIENT
    // ==================================

    const client =
      await Client.findById(clientId);

    if(!client){

      return res.json({

        reply:"⚠️ Store not found"

      });

    }

    // ==================================
    // LOCK SYSTEM
    // ==================================

    const expired =
      Date.now() >
      client.trialEnds;

    if(expired && !client.paid){

      return res.json({

        locked:true,

        reply:`

🚫 Your free trial expired.

Upgrade to continue using
Layboka AI Agent.

👉 Upgrade here:
${process.env.BASE_URL}/pricing.html?client=${clientId}

        `

      });

    }

    // ==================================
    // PREMIUM SYSTEM PROMPT
    // ==================================

    let systemPrompt = `

You are Layboka AI,
a premium Shopify sales assistant.

Your goal:
- Increase conversions
- Recommend products
- Push checkout
- Recover abandoned carts
- Upsell products
- Answer quickly

Keep replies:
- short
- persuasive
- friendly
- sales focused

Always try to:
- recommend products
- encourage checkout
- increase cart value

`;

    // ==================================
    // PREMIUM FEATURES
    // ==================================

    if(client.plan === "premium"){

      systemPrompt += `

Premium Features Enabled:
- aggressive upsells
- conversion optimization
- checkout closer
- urgency marketing
- cart recovery

`;

    }

    // ==================================
    // OPENAI REQUEST
    // ==================================

    const aiRes =
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

                content:systemPrompt

              },

              {

                role:"user",

                content:message

              }

            ],

            temperature:0.8

          })

        }

      );

    const data =
      await aiRes.json();

    // ==================================
    // AI RESPONSE
    // ==================================

    let reply =
      data?.choices?.[0]?.message?.content
      || "⚠️ AI unavailable";

    // ==================================
    // AUTO CHECKOUT PUSH
    // ==================================

    if(

      message.toLowerCase().includes("buy") ||

      message.toLowerCase().includes("checkout") ||

      message.toLowerCase().includes("order")

    ){

      reply += `

<div style="
margin-top:12px;
">

<a href="/checkout"
style="
display:inline-block;
padding:12px 18px;
border-radius:12px;
background:linear-gradient(135deg,#00ffc3,#00aaff);
color:#000;
font-weight:bold;
text-decoration:none;
">
⚡ Complete Checkout
</a>

</div>

`;

    }

    // ==================================
    // SAVE ANALYTICS
    // ==================================

    client.messages =
      (client.messages || 0) + 1;

    client.lastMessage =
      message;

    client.lastSeen =
      Date.now();

    await client.save();

    // ==================================
    // RESPONSE
    // ==================================

    res.json({

      success:true,

      plan:client.plan,

      reply

    });

  }catch(err){

    console.log(err);

    res.status(500).json({

      success:false,

      reply:"⚠️ AI Error"

    });

  }

});

// ======================================
// TRACK OPEN
// ======================================

router.post("/track-open", async (req,res)=>{

  try{

    const { clientId } = req.body;

    if(clientId){

      await Client.findByIdAndUpdate(

        clientId,

        {

          $inc:{
            opens:1
          }

        }

      );

    }

    res.json({

      success:true

    });

  }catch(err){

    res.json({

      success:false

    });

  }

});

// ======================================
// CART RECOVERY
// ======================================

router.post("/cart-recovery", async (req,res)=>{

  try{

    const {

      clientId,
      email,
      cart

    } = req.body;

    console.log(
      "🛒 Abandoned Cart:",
      email
    );

    // SAVE DATA
    await Client.findByIdAndUpdate(

      clientId,

      {

        abandonedCart:true,

        abandonedEmail:email,

        abandonedItems:cart

      }

    );

    res.json({

      success:true

    });

  }catch(err){

    console.log(err);

    res.json({

      success:false

    });

  }

});

// ======================================
// EXPORT
// ======================================

module.exports = router;
