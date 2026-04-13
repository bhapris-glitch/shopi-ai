const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const BASE_URL = "https://shopi-ai.onrender.com"; // 🔁 CHANGE to your Render URL

// =======================
// LOAD CLIENTS
// =======================
let clients = {};
if (fs.existsSync("clients.json")) {
  clients = JSON.parse(fs.readFileSync("clients.json"));
}

function saveClients() {
  fs.writeFileSync("clients.json", JSON.stringify(clients, null, 2));
}

// =======================
// SIGNUP
// =======================
app.post("/signup", (req, res) => {
  const id = "client_" + Date.now();

  clients[id] = {
    name: req.body.name,
    email: req.body.email,
    store: req.body.store,
    messages: 0,
    createdAt: Date.now(),
    trial: true,
    paid: false,
    products: []
  };

  saveClients();

  const script = `<script src="${BASE_URL}/widget.js?client=${id}"></script>`;

  res.json({
    success: true,
    clientId: id,
    script: script
  });
});

// =======================
// TRIAL CHECK (24H)
// =======================
function isActive(client) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (client.paid) return true;
  if (client.trial && (now - client.createdAt < oneDay)) return true;

  return false;
}

// =======================
// CHAT API (AI + PRODUCTS)
// =======================
app.post("/chat", async (req, res) => {
  const { message, clientId } = req.body;

  const client = clients[clientId];
  if (!client) return res.json({ reply: "Invalid client" });

  if (!isActive(client)) {
    return res.json({ reply: "Trial expired. Please upgrade." });
  }

  try {
    // 🧠 Prepare product data
    const productList = client.products || [];

    const productText = productList.slice(0, 10).map(p => {
      return `${p.title} - ₹${p.variants[0].price}`;
    }).join("\n");

    // 🤖 OpenAI call
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
            content: `
You are a Shopify sales assistant.

Store products:
${productText}

Rules:
- Recommend products from list
- Be friendly
- Help user buy
`
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
    res.json({ reply: "AI error. Try again." });
  }
});

// =======================
// SHOPIFY AUTO INSTALL + FETCH PRODUCTS
// =======================
app.post("/auto-install", async (req, res) => {
  try {
    const { store, token, clientId } = req.body;

    if (!store || !token || !clientId) {
      return res.json({ success: false, message: "Missing fields" });
    }

    // 🟢 Install chatbot
    const scriptTag = {
      script_tag: {
        event: "onload",
        src: `${BASE_URL}/widget.js?client=${clientId}`
      }
    };

    await fetch(`https://${store}/admin/api/2023-10/script_tags.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(scriptTag)
    });

    // 🟢 Fetch products
    const productsRes = await fetch(`https://${store}/admin/api/2023-10/products.json`, {
      headers: {
        "X-Shopify-Access-Token": token
      }
    });

    const productsData = await productsRes.json();

    // Save products to client
    clients[clientId].products = productsData.products || [];
    saveClients();

    res.json({ success: true });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// =======================
// CHAT WIDGET
// =======================
app.get("/widget.js", (req, res) => {
  const clientId = req.query.client;

  const script = `
  (function(){
    const clientId = "${clientId}";

    const box = document.createElement("div");
    box.innerHTML = \`
      <div style="position:fixed;bottom:20px;right:20px;width:300px;background:#fff;border-radius:10px;padding:10px;font-family:Arial;">
        <div id="chat" style="height:200px;overflow:auto;"></div>
        <input id="input" placeholder="Ask something..." style="width:100%;padding:5px;">
      </div>
    \`;

    document.body.appendChild(box);

    const input = box.querySelector("#input");
    const chat = box.querySelector("#chat");

    input.addEventListener("keypress", async (e)=>{
      if(e.key==="Enter"){
        const msg = input.value;

        chat.innerHTML += "<p><b>You:</b> "+msg+"</p>";

        const res = await fetch("${BASE_URL}/chat", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            message: msg,
            clientId: clientId
          })
        });

        const data = await res.json();
        chat.innerHTML += "<p><b>AI:</b> "+data.reply+"</p>";

        input.value="";
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
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
