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
  // GLOBAL STATE
  // =========================
  let lastActivity = Date.now();

  // =========================
  // PREMIUM CSS
  // =========================
  const style = document.createElement("style");

  style.innerHTML = `

  *{
    box-sizing:border-box;
  }

  .qbtn{
    border:none;
    padding:10px 14px;
    border-radius:12px;
    background:#111827;
    color:#fff;
    cursor:pointer;
    white-space:nowrap;
    font-size:13px;
    transition:0.3s;
  }

  .qbtn:hover{
    transform:translateY(-2px);
    background:#00ffc3;
    color:#000;
  }

  .productCard{
    background:#0f172a;
    border-radius:18px;
    padding:14px;
    margin-top:12px;
    border:1px solid rgba(255,255,255,0.06);
    animation:fadeIn .4s ease;
  }

  .productCard img{
    width:100%;
    border-radius:12px;
    margin-bottom:10px;
    height:180px;
    object-fit:cover;
  }

  .buyBtn{
    margin-top:10px;
    width:100%;
    padding:13px;
    border:none;
    border-radius:12px;
    background:linear-gradient(135deg,#00ffc3,#00aaff);
    color:#000;
    font-weight:bold;
    cursor:pointer;
    transition:0.3s;
  }

  .buyBtn:hover{
    transform:scale(1.03);
  }

  .dot{
    width:7px;
    height:7px;
    background:#9ca3af;
    border-radius:50%;
    animation:bounce 1s infinite;
  }

  .dot:nth-child(2){
    animation-delay:0.2s;
  }

  .dot:nth-child(3){
    animation-delay:0.4s;
  }

  @keyframes bounce{
    0%,80%,100%{
      transform:scale(0);
    }
    40%{
      transform:scale(1);
    }
  }

  @keyframes fadeIn{
    from{
      opacity:0;
      transform:translateY(10px);
    }
    to{
      opacity:1;
      transform:translateY(0);
    }
  }

  `;

  document.head.appendChild(style);

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
    animation:pulse 2s infinite;
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
    height:540px;
    background:#071421;
    border-radius:24px;
    overflow:hidden;
    display:none;
    flex-direction:column;
    z-index:999999;
    box-shadow:0 20px 60px rgba(0,0,0,0.5);
    border:1px solid rgba(255,255,255,0.08);
    backdrop-filter:blur(12px);
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
      🟢 AI Online
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
  padding-bottom:10px;
  ">

    <div style="
    display:flex;
    gap:4px;
    align-items:center;
    ">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>

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
    font-size:14px;
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

    // PRODUCT CARD
    if(typeof text === "object" && text.type === "product"){

      div.innerHTML = `

      <div class="productCard">

        <img src="${text.image}">

        <h3 style="
        margin:0;
        color:white;
        ">
        ${text.title}
        </h3>

        <p style="
        color:#9ca3af;
        font-size:14px;
        margin-top:8px;
        ">
        ${text.description}
        </p>

        <h2 style="
        color:#00ffc3;
        margin-top:10px;
        ">
        ${text.price}
        </h2>

        <button class="buyBtn"
        onclick="
        window.location.href='${text.url}'
        ">
        🛒 Add To Cart
        </button>

      </div>

      `;

    }

    // NORMAL CHAT
    else{

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
      line-height:1.5;
      ">
      ${text}
      </span>
      `;

    }

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
      ⚡ Checkout
      </button>

      <button onclick="
      quickAsk('offer')
      "
      class="qbtn">
      💰 Offers
      </button>

      `;

      setTimeout(()=>{

        addMessage(`
⚡ Premium AI Activated

✔ AI Checkout Closer
✔ Cart Recovery
✔ Smart Upsells
✔ Product Recommendations
✔ Conversion Boosters
        `,"ai");

      },2000);

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

    if(type==="offer"){
      sendMessage(
        "What offers are available?"
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

      // =====================
      // SALES PUSH
      // =====================

      if(
      msg.toLowerCase().includes("buy") ||
      msg.toLowerCase().includes("price") ||
      msg.toLowerCase().includes("best")
      ){

        setTimeout(()=>{

          addMessage(`
🔥 Today's Offer:
Extra 10% OFF if you checkout today.
          `,"ai");

        },1200);

      }

      // =====================
      // PRODUCT CARD
      // =====================

      if(
      msg.toLowerCase().includes("hoodie") ||
      msg.toLowerCase().includes("product") ||
      msg.toLowerCase().includes("show")
      ){

        setTimeout(()=>{

          addMessage({

            type:"product",

            title:"Premium Hoodie",

            description:
            "Ultra-soft premium cotton hoodie loved by customers.",

            price:"₹1,999",

            image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",

            url:"#"

          },"ai");

        },1500);

      }

      // =====================
      // AUTO CHECKOUT PUSH
      // =====================

      if(
      msg.toLowerCase().includes("checkout")
      ){

        setTimeout(()=>{

          addMessage(`
⚡ Complete your order now before stock runs out.
          `,"ai");

        },1000);

      }

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
      "👋 Hi There! Need help choosing the perfect product?",
      "ai"
    );

  },1000);

  // =========================
  // DEMO PRODUCT CARD
  // =========================
  setTimeout(()=>{

    addMessage({

      type:"product",

      title:"Premium Oversized Hoodie",

      description:
      "🔥 Best Seller • Premium Cotton • Limited Stock",

      price:"₹1,999",

      image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",

      url:"#"

    },"ai");

  },3000);

  // =========================
  // ABANDONED CART RECOVERY
  // =========================
  document.addEventListener(
    "mousemove",
    ()=>{
      lastActivity = Date.now();
    }
  );

  setInterval(()=>{

    const inactive =
      Date.now() - lastActivity;

    if(inactive > 60000){

      addMessage(`
🛒 Still thinking?

Complete your purchase before today's offer expires.
      `,"ai");

    }

  },30000);

  // =========================
  // LOAD PLAN
  // =========================
  loadPlan();

})();
