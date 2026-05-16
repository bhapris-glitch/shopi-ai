(function(){
let clientId = "";

// 1. Try script URL first
const currentScript =
document.currentScript;

if(currentScript){

  try{

    const url =
      new URL(currentScript.src);

    clientId =
      url.searchParams.get("client") || "";

  }catch(e){}

}

// 2. Fallback from page URL
if(!clientId){

  clientId =
    new URLSearchParams(
      window.location.search
    ).get("client") || "";

}
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
    font-family:Poppins,sans-serif;
  }

  @keyframes pulse{
    0%{
      transform:scale(1);
    }
    50%{
      transform:scale(1.08);
    }
    100%{
      transform:scale(1);
    }
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
    font-weight:600;
  }

  .qbtn:hover{
    transform:translateY(-2px);
    background:#ff9f2f;
    color:#000;
  }

  .productCard{
    background:#101c35;
    border-radius:20px;
    padding:14px;
    margin-top:12px;
    border:1px solid rgba(255,255,255,0.06);
    animation:fadeIn .4s ease;
  }

  .productCard img{
    width:100%;
    border-radius:14px;
    margin-bottom:10px;
    height:180px;
    object-fit:cover;
  }

  .buyBtn{
    margin-top:12px;
    width:100%;
    padding:14px;
    border:none;
    border-radius:14px;
    background:linear-gradient(135deg,#ff8a00,#ffbf47);
    color:#000;
    font-weight:bold;
    cursor:pointer;
    transition:0.3s;
    font-size:15px;
  }

  .buyBtn:hover{
    transform:scale(1.03);
  }

  .dot{
    width:8px;
    height:8px;
    background:#d1d5db;
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
      opacity:0.4;
    }
    40%{
      transform:scale(1);
      opacity:1;
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
    bottom:22px;
    right:22px;
    width:72px;
    height:72px;
    border-radius:50%;
    background:linear-gradient(135deg,#ff8a00,#ffbf47);
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:30px;
    cursor:pointer;
    z-index:999999;
    box-shadow:0 0 35px rgba(255,140,0,0.45);
    animation:pulse 2s infinite;
  `;

  document.body.appendChild(button);

  // =========================
  // CHATBOX
  // =========================
  const box = document.createElement("div");

  box.style = `
    position:fixed;
    bottom:108px;
    right:20px;
    width:380px;
    max-width:95%;
    height:620px;
    background:#041126;
    border-radius:34px;
    overflow:hidden;
    display:none;
    flex-direction:column;
    z-index:999999;
    box-shadow:0 20px 60px rgba(0,0,0,0.55);
    border:1px solid rgba(255,255,255,0.08);
  `;

  // =========================
  // HTML
  // =========================
  box.innerHTML = `

  <div id="topBar"
  style="
  padding:14px 18px;
  min-height:78px;
  background:linear-gradient(135deg,#ff8a00,#ffbf47);
  color:#000;
  font-weight:bold;
  display:flex;
  justify-content:space-between;
  align-items:center;
  ">

    <div>

      <div style="
      font-size:17px;
      font-weight:800;
      ">
      🤖 Layboka AI Assistant
      </div>

      <div style="
      font-size:12px;
      margin-top:5px;
      font-weight:600;
      ">
      🟢 Human-like AI Sales Agent
      </div>

    </div>

    <div id="closeBtn"
    style="
    font-size:32px;
    cursor:pointer;
    font-weight:300;
    ">
    ✕
    </div>

  </div>

  <div id="chat"
  style="
  flex:1;
  overflow:auto;
  padding:18px;
  background:#041126;
  color:#fff;
  ">
  </div>

  <div id="typing"
  style="
  display:none;
  padding-left:18px;
  padding-bottom:12px;
  ">

    <div style="
    background:#16213c;
    width:80px;
    padding:12px;
    border-radius:18px;
    display:flex;
    gap:6px;
    align-items:center;
    justify-content:center;
    ">

      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>

    </div>

  </div>

  <div id="quickBtns"
  style="
  padding:10px 12px;
  display:flex;
  gap:8px;
  overflow:auto;
  background:#041126;
  ">
  </div>

  <div style="
  padding:14px;
  border-top:1px solid rgba(255,255,255,0.08);
  background:#0b1730;
  display:flex;
  gap:10px;
  ">

    <input
    id="input"
    placeholder="Ask something..."
    style="
    flex:1;
    padding:15px;
    border:none;
    border-radius:18px;
    outline:none;
    background:#17233f;
    color:#fff;
    font-size:15px;
    ">

    <button id="sendBtn"
    style="
    width:58px;
    border:none;
    border-radius:18px;
    background:linear-gradient(135deg,#ff8a00,#ffbf47);
    font-size:22px;
    cursor:pointer;
    font-weight:bold;
    ">
    ➤
    </button>

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

  box.querySelector("#closeBtn")
  .onclick = ()=>{

    opened = false;
    box.style.display = "none";

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

  const sendBtn =
    box.querySelector("#sendBtn");

  // =========================
  // ADD MESSAGE
  // =========================
  function addMessage(text,type){

    const div =
      document.createElement("div");

    div.style.margin = "12px 0";

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
        font-size:20px;
        ">
        ${text.title}
        </h3>

        <p style="
        color:#c3cad7;
        font-size:14px;
        margin-top:10px;
        line-height:1.6;
        ">
        ${text.description}
        </p>

        <h2 style="
        color:#ffbf47;
        margin-top:12px;
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

    }else{

      div.innerHTML = `
      <span style="
      display:inline-block;
      padding:14px 16px;
      border-radius:20px;
      max-width:82%;
      background:
        ${type==="user"
          ? "linear-gradient(135deg,#ff8a00,#ffbf47)"
          : "#16213c"};
      color:
        ${type==="user"
          ? "#000"
          : "#fff"};
      line-height:1.7;
      font-size:15px;
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

    if(USER_PLAN === "premium"){

      quickBtns.innerHTML = `

      <button onclick="
      quickAsk('best')
      "
      class="qbtn">
      🔥 Best Sellers
      </button>

      <button onclick="
      quickAsk('offer')
      "
      class="qbtn">
      🎁 Offers
      </button>

      <button onclick="
      quickAsk('shipping')
      "
      class="qbtn">
      🚚 Shipping
      </button>

      <button onclick="
      quickAsk('checkout')
      "
      class="qbtn">
      ⚡ Checkout
      </button>

      `;

    }else{

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

  }

  // =========================
  // QUICK ASK
  // =========================
  window.quickAsk = function(type){

    if(type==="best"){
      sendMessage("Show me best sellers");
    }

    if(type==="products"){
      sendMessage("Show products");
    }

    if(type==="shipping"){
      sendMessage("What are shipping times?");
    }

    if(type==="offer"){
      sendMessage("What offers are available?");
    }

    if(type==="checkout"){
      sendMessage("Help me checkout");
    }

  };

  // =========================
  // HUMAN STYLE REPLY
  // =========================
  function smartReply(msg){

    const text = msg.toLowerCase();

    if(text.includes("hello") || text.includes("hi")){
      return "👋 Hey! Welcome to our store. What kind of product are you looking for today?";
    }

    if(text.includes("hoodie")){
      return "🔥 Our premium oversized hoodies are trending right now. Super soft cotton, premium fit and fast shipping available.";
    }

    if(text.includes("price")){
      return "💰 Prices depend on the collection, but we currently have limited-time offers running today.";
    }

    if(text.includes("shipping")){
      return "🚚 Standard delivery usually takes 3-7 business days depending on your location.";
    }

    if(text.includes("discount") || text.includes("offer")){
      return "🎁 Yes! We currently have special discounts on selected products plus extra savings during checkout.";
    }

    if(text.includes("checkout")){
      return "⚡ I can help you complete checkout quickly. Add your favorite product to cart and proceed securely.";
    }

    if(text.includes("best")){
      return "🔥 Our best sellers this week are oversized hoodies, premium smartwatches and sneakers.";
    }

    return "😊 I’m here to help you choose products, answer questions and guide you to the best deals available right now.";
  }

  // =========================
  // SEND MESSAGE
  // =========================
  async function sendMessage(msg){

    if(CHAT_LOCKED) return;

    addMessage(msg,"user");

    input.value = "";

    typing.style.display = "block";

    chat.scrollTop = chat.scrollHeight;

    setTimeout(()=>{

      typing.style.display = "none";

      const reply = smartReply(msg);

      addMessage(reply,"ai");

      // PRODUCT CARD
      if(
      msg.toLowerCase().includes("hoodie") ||
      msg.toLowerCase().includes("product") ||
      msg.toLowerCase().includes("show") ||
      msg.toLowerCase().includes("best")
      ){

        setTimeout(()=>{

          addMessage({

            type:"product",

            title:"Premium Oversized Hoodie",

            description:
            "🔥 Best Seller • Heavy Premium Cotton • Trending Fashion Fit • Limited Stock Available",

            price:"₹1,999",

            image:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",

            url:"#"

          },"ai");

        },700);

      }

      // SALES PUSH
      if(
      msg.toLowerCase().includes("buy") ||
      msg.toLowerCase().includes("price") ||
      msg.toLowerCase().includes("checkout")
      ){

        setTimeout(()=>{

          addMessage(
          "🚀 Complete your order today and unlock extra checkout savings.",
          "ai"
          );

        },1000);

      }

    },1800);

  }

  // =========================
  // SEND BUTTON
  // =========================
  sendBtn.onclick = ()=>{

    if(input.value.trim() !== ""){

      sendMessage(input.value);

    }

  };

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
      "👋 Hi there! I’m your AI shopping assistant. Ask me anything about products, offers or shipping.",
      "ai"
    );

  },1200);

  // =========================
  // DEMO PRODUCT
  // =========================
  setTimeout(()=>{

    addMessage({

      type:"product",

      title:"Premium Smart Watch",

      description:
      "⌚ AMOLED Display • 7-Day Battery • Waterproof • Best Seller",

      price:"₹4,999",

      image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12",

      url:"#"

    },"ai");

  },3500);

  // =========================
  // INACTIVITY SALES PUSH
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

    if(inactive > 60000 && opened){

      addMessage(
      "🛒 Still browsing? Today's discount may expire soon.",
      "ai"
      );

    }

  },30000);

  // =========================
  // LOAD PLAN
  // =========================
  loadPlan();

})();
