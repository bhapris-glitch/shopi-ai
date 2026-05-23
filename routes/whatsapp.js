// ======================================
// routes/whatsapp.js
// Layboka AI WhatsApp Integration
// ======================================

const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

const {
  generateAIReply
} = require("../utils/aiReply");

const {
  findProductsFromMessage
} = require("../utils/productAI");

// ======================================
// VERIFY WEBHOOK
// ======================================

router.get(
  "/whatsapp/webhook",
  (req,res)=>{

    const mode =
      req.query["hub.mode"];

    const token =
      req.query["hub.verify_token"];

    const challenge =
      req.query["hub.challenge"];

    if(
      mode === "subscribe" &&
      token === process.env.WHATSAPP_VERIFY_TOKEN
    ){

      return res.status(200)
      .send(challenge);

    }

    res.sendStatus(403);

  }
);

// ======================================
// RECEIVE MESSAGE
// ======================================

router.post(
  "/whatsapp/webhook",
  async(req,res)=>{

    try{

      const body = req.body;

      const message =

        body?.entry?.[0]
        ?.changes?.[0]
        ?.value?.messages?.[0];

      if(!message){

        return res.sendStatus(200);

      }

      const phone =
        message.from;

      const text =
        message.text?.body || "";

      // =========================
      // AI REPLY
      // =========================

      const aiReply =
        await generateAIReply({

          message:text,

          platform:"WhatsApp"

        });

      // =========================
      // PRODUCTS
      // =========================

      const products =
        await findProductsFromMessage(text);

      let finalReply =
        aiReply;

      if(products.length){

        finalReply +=
`\n\n🔥 Recommended Products:\n`;

        products.forEach((p)=>{

          finalReply +=
`\n• ${p.title} - ${p.price}`;

        });

      }

      // =========================
      // SEND MESSAGE
      // =========================

      await fetch(

        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,

        {

          method:"POST",

          headers:{

            Authorization:
              `Bearer ${process.env.WHATSAPP_TOKEN}`,

            "Content-Type":
              "application/json"

          },

          body:JSON.stringify({

            messaging_product:
              "whatsapp",

            to:phone,

            type:"text",

            text:{
              body:finalReply
            }

          })

        }

      );

      res.sendStatus(200);

    }catch(err){

      console.log(
        "WHATSAPP ERROR:",
        err.message
      );

      res.sendStatus(500);

    }

  }
);

module.exports = router;
