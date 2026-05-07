(function(){

  // =========================
  // CLIENT ID
  // =========================
  const clientId =
    new URLSearchParams(window.location.search)
    .get("client") || "";

  let USER_PLAN = "starter";
  let CHAT_LOCKED = false;

  // =========================
  // FLOAT BUTTON
  // =========================
  const button = document.createElement("div");

  button.innerHTML = "💬";

  button.style = `
    position:fixed;
    bottom:20px;
    right:20px;
    width:65px;
    height:65px;
    border-radius:50%;
    background:linear-gradient(135deg,#00ffc3,#00aaff);
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:28px;
    cursor:pointer;
    z-index:999999;
    box-shadow:0 0 30px rgba(0,255,200,0.5);
  `;

  document.body.appendChild(button);

  // =========================
  // CHATBOX
  // =========================
  const box = document.createElement("div");

  box.style = `
    position:fixed;
    bottom:95px;
    right:20px;
    width:360px;
    max-width:95%;
    height:520px;
    background:#071421;
    border-radius:24px;
    overflow:hidden;
    display:none;
    flex-direction:column;
    z-index:999999;
    box-shadow:0 20px 60px rgba(0,0,0,0.5);
    border:1px solid rgba(255,255,255,0.08);
  `;

  // =========================
  // HTML
  // =========================
  box.innerHTML = `

  <div id="topBar"
  style="
  padding:16px;
  background:linear-gradient(135deg,#00ffc3,#00aaff);
  color:#000;
  font-weight:bold;
  display:flex;
  justify-content:space-between;
  align-items:center;
  ">

    <div>
      💁 Layboka Shop Manager 
      <div style="
      font-size:12px;
      margin-top:4px;
      ">
      🟢 Live
      </div>
    </div>

    <div id="planBadge"
    style="
    background:#000;
    color:#fff;
    padding:5px 10px;
    border-radius:30px;
    font-size:12px;
    ">
    Starter
    </div>

  </div>

  <div id="chat"
  style="
  flex:1;
  overflow:auto;
  padding:14px;
  background:#071421;
  color:#fff;
  ">
  </div>

  <div id="typing"
  style="
  display:none;
  padding-left:14px;
  color:#9ca3af;
  font-size:12px;
  ">
  AI is typing...
  </div>

  <div id="quickBtns"
  style="
  padding:10px;
  display:flex;
  gap:8px;
  overflow:auto;
  ">
  </div>

  <div style="
  padding:12px;
  border-top:1px solid rgba(255,255,255,0.08);
  background:#0f172a;
  ">

    <input
    id="input"
    placeholder="Ask about products..."
    style="
    width:100%;
    padding:14px;
    border:none;
    border-radius:14px;
    outline:none;
    background:#111827;
    color:#fff;
    ">

  </div>

  `;

  document.body.appendChild(box);

  // =========================
  // OPEN / CLOSE
  // =========================
  let opened = false;

  button.onclick = ()=>{

    opened = !opened;

    box.style.display =
      opened ? "flex" : "none";

  };

  // =========================
  // ELEMENTS
  // =========================
  const chat =
    box.querySelector("#chat");

  const input =
    box.querySelector("#input");

  const typing =
    box.querySelector("#typing");

  const quickBtns =
    box.querySelector("#quickBtns");

  const badge =
    box.querySelector("#planBadge");

  // =========================
  // ADD MESSAGE
  // =========================
  function addMessage(text,type){

    const div =
      document.createElement("div");

    div.style.margin = "10px 0";

    div.style.textAlign =
      type==="user"
      ? "right"
      : "left";

    div.innerHTML = `
    <span style="
    display:inline-block;
    padding:12px 14px;
    border-radius:18px;
    max-width:80%;
    background:
      ${type==="user"
        ? "linear-gradient(135deg,#00ffc3,#00aaff)"
        : "#111827"};
    color:
      ${type==="user"
        ? "#000"
        : "#fff"};
    ">
    ${text}
    </span>
    `;

    chat.appendChild(div);

    chat.scrollTop =
      chat.scrollHeight;

  }

  // =========================
  // LOAD PLAN
  // =========================
  async function loadPlan(){

    try{

      const res =
        await fetch(
          "/client-plan/" + clientId
        );

      const data =
        await res.json();

      USER_PLAN =
        data.plan || "starter";

      CHAT_LOCKED =
        data.locked;

      applyPlan();

    }catch(e){

      console.log(e);

    }

  }

  // =========================
  // APPLY PLAN
  // =========================
  function applyPlan(){

    // =====================
    // PREMIUM
    // =====================
    if(USER_PLAN === "premium"){

      badge.innerHTML =
        "Premium";

      badge.style.background =
        "#f59e0b";

      quickBtns.innerHTML = `

      <button onclick="
      quickAsk('discount')
      "
      class="qbtn">
      🎁 Discounts
      </button>

      <button onclick="
      quickAsk('best')
      "
      class="qbtn">
      🔥 Best Sellers
      </button>

      <button onclick="
      quickAsk('checkout')
      "
      class="qbtn">
      ⚡ Fast Checkout
      </button>

      `;

    }

    // =====================
    // STARTER
    // =====================
    else{

      badge.innerHTML =
        "Starter";

      quickBtns.innerHTML = `

      <button onclick="
      quickAsk('products')
      "
      class="qbtn">
      🛍 Products
      </button>

      <button onclick="
      quickAsk('shipping')
      "
      class="qbtn">
      🚚 Shipping
      </button>

      `;

    }

    // =====================
    // LOCKED
    // =====================
    if(CHAT_LOCKED){

      input.disabled = true;

      input.placeholder =
        "Subscription required";

      addMessage(`
🚫 Chatbot locked

Upgrade your plan:
<a href="/pricing.html?client=${clientId}"
style="color:#00ffc3;">
Upgrade Now
</a>
      `,"ai");

    }

  }

  // =========================
  // QUICK ASK
  // =========================
  window.quickAsk = function(type){

    if(type==="discount"){
      sendMessage(
        "Do you have discounts?"
      );
    }

    if(type==="checkout"){
      sendMessage(
        "Help me checkout"
      );
    }

    if(type==="best"){
      sendMessage(
        "Show best sellers"
      );
    }

    if(type==="products"){
      sendMessage(
        "Show products"
      );
    }

    if(type==="shipping"){
      sendMessage(
        "What are shipping times?"
      );
    }

  };

  // =========================
  // SEND MESSAGE
  // =========================
  async function sendMessage(msg){

    if(CHAT_LOCKED) return;

    addMessage(msg,"user");

    typing.style.display = "block";

    input.value = "";

    try{

      const res =
        await fetch("/chat",{

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body: JSON.stringify({

            message:msg,
            clientId

          })

        });

      const data =
        await res.json();

      typing.style.display =
        "none";

      addMessage(
        data.reply,
        "ai"
      );

      // 🔒 LOCK
      if(data.locked){

        CHAT_LOCKED = true;

        input.disabled = true;

      }

    }catch(e){

      typing.style.display =
        "none";

      addMessage(
        "⚠️ Error",
        "ai"
      );

    }

  }

  // =========================
  // ENTER SEND
  // =========================
  input.addEventListener(
    "keypress",
    (e)=>{

      if(
        e.key==="Enter" &&
        input.value.trim() !== ""
      ){

        sendMessage(
          input.value
        );

      }

    }
  );

  // =========================
  // GREETING
  // =========================
  setTimeout(()=>{

    addMessage(
      "👋 Hi There! How can I help you today?",
      "ai"
    );

  },1000);

  // =========================
  // LOAD PLAN
  // =========================
  loadPlan();

})();
