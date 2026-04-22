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

const BASE_URL = "https://shopi-ai.onrender.com"; // your domain
//===============
// AUTH ROUTE 
//================
app.get("/auth", (req, res) => {
  const shop = req.query.shop;

  if (!shop) return res.send("Missing shop");

  const redirectUri = `${BASE_URL}/callback`;

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_script_tags&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

//================
//CALLBACK ROUTE
//================

app.get("/callback", async (req, res) => {
  const { shop, code } = req.query;

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
    products: []
  };

  saveClients();

  // Install chatbot
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

  res.send("✅ Installed successfully!");
});

// =======================
// LOAD CLIENTS
// =======================
let clients = {};

if (fs.existsSync("clients.json")) {
  try {
    clients = JSON.parse(fs.readFileSync("clients.json"));
  } catch (e) {
    console.log("⚠️ clients.json corrupted, resetting...");
    clients = {};
  }
}

function saveClients() {
  fs.writeFileSync("clients.json", JSON.stringify(clients, null, 2));
}

// =======================
// HELPER: CHECK TRIAL
// =======================
function isActive(client) {
  if (!client) return false;

  if (client.paid) return true;

  const now = Date.now();
  return now < client.trialEnds;
}

// =======================
// SIGNUP (START 3 DAY TRIAL)
// =======================
app.post("/signup", (req, res) => {
  const id = "client_" + Date.now();

  const trialEnds = Date.now() + (3 * 24 * 60 * 60 * 1000);

  clients[id] = {
    name: req.body.name,
    email: req.body.email,
    store: req.body.store,
    createdAt: Date.now(),
    trialEnds,
    paid: false,
    messages: 0,
    products: []
  };

  saveClients();

  const script = `<script src="${BASE_URL}/widget.js?client=${id}"></script>`;

  res.json({
    success: true,
    clientId: id,
    script
  });
});

// =======================
// CHAT API (AI)
// =======================
app.post("/chat", async (req, res) => {
  const { message, clientId } = req.body;

  const client = clients[clientId];

  if (!client) {
    return res.json({ reply: "Welcome! Ask me anything 😊" });
  }

  if (!isActive(client)) {
    return res.json({ reply: "⚠️ 3 Days Trial expired. Please upgrade." });
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
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content || "AI error";

    client.messages++;
    saveClients();

    res.json({ reply });

  } catch (err) {
    console.log(err);
    res.json({ reply: "AI error" });
  }
});

// =======================
// AUTO INSTALL + FETCH PRODUCTS
// =======================
 
    // install script
    await fetch(`https://${store}/admin/api/2023-10/script_tags.json`, {
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

    // fetch products
    const productsRes = await fetch(`https://${store}/admin/api/2023-10/products.json`, {
      headers: {
        "X-Shopify-Access-Token": token
      }
    });

    const productsData = await productsRes.json();

    if (clients[clientId]) {
      clients[clientId].products = productsData.products || [];
      saveClients();
    }

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false });
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
    chatbotOpens: analytics.chatbotOpens,
    clients: Object.values(clients)
  });
});

// =======================
// CHAT WIDGET
// =======================
app.get("/widget.js", (req, res) => {
  const clientId = req.query.client;

  const script = `
  (function(){
    const clientId="${clientId}";
    const box=document.createElement("div");
    box.innerHTML=\`
    <div style="position:fixed;bottom:20px;right:20px;width:300px;background:#111;color:#fff;border-radius:15px;padding:10px;">
      <div id="chat" style="height:220px;overflow:auto"></div>
      <input id="input" placeholder="Ask..." style="width:100%;padding:8px;margin-top:5px;border-radius:8px;">
    </div>\`;

    document.body.appendChild(box);

    const input=box.querySelector("#input");
    const chat=box.querySelector("#chat");

    function add(text,type){
      const d=document.createElement("div");
      d.innerText=text;
      d.style.margin="5px";
      d.style.textAlign=type==="user"?"right":"left";
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

  res.setHeader("Content-Type", "application/javascript");
  res.send(script);
});

// =======================
// START SERVER
// =======================
app.get("/", (req, res) => {
  res.send("🚀 Layboka AI running");
});

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
