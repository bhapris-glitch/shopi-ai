require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // ✅ FIXED

const Razorpay = require("razorpay");

// Stripe safe load
let stripe = null;
if (process.env.STRIPE_SECRET) {
  stripe = require("stripe")(process.env.STRIPE_SECRET);
}

const Client = require("./models/Client");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// MIDDLEWARE
// =======================
app.use("/webhook", bodyParser.raw({ type: "*/*" }));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// =======================
// DB
// =======================
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log("❌ DB Error:", err));

const BASE_URL = process.env.BASE_URL;

// =======================
// SHOPIFY AUTH
// =======================
app.get("/auth", (req,res)=>{
  const shop = req.query.shop;
  if(!shop) return res.send("Missing shop");

  const url = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_script_tags&redirect_uri=${BASE_URL}/callback`;

  res.redirect(url);
});

// =======================
// CALLBACK (INSTALL)
// =======================
app.get("/callback", async (req,res)=>{
  const { shop, code } = req.query;

  try{
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        client_id:process.env.SHOPIFY_API_KEY,
        client_secret:process.env.SHOPIFY_API_SECRET,
        code
      })
    });

    const data = await tokenRes.json();

    const client = new Client({
      store: shop,
      token: data.access_token,
      trialEnds: Date.now() + (3*24*60*60*1000),
      messages: 0,
      paid: false,
      status: "trial",
      plan: "free"
    });

    await client.save();

    // INSTALL CHATBOT
    await fetch(`https://${shop}/admin/api/2023-10/script_tags.json`,{
      method:"POST",
      headers:{
        "X-Shopify-Access-Token":client.token,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        script_tag:{
          event:"onload",
          src:`${BASE_URL}/widget.js?client=${client._id}`
        }
      })
    });

    res.redirect(`/dashboard.html?client=${client._id}`);

  }catch(e){
    console.log(e);
    res.send("❌ Install failed");
  }
});

// =======================
// RAZORPAY INIT (SAFE)
// =======================
let razorpay = null;
if(process.env.RAZORPAY_KEY && process.env.RAZORPAY_SECRET){
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
  });
}

// =======================
// CREATE ORDER (PAYMENT)
// =======================
app.post("/create-order", async (req,res)=>{
  try{
    const { plan, clientId } = req.body;

    if(!razorpay) return res.status(500).json({error:"Razorpay not configured"});

    const amount = plan === "premium" ? 79900 : 39900;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    });

    res.json({ ...order, plan, clientId });

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Order creation failed"});
  }
});

// =======================
// STRIPE GLOBAL
// =======================
app.post("/create-stripe", async (req,res)=>{
  try{
    if(!stripe) return res.status(500).json({error:"Stripe not configured"});

    const { plan, clientId } = req.body;

    const price = plan === "premium" ? 2000 : 900;

    const session = await stripe.checkout.sessions.create({
      payment_method_types:["card"],
      mode:"subscription",
      line_items:[{
        price_data:{
          currency:"usd",
          product_data:{name:"Layboka Plan"},
          unit_amount:price,
          recurring:{interval:"month"}
        },
        quantity:1
      }],
      success_url:`${BASE_URL}/success.html?client=${clientId}`,
      cancel_url:`${BASE_URL}/pricing.html`
    });

    res.json({url:session.url});

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Stripe failed"});
  }
});

// =======================
// WEBHOOK (AUTO ACTIVATE)
// =======================
app.post("/webhook", async (req,res)=>{
  try{
    const sig = req.headers["x-razorpay-signature"];

    if(!process.env.RAZORPAY_WEBHOOK_SECRET){
      return res.sendStatus(200);
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    if(sig !== expected) return res.sendStatus(400);

    const event = JSON.parse(req.body);

    if(event.event === "payment.captured"){
      const notes = event.payload.payment.entity.notes;

      const clientId = notes.clientId;
      const plan = notes.plan;

      await Client.findByIdAndUpdate(clientId,{
        paid:true,
        status:"active",
        plan: plan
      });
    }

    res.sendStatus(200);

  }catch(err){
    console.log(err);
    res.sendStatus(500);
  }
});

// =======================
// CHAT API (LOCK SYSTEM)
// =======================
app.post("/chat", async (req,res)=>{
  const {message, clientId} = req.body;

  const client = await Client.findById(clientId);

  if(!client) return res.json({reply:"👋 Hello"});

  // 🔒 LOCK
  if(Date.now() > client.trialEnds && !client.paid){
    return res.json({
      reply:`⚠️ Trial expired

Chats: ${client.messages}

👉 Upgrade now`,
      locked:true
    });
  }

  try{
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        model:"gpt-4o-mini",
        messages:[
          {role:"system",content:"You are a Shopify sales AI. Push users to checkout."},
          {role:"user",content:message}
        ]
      })
    });

    const data = await aiRes.json();

    client.messages++;
    await client.save();

    res.json({
      reply:data.choices?.[0]?.message?.content
    });

  }catch(e){
    res.json({reply:"AI error"});
  }
});

// =======================
// HEALTH CHECK
// =======================
app.get("/", (req,res)=>{
  res.send("🚀 Layboka AI LIVE");
});

// =======================
// START
// =======================
app.listen(PORT, ()=>{
  console.log("🚀 Server running on port " + PORT);
});
