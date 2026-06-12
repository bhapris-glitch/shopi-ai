//================================
// Layboka AI
// routes/recovery.js
// Updated 12 Jun, 2026
//=================================
const express = require("express");
const router = express.Router();

const Abandoned = require("../models/Abandoned");
const sendWhatsApp = require("../utils/whatsapp");
const sendEmail = require("../utils/email");

// =====================
// TRACK CART
// =====================
router.post("/track-cart", async (req,res)=>{
  const { clientId, product, email, phone } = req.body;

  await Abandoned.create({
    clientId,
    product,
    email,
    phone
  });

  res.json({success:true});
});

// =====================
// RUN RECOVERY CRON
// =====================
router.get("/run-recovery", async (req,res)=>{

  const now = Date.now();

  const carts = await Abandoned.find({ recovered:false });

  for(const c of carts){

    const diff = now - new Date(c.createdAt).getTime();

    // ⏱ 1 HOUR
    if(diff > 3600000 && diff < 7200000){

      const msg = `🔥 You left something in cart!

${c.product.title}

Complete your order now 👇
https://yourstore.com/cart`;

      if(c.phone) await sendWhatsApp(c.phone, msg);

      if(c.email){
        await sendEmail(
          c.email,
          "🛒 You forgot something!",
          `<h3>${c.product.title}</h3>
           <a href="https://yourstore.com/cart">Complete Order</a>`
        );
      }
    }

    // ⏱ 24 HOURS (DISCOUNT)
    if(diff > 86400000){

      const msg = `🎁 Special Discount!

Use code SAVE10

Complete your order 👇
https://yourstore.com/cart`;

      if(c.phone) await sendWhatsApp(c.phone, msg);

      if(c.email){
        await sendEmail(
          c.email,
          "🎁 10% OFF Just for You",
          `<h2>Use code SAVE10</h2>
           <a href="https://yourstore.com/cart">Shop Now</a>`
        );
      }

      c.recovered = true;
      await c.save();
    }
  }

  res.send("Recovery run complete");
});

// =====================================
// EXPORT
// =====================================

module.exports = router;
