const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const BASE_URL = "https://shopi-ai.onrender.com"; // change if needed

// Load clients
let clients = {};
if (fs.existsSync("clients.json")) {
  clients = JSON.parse(fs.readFileSync("clients.json"));
}

// Save clients helper
function saveClients() {
  fs.writeFileSync("clients.json", JSON.stringify(clients, null, 2));
}

// =======================
// SIGNUP ROUTE
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
    paid: false
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
// TRIAL CHECK
// =======================
function isActive(client) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (client.paid) return true;
  if (client.trial && now - client.createdAt < oneDay) return true;

  return false;
}

// =======================
// CHAT API
// =======================
app.post("/chat", async (req, res) => {
  const { message, clientId } = req.body;

  const client = clients[clientId];
  if (!client) return res.json({ reply: "Invalid client" });

  if (!isActive(client)) {
    return res.json({ reply: "Trial expired. Please upgrade." });
  }

  // Simple AI response (replace with OpenAI later)
  const reply = "AI: Thanks for your message! We'll assist you.";

  client.messages++;
  saveClients();

  res.json({ reply });
});

// =======================
// SHOPIFY AUTO INSTALL
// =======================
app.post("/auto-install", async (req, res) => {
  try {
    const { store, token, clientId } = req.body;

    if (!store || !token || !clientId) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const scriptTag = {
      script_tag: {
        event: "onload",
        src: `${BASE_URL}/widget.js?client=${clientId}`
      }
    };

    const response = await fetch(`https://${store}/admin/api/2023-10/script_tags.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(scriptTag)
    });

    const data = await response.json();

    res.json({
      success: true,
      shopifyResponse: data
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

// =======================
// WIDGET SCRIPT
// =======================
app.get("/widget.js", (req, res) => {
  const clientId = req.query.client;

  const script = `
  (function(){
    const clientId = "${clientId}";

    const box = document.createElement("div");
    box.innerHTML = \`
      <div style="position:fixed;bottom:20px;right:20px;width:300px;background:#fff;border-radius:10px;padding:10px;">
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
