require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // ✅ FIXED

const Razorpay = require("razorpay");
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const Client = require("./models/Client");

const app = express();

// ✅ WEBHOOK RAW BODY
app.use("/webhook", bodyParser.raw({ type: "*/*" }));

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// =======================
// DB CONNECT
// =======================
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("✅ DB Connected"))
.catch(()=>console.log("❌ DB Error"));

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
      paid: false
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
    console.log(e);
    res.send("❌ Install failed");
  }
});

// =======================
// RAZORPAY
// =======================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

app.post("/create-subscription", async (req,res)=>{
  const { clientId } = req.body;

  try{
    const plan = await razorpay.plans.create({
      period: "monthly",
      interval: 1,
      item: {
        name: "Layboka Plan",
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

  }catch(err){
    console.log(err);
    res.status(500).send("Payment error");
  }
});

// =======================
// STRIPE
// =======================
app.post("/create-stripe", async (req,res)=>{
  try{
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

  }catch(err){
    res.status(500).send("Stripe error");
  }
});

// =======================
// WEBHOOK
// =======================
app.post("/webhook", async (req,res)=>{
  try{
    const body = req.body.toString(); // ✅ FIX
    const sig = req.headers["x-razorpay-signature"];

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if(sig !== expected) return res.sendStatus(400);

    const event = JSON.parse(body);

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

  // 🔒 LOCK AFTER TRIAL
  if(Date.now() > client.trialEnds && !client.paid){
    return res.json({
      reply:`⚠️ Trial expired

Chats: ${client.messages}
Interested: ${Math.floor(client.messages * 0.3)}

👉 Upgrade now: ${BASE_URL}/pricing.html`
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
          {role:"system",content:"You are Shopify sales AI. Push user to buy."},
          {role:"user",content:message}
        ]
      })
    });

    const data = await aiRes.json();

    client.messages++;
    await client.save();

    res.json({reply:data.choices?.[0]?.message?.content || "AI error"});

  }catch(err){
    res.json({reply:"AI error"});
  }
});

// =======================
// CHAT WIDGET 🔥
// =======================
app.get("/widget.js", (req,res)=>{
  const clientId = req.query.client;

  const script = `
  (function(){
    const clientId="${clientId}";

    const btn=document.createElement("div");
    btn.innerHTML="💬";
    btn.style="position:fixed;bottom:20px;right:20px;background:#00ffc6;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;z-index:9999";

    const box=document.createElement("div");
    box.style="position:fixed;bottom:90px;right:20px;width:320px;background:#0f172a;color:#fff;border-radius:16px;padding:10px;display:none";

    box.innerHTML=\`
      <div style="font-weight:bold;">💁 Layboka Shopi Agent 🟢 Live</div>
      <div id="chat" style="height:250px;overflow:auto;"></div>
      <input id="input" placeholder="Ask..." style="width:100%;padding:10px;margin-top:8px;border-radius:10px;">
    \`;

    document.body.appendChild(btn);
    document.body.appendChild(box);

    btn.onclick=()=>box.style.display=box.style.display==="none"?"block":"none";

    const input=box.querySelector("#input");
    const chat=box.querySelector("#chat");

    function add(text,type){
      const d=document.createElement("div");
      d.innerText=text;
      chat.appendChild(d);
    }

    input.addEventListener("keypress", async (e)=>{
      if(e.key==="Enter"){
        const msg=input.value;
        add(msg,"user");
        input.value="";

        const r=await fetch("${BASE_URL}/chat",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({message:msg,clientId})
        });

        const data=await r.json();
        add(data.reply,"ai");
      }
    });
  })();
  `;

  res.setHeader("Content-Type","application/javascript");
  res.send(script);
});

// =======================
app.listen(process.env.PORT || 3000, ()=>{
  console.log("🚀 SERVER LIVE");
});
