(function(){

  // ===================================
  // CLIENT ID DETECTION
  // ===================================
  let clientId = "";

  // From script URL
  const currentScript = document.currentScript;

  if(currentScript){

    try{

      const url = new URL(currentScript.src);

      clientId =
        url.searchParams.get("client") || "";

    }catch(e){
      console.log(e);
    }

  }

  // From page URL fallback
  if(!clientId){

    clientId =
      new URLSearchParams(
        window.location.search
      ).get("client") || "";

  }

  // ===================================
  // CONFIG
  // ===================================
  let USER_PLAN = "starter";
  let CHAT_LOCKED = false;
  let lastActivity = Date.now();

  // IMPORTANT:
  // CHANGE THIS TO YOUR LIVE BACKEND
  const API_BASE =
window.location.hostname.includes("render.com")
? window.location.origin
: "https://shopi-ai.render.com";

  // ===================================
  // CSS
  // ===================================
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

  .layboka-qbtn{
    border:none;
    padding:10px 14px;
    border-radius:12px;
    background:#17233f;
    color:#fff;
    cursor:pointer;
    white-space:nowrap;
    font-size:13px;
    transition:0.3s;
    font-weight:600;
  }

  .layboka-qbtn:hover{
    transform:translateY(-2px);
    background:#ffb347;
    color:#000;
  }

  .layboka-product{
    background:#101c35;
    border-radius:20px;
    padding:14px;
    margin-top:12px;
    border:1px solid rgba(255,255,255,0.06);
    animation:fadeIn .4s ease;
  }

  .layboka-product img{
    width:100%;
    height:180px;
    object-fit:cover;
    border-radius:14px;
    margin-bottom:12px;
  }

  .layboka-buy{
    width:100%;
    margin-top:12px;
    padding:14px;
    border:none;
    border-radius:14px;
    background:linear-gradient(135deg,#ff8a00,#ffbf47);
    color:#000;
    font-weight:700;
    cursor:pointer;
    transition:0.3s;
  }

  .layboka-buy:hover{
    transform:scale(1.03);
  }

  .layboka-dot{
    width:8px;
    height:8px;
    border-radius:50%;
    background:#fff;
    animation:bounce 1s infinite;
  }

  .layboka-dot:nth-child(2){
    animation-delay:0.2s;
  }

  .layboka-dot:nth-child(3){
    animation-delay:0.4s;
  }

  `;

  document.head.appendChild(style);

  // ===================================
  // FLOAT BUTTON
  // ===================================
  const button = document.createElement("div");

  button.innerHTML = "💬";

  button.style = `
    position:fixed;
    bottom:22px;
    right:22px;
    width:70px;
    height:70px;
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

  // ===================================
  // CHATBOX
  // ===================================
  const box = document.createElement("div");

  box.style = `
    position:fixed;
    bottom:105px;
    right:20px;
    width:380px;
    max-width:95%;
    height:620px;
    background:#041126;
    border-radius:30px;
    overflow:hidden;
    display:none;
    flex-direction:column;
    z-index:999999;
    box-shadow:0 20px 60px rgba(0,0,0,0.55);
    border:1px solid rgba(255,255,255,0.08);
  `;

  box.innerHTML = `

  <div
  style="
  padding:14px 18px;
  min-height:74px;
  background:linear-gradient(135deg,#ff8a00,#ffbf47);
  display:flex;
  justify-content:space-between;
  align-items:center;
  ">

    <div>

      <div style="
      font-size:17px;
      font-weight:800;
      color:#000;
      ">
      🤖 Layboka AI
      </div>

      <div style="
      font-size:12px;
      margin-top:4px;
      color:#111;
      font-weight:600;
      ">
      🟢 Human-like Sales Assistant
      </div>

    </div>

    <div id="layboka-close"
    style="
    font-size:30px;
    cursor:pointer;
    color:#000;
    ">
    ✕
    </div>

  </div>

  <div id="layboka-chat"
  style="
  flex:1;
  overflow:auto;
  padding:18px;
  background:#041126;
  color:#fff;
  ">
  </div>

  <div id="layboka-typing"
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
    justify-content:center;
    align-items:center;
    gap:6px;
    ">

      <div class="layboka-dot"></div>
      <div class="layboka-dot"></div>
      <div class="layboka-dot"></div>

    </div>

  </div>

  <div id="layboka-quick"
  style="
  padding:10px 12px;
  display:flex;
  gap:8px;
  overflow:auto;
  background:#041126;
  ">
  </div>

  <div
  style="
  padding:14px;
  border-top:1px solid rgba(255,255,255,0.08);
  background:#0b1730;
  display:flex;
  gap:10px;
  ">

    <input
    id="layboka-input"
    placeholder="Ask about products..."
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

    <button id="layboka-send"
    style="
    width:58px;
    border:none;
    border-radius:18px;
    background:linear-gradient(135deg,#ff8a00,#ffbf47);
    cursor:pointer;
    font-size:20px;
    font-weight:bold;
    ">
    ➤
    </button>

  </div>

  `;

  document.body.appendChild(box);

  // ===================================
  // ELEMENTS
  // ===================================
  const chat =
    box.querySelector("#layboka-chat");

  const input =
    box.querySelector("#layboka-input");

  const sendBtn =
    box.querySelector("#layboka-send");

  const typing =
    box.querySelector("#layboka-typing");

  const quick =
    box.querySelector("#layboka-quick");

  // ===================================
  // OPEN / CLOSE
  // ===================================
  let opened = false;

  button.onclick = ()=>{

    opened = !opened;

    box.style.display =
      opened ? "flex" : "none";

  };

  box.querySelector("#layboka-close")
  .onclick = ()=>{

    opened = false;

    box.style.display = "none";

  };

  // ===================================
  // ADD MESSAGE
  // ===================================
  function addMessage(text,type){

    const div =
      document.createElement("div");

    div.style.margin = "12px 0";

    div.style.textAlign =
      type === "user"
      ? "right"
      : "left";

    // PRODUCT CARD
    if(
      typeof text === "object" &&
      text.type === "product"
    ){

      div.innerHTML = `

      <div class="layboka-product">

        <img src="${text.image}">

        <h3 style="
        margin:0;
        font-size:20px;
        color:#fff;
        ">
        ${text.title}
        </h3>

        <p style="
        color:#cbd5e1;
        line-height:1.6;
        font-size:14px;
        margin-top:10px;
        ">
        ${text.description}
        </p>

        <h2 style="
        color:#ffbf47;
        margin-top:12px;
        ">
        ${text.price}
        </h2>

        <button
        class="layboka-buy"
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
      max-width:82%;
      padding:14px 16px;
      border-radius:20px;
      line-height:1.7;
      font-size:15px;
      background:
      ${
        type === "user"
        ? "linear-gradient(135deg,#ff8a00,#ffbf47)"
        : "#16213c"
      };
      color:
      ${
        type === "user"
        ? "#000"
        : "#fff"
      };
      ">
      ${text}
      </span>

      `;

    }

    chat.appendChild(div);

    chat.scrollTop =
      chat.scrollHeight;

  }

  // ===================================
  // QUICK BUTTONS
  // ===================================
  quick.innerHTML = `

    <button class="layboka-qbtn">
    🔥 Best Sellers
    </button>

    <button class="layboka-qbtn">
    🎁 Offers
    </button>

    <button class="layboka-qbtn">
    🚚 Shipping
    </button>

    <button class="layboka-qbtn">
    ⚡ Checkout
    </button>

  `;

  const qBtns =
    quick.querySelectorAll(".layboka-qbtn");

  qBtns[0].onclick = ()=>{
    sendMessage("Show best sellers");
  };

  qBtns[1].onclick = ()=>{
    sendMessage("Show offers");
  };

  qBtns[2].onclick = ()=>{
    sendMessage("Shipping times");
  };

  qBtns[3].onclick = ()=>{
    sendMessage("Help me checkout");
  };

  // ===================================
  // PRODUCT CARD DEMO
  // ===================================
  function showProduct(){

    addMessage({

      type:"product",

      title:"Premium Oversized Hoodie",

      description:
      "🔥 Trending premium cotton hoodie with ultra-soft comfort and limited stock available.",

      price:"₹1,999",

      image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200",

      url:"#"

    },"ai");

  }

  // ===================================
  // SEND MESSAGE
  // ===================================
  async function sendMessage(msg){

    if(!msg || CHAT_LOCKED){
      return;
    }

    addMessage(msg,"user");

    input.value = "";

    typing.style.display = "block";

    chat.scrollTop =
      chat.scrollHeight;

    try{

      const res =
        await fetch(
          API_BASE + "/chat",
          {

            method:"POST",

            headers:{
              "Content-Type":"application/json"
            },

            body:JSON.stringify({

              message:msg,
              clientId

            })

          }
        );

      const data =
        await res.json();

      typing.style.display =
        "none";

      addMessage(
        data.reply ||
        "😊 How can I help you today?",
        "ai"
      );

      // PRODUCT PUSH
      if(
        msg.toLowerCase().includes("product") ||
        msg.toLowerCase().includes("hoodie") ||
        msg.toLowerCase().includes("best") ||
        msg.toLowerCase().includes("show")
      ){

        setTimeout(()=>{
          showProduct();
        },700);

      }

      // SALES PUSH
      if(
        msg.toLowerCase().includes("buy") ||
        msg.toLowerCase().includes("checkout") ||
        msg.toLowerCase().includes("price")
      ){

        setTimeout(()=>{

          addMessage(
          "🚀 Complete your order today before stock runs out.",
          "ai"
          );

        },1200);

      }

    }catch(err){

      console.log(err);

      typing.style.display =
        "none";

      addMessage(
      "⚠️ AI server error. Please try again in a moment.",
      "ai"
      );

    }

  }

  // ===================================
  // SEND BUTTON
  // ===================================
  sendBtn.onclick = ()=>{

    if(input.value.trim() !== ""){

      sendMessage(
        input.value.trim()
      );

    }

  };

  // ===================================
  // ENTER SEND
  // ===================================
  input.addEventListener(
    "keypress",
    (e)=>{

      if(
        e.key === "Enter" &&
        input.value.trim() !== ""
      ){

        sendMessage(
          input.value.trim()
        );

      }

    }
  );

  // ===================================
  // GREETING
  // ===================================
  setTimeout(()=>{

    addMessage(
      "👋 Hi there! I’m your shopping assistant. Ask me about products, shipping, offers or recommendations.",
      "ai"
    );

  },1200);

  // ===================================
  // DEMO PRODUCT
  // ===================================
  setTimeout(()=>{

    showProduct();

  },3200);

  // ===================================
  // INACTIVITY SALES PUSH
  // ===================================
  document.addEventListener(
    "mousemove",
    ()=>{
      lastActivity = Date.now();
    }
  );

  setInterval(()=>{

    const inactive =
      Date.now() - lastActivity;

    if(
      inactive > 60000 &&
      opened
    ){

      addMessage(
      "🛒 Still browsing? Today's special discount may expire soon.",
      "ai"
      );

    }

  },30000);

})();
