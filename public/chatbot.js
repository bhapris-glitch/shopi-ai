(function(){

  // 🟢 CREATE CHAT BUTTON (FLOATING)
  const button = document.createElement("div");
  button.innerHTML = "💬";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.width = "60px";
  button.style.height = "60px";
  button.style.borderRadius = "50%";
  button.style.background = "#00ffcc";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.fontSize = "24px";
  button.style.cursor = "pointer";
  button.style.boxShadow = "0 5px 20px rgba(0,0,0,0.3)";
  button.style.zIndex = "9999";

  document.body.appendChild(button);


  // 🔵 CREATE CHAT BOX
  const box = document.createElement("div");

  box.style.position = "fixed";
  box.style.bottom = "90px";
  box.style.right = "20px";
  box.style.width = "320px";
  box.style.height = "420px";
  box.style.background = "#111";
  box.style.borderRadius = "12px";
  box.style.display = "none";
  box.style.flexDirection = "column";
  box.style.boxShadow = "0 5px 25px rgba(0,0,0,0.4)";
  box.style.zIndex = "9999";

  box.innerHTML = `
    <div style="padding:10px;background:#00ffcc;color:black;font-weight:bold;">
      Layboka AI Assistant
    </div>

    <div id="chat" style="flex:1;padding:10px;overflow:auto;color:white;"></div>

    <div id="typing" style="display:none;padding-left:10px;font-size:12px;color:gray;">
      AI is typing...
    </div>

    <input id="input" placeholder="Ask something..."
      style="border:none;padding:10px;width:100%;outline:none;">
  `;

  document.body.appendChild(box);

 setTimeout(()=>{
  const chat = document.getElementById("chat");
  chat.innerHTML += "<div>👋 Hi! Need help choosing a product?</div>";
}, 2000); 

  // 🔁 TOGGLE OPEN / CLOSE
  let open = false;

  button.onclick = () => {
    open = !open;
    box.style.display = open ? "flex" : "none";
  };


  // 🧠 CHAT LOGIC
  const input = box.querySelector("#input");
  const chat = box.querySelector("#chat");
  const typing = box.querySelector("#typing");

  function addMessage(text, type){
    const div = document.createElement("div");
    div.style.margin = "6px 0";
    div.style.textAlign = type === "user" ? "right" : "left";

    div.innerHTML = `
      <span style="
        background:${type==="user" ? "#00ffcc" : "#333"};
        padding:6px 10px;
        border-radius:10px;
        display:inline-block;
        max-width:80%;
      ">${text}</span>
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }


  // 🤖 REAL AI RESPONSE
  async function getAI(msg){

    typing.style.display = "block";

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: msg
        })
      });

      const data = await res.json();

      typing.style.display = "none";
      addMessage(data.reply, "ai");

    } catch (e) {
      typing.style.display = "none";
      addMessage("⚠️ Error. Try again.", "ai");
    }
  }


  // ⌨️ ENTER SEND
  input.addEventListener("keypress", (e)=>{
    if(e.key === "Enter" && input.value.trim() !== ""){
      addMessage(input.value, "user");
      getAI(input.value);
      input.value = "";
    }
  });


  // 👋 AUTO GREETING
  setTimeout(()=>{
    chat.innerHTML += "<div>👋 Hi! Ask me anything about our store.</div>";
  }, 1000);

})();
