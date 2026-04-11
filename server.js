const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

let clients = {};
if (fs.existsSync("clients.json")) {
  clients = JSON.parse(fs.readFileSync("clients.json"));
}

// SIGNUP
app.post("/signup", (req, res) => {
  const id = "client_" + Date.now();

  clients[id] = {
    ...req.body,
    messages: 0,
    createdAt: Date.now(),
    trial: true,
    paid: false
  };

  fs.writeFileSync("clients.json", JSON.stringify(clients, null, 2));

  const script = `<script src="https://shopi-ai.onrender.com/widget.js?client=${id}"></script>`;

  res.json({
    success: true,
    clientId: id,
    script: script
  });
});

// TRIAL CHECK
function isActive(client) {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  if (client.paid) return true;
  if (client.trial && (now - client.createdAt < oneDay)) return true;

  return false;
}

// CHAT
app.post("/chat", async (req, res) => {
  const { message, clientId } = req.body;
  const client = clients[clientId];

  if (!client) return res.json({ reply: "Invalid client" });

  if (!isActive(client)) {
    return res.json({
      reply: "Trial expired. Please upgrade."
    });
  }

  res.json({ reply: "AI is working (connect OpenAI later)" });
});

// WIDGET
app.get("/widget.js", (req, res) => {
  const clientId = req.query.client;

  const script = `
  (function(){
    const clientId = "${clientId}";

    const box = document.createElement("div");
    box.innerHTML = \`
    <div style="position:fixed;bottom:20px;right:20px;width:300px;background:#fff;">
      <div id="chat"></div>
      <input id="input" placeholder="Ask...">
    </div>\`;

    document.body.appendChild(box);

    const input = box.querySelector("#input");
    const chat = box.querySelector("#chat");

    input.addEventListener("keypress", async (e)=>{
      if(e.key==="Enter"){
        const msg = input.value;

        chat.innerHTML += "<p>You: "+msg+"</p>";

        const res = await fetch("https://shpoi-ai.onrender.com/chat"), {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            message: msg,
            clientId: clientId
          })
        });

        const data = await res.json();
        chat.innerHTML += "<p>AI: "+data.reply+"</p>";

        input.value="";
      }
    });
  })();
  `;

  res.setHeader("Content-Type", "application/javascript");
  res.send(script);
});

app.listen(3000, () => console.log("Server running on 3000"));