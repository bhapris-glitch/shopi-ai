require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const crypto = require("crypto");
const bodyParser = require("body-parser");

const Razorpay = require("razorpay");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const Client = require("./models/Client");

const app = express();

// ⚠️ RAW body for webhook
app.use("/webhook", bodyParser.raw({ type: "*/*" }));

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ DB Connected"))
.catch(()=>console.log("❌ DB Error"));

const BASE_URL = process.env.BASE_URL;

// =======================
// SHOPIFY AUTH
// =======================
app.get("/auth", (req,res)=>{
  const shop = req.query.shop;

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
      trialEnds: Date.now() + (3*24*60*60*1000)
    });

    await client.save();

    // INSTALL SCRIPT
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
    res.send("❌ Install failed");
  }
});

// =======================
// PAYMENT (RAZORPAY)
// =======================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

app.post("/create-subscription", async (req,res)=>{
  const { clientId } = req.body;

  const plan = await razorpay.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: "Layboka Basic Plan",
      amount: 39900,
      currency: "INR"
    }
  });

  const sub = await razorpay.subscriptions.create({
    plan_id: plan.id,
    customer_notify: 1,
    total_count: 12
  });

  await Client.findByIdAndUpdate(clientId,{
    subscriptionId: sub.id
  });

  res.json(sub);
});

// =======================
// STRIPE (GLOBAL)
// =======================
app.post("/create-stripe", async (req,res)=>{
  const { clientId } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types:["card"],
    mode:"subscription",
    line_items:[{
      price_data:{
        currency:"usd",
        product_data:{name:"Premium Plan"},
        unit_amount:2000,
        recurring:{interval:"month"}
      },
      quantity:1
    }],
    success_url:`${BASE_URL}/success.html`,
    cancel_url:`${BASE_URL}/pricing.html`
  });

  res.json({url:session.url});
});

// =======================
// WEBHOOK (AUTO ACTIVATE)
// =======================
app.post("/webhook", async (req,res)=>{
  const sig = req.headers["x-razorpay-signature"];

  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");

  if(sig !== expected) return res.sendStatus(400);

  const event = JSON.parse(req.body);

  if(event.event === "subscription.charged"){
    const subId = event.payload.subscription.entity.id;

    await Client.findOneAndUpdate(
      {subscriptionId: subId},
      {paid:true, status:"active"}
    );
  }

  if(event.event === "subscription.cancelled"){
    const subId = event.payload.subscription.entity.id;

    await Client.findOneAndUpdate(
      {subscriptionId: subId},
      {paid:false, status:"cancelled"}
    );
  }

  res.sendStatus(200);
});

// =======================
// CHAT API (LOCK AFTER TRIAL)
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

👉 Upgrade now: pricing.html`
    });
  }

  const aiRes = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      model:"gpt-4o-mini",
      messages:[
        {role:"system",content:"You are sales AI"},
        {role:"user",content:message}
      ]
    })
  });

  const data = await aiRes.json();

  client.messages++;
  await client.save();

  res.json({reply:data.choices?.[0]?.message?.content});
});

// =======================
// START
// =======================
app.listen(process.env.PORT, ()=>console.log("🚀 LIVE"));
