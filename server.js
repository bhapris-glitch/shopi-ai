console.log("🔥 Starting server...");

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const BASE_URL = "https://shopi-ai.onrender.com";

// =======================
// LOAD CLIENTS
// =======================
let clients = {};

if (fs.existsSync("clients.json")) {
  try {
    clients = JSON.parse(fs.readFileSync("clients.json"));
  } catch {
    clients = {};
  }
}

function saveClients() {
  fs.writeFileSync("clients.json", JSON.stringify(clients, null, 2));
}

// =======================
// HELPER: TRIAL CHECK
// =======================
function isActive(client) {
  if (!client) return false;
  if (client.paid) return true;
  return Date.now() < client.trialEnds;
}

// =======================
// AUTH ROUTE
// =======================
app.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.send("Missing shop");

  const redirectUri = `${BASE_URL}/callback`;

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_script_tags&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

// =======================
// CALLBACK (INSTALL + FETCH)
// =======================
app.get("/callback", async (req, res) => {
  const { shop, code } = req.query;

  try {
    // 🔐 Get token
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const clientId = "client_" + Date.now();

    const trialEnds = Date.now() + (3 * 24 * 60 * 60 * 1000);

    clients[clientId] = {
      store: shop,
      token,
      trialEnds,
      paid: false,
      messages: 0,
      products: []
    };

    // 🔥 INSTALL CHATBOT
    await fetch(`https://${shop}/admin/api/2023-10/script_tags.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script_tag: {
          event: "onload",
          src: `${BASE_URL}/widget.js?client=${clientId}`
        }
      })
    });

    // 🛍 FETCH PRODUCTS
    const productsRes = await fetch(`https://${shop}/admin/api/2023-10/products.json`, {
      headers: {
        "X-Shopify-Access-Token": token
      }
    });

    const productsData = await productsRes.json();
    clients[clientId].products = productsData.products || [];

    saveClients();

    res.send(`
      <h2>✅ Installed Successfully</h2>
      <p>Your 3-day trial has started 🚀</p>
      <a href="/">Go Home</a>
    `);

  } catch (err) {
    console.log(err);
    res.send("❌ Installation failed");
  }
});

// =======================
// CHAT API (AI)
// =======================
app.post("/chat", async (req, res) => {
  const { message, clientId } = req.body;

  const client = clients[clientId];

  if (!client) {
    return res.json({ reply: "👋 Ask me anything about products!" });
  }

  if (!isActive(client)) {
    return res.json({
      reply: "⚠️ Trial expired. Upgrade to continue."
    });
  }

  try {
    const productText = (client.products || [])
      .slice(0, 10)
      .map(p => `${p.title} - ₹${p.variants?.[0]?.price || ""}`)
      .join("\n");

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a Shopify sales assistant.\nProducts:\n${productText}`
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content || "AI error";

    client.messages++;
    saveClients();

    res.json({ reply });

  } catch (err) {
    res.json({ reply: "AI error" });
  }
});

// =======================
// ADMIN DATA
// =======================
let analytics = { chatbotOpens: 0 };

app.get("/admin-data", (req, res) => {
  const totalClients = Object.keys(clients).length;

  res.json({
    totalClients,
    revenue: totalClients * 299,
    chatbotOpens: analytics.chatbotOpens
  });
});

// =======================
// PREMIUM CHAT WIDGET 🔥
// =======================
app.get("/widget.js", (req, res) => {
  const clientId = req.query.client;

  const script = `
  (function(){
    const clientId="${clientId}";

    const btn=document.createElement("div");
    btn.innerHTML="💬";
    btn.style="position:fixed;bottom:20px;right:20px;background:#00ffc6;width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;box-shadow:0 0 20px rgba(0,255,200,0.5);z-index:9999";

    const box=document.createElement("div");
    box.style="position:fixed;bottom:90px;right:20px;width:320px;background:#0f172a;color:#fff;border-radius:16px;padding:10px;display:none;box-shadow:0 10px 40px rgba(0,0,0,0.4)";

    box.innerHTML=\`
      <div style="font-weight:bold;margin-bottom:8px;">🤖 AI Assistant</div>
      <div id="chat" style="height:250px;overflow:auto;font-size:14px;"></div>
      <input id="input" placeholder="Ask about products..." style="width:100%;padding:10px;margin-top:8px;border-radius:10px;border:none;outline:none;">
    \`;

    document.body.appendChild(btn);
    document.body.appendChild(box);

    btn.onclick=()=>{
      box.style.display = box.style.display==="none" ? "block" : "none";
    };

    const input=box.querySelector("#input");
    const chat=box.querySelector("#chat");

    function add(text,type){
      const d=document.createElement("div");
      d.style.margin="6px 0";
      d.style.textAlign=type==="user"?"right":"left";
      d.innerHTML="<span style='background:"+(type==="user"?"#00ffc6":"#1e293b")+";padding:6px 10px;border-radius:10px;display:inline-block;'>"+text+"</span>";
      chat.appendChild(d);
      chat.scrollTop=chat.scrollHeight;
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

  res.setHeader("Content-Type", "application/javascript");
  res.send(script);
});

// =======================
// ROOT
// =======================
app.get("/", (req, res) => {
  res.send("🚀 Layboka AI running");
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
