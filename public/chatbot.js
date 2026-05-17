(function(){

  // =====================================
  // CONFIG
  // =====================================

  const API_BASE =
    "https://shopi-ai.render.com";

  let USER_PLAN = "starter";
  let CHAT_LOCKED = false;
  let lastActivity = Date.now();

  // =====================================
  // CLIENT ID
  // =====================================

  let clientId = "";

  try{

    const currentScript =
      document.currentScript;

    if(currentScript){

      const url =
        new URL(currentScript.src);

      clientId =
        url.searchParams.get("client") || "";

    }

  }catch(e){
    console.log("CLIENT ERROR:",e);
  }

  // =====================================
  // CSS
  // =====================================

  const style =
    document.createElement("style");

  style.innerHTML = `

  *{
    box-sizing:border-box;
    font-family:Poppins,sans-serif;
  }

  @keyframes layPulse{
    0%{transform:scale(1);}
    50%{transform:scale(1.08);}
    100%{transform:scale(1);}
  }

  @keyframes layFade{
    from{
      opacity:0;
      transform:translateY(10px);
    }
    to{
      opacity:1;
      transform:translateY(0);
    }
  }

  @keyframes layBounce{
    0%,80%,100%{
      transform:scale(0);
      opacity:.4;
    }
    40%{
      transform:scale(1);
      opacity:1;
    }
  }

  .layboka-btn{
    border:none;
    padding:10px 14px;
    border-radius:12px;
    background:#16213c;
    color:#fff;
    cursor:pointer;
    white-space:nowrap;
    font-size:13px;
    font-weight:600;
  }

  .layboka-card{
    background:#101c35;
    border-radius:18px;
    padding:14px;
    margin-top:12px;
    border:1px solid rgba(255,255,255,.06);
    animation:layFade .3s ease;
  }

  .layboka-card img{
    width:100%;
    height:180px;
    object-fit:cover;
    border-radius:14px;
  }

  .layboka-buy{
    width:100%;
    margin-top:12px;
    padding:14px;
    border:none;
    border-radius:14px;
    background:linear-gradient(135deg,#ff8a00,#ffbf47);
    font-weight:700;
    cursor:pointer;
  }

  .laydot{
    width:8px;
    height:8px;
    border-radius:50%;
    background:#fff;
    animation:layBounce 1s infinite;
  }

  .laydot:nth-child(2){
    animation-delay:.2s;
  }

  .laydot:nth-child(3){
    animation-delay:.4s;
  }

  `;

  document.head.appendChild(style);

  // =====================================
  // FLOAT BUTTON
  // =====================================

  const button =
    document.createElement("div");

  button.innerHTML = "💬";

  button.style = `
    position:fixed;
    right:20px;
    bottom:20px;
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
    box-shadow:0 0 35px rgba(255,140,0,.4);
    animation:layPulse 2s infinite;
  `;

  document.body.appendChild(button);

  // =====================================
  // BOX
  // =====================================

  const box =
    document.createElement("div");

  box.style = `
    position:fixed;
    right:20px;
    bottom:100px;
    width:380px;
    max-width:95%;
    height:620px;
    background:#041126;
    border-radius:28px;
    overflow:hidden;
    display:none;
    flex-direction:column;
    z-index:999999;
    border:1px solid rgba(255,255,255,.06);
    box-shadow:0 20px 60px rgba(0,0,0,.5);
  `;

  box.innerHTML = `

  <div style="
  background:linear-gradient(135deg,#ff8a00,#ffbf47);
  padding:14px 18px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  ">

    <div>

      <div style="
      font-size:18px;
      font-weight:800;
      color:#000;
      ">
      🤖 Layboka AI
      </div>

      <div style="
      font-size:12px;
      color:#111;
      margin-top:4px;
      font-weight:600;
      ">
      🟢 Live AI Sales Assistant
      </div>

    </div>

    <div id="lay-close"
    style="
    cursor:pointer;
    font-size:28px;
    color:#000;
    ">
    ✕
    </div>

  </div>

  <div id="lay-chat"
  style="
  flex:1;
  overflow:auto;
  padding:18px;
  color:#fff;
  background:#041126;
  ">
  </div>

  <div id="lay-typing"
  style="
  display:none;
  padding-left:18px;
  padding-bottom:12px;
  ">

    <div style="
    width:80px;
    padding:12px;
    border-radius:16px;
    background:#16213c;
    display:flex;
    gap:6px;
    justify-content:center;
    ">

      <div class="laydot"></div>
      <div class="laydot"></div>
      <div class="laydot"></div>

    </div>

  </div>

  <div id="lay-quick"
  style="
  padding:10px;
  display:flex;
  gap:8px;
  overflow:auto;
  background:#041126;
  ">
  </div>

  <div style="
  padding:14px;
  background:#0b1730;
  border-top:1px solid rgba(255,255,255,.06);
  display:flex;
  gap:10px;
  ">

    <input
    id="lay-input"
    placeholder="Ask something..."
    style="
    flex:1;
    padding:15px;
    border:none;
    border-radius:16px;
    outline:none;
    background:#17233f;
    color:#fff;
    ">

    <button id="lay-send"
    style="
    width:58px;
    border:none;
    border-radius:16px;
    cursor:pointer;
    background:linear-gradient(135deg,#ff8a00,#ffbf47);
    ">
    ➤
    </button>

  </div>

  `;

  document.body.appendChild(box);

  // =====================================
  // ELEMENTS
  // =====================================

  const chat =
    box.querySelector("#lay-chat");

  const input =
    box.querySelector("#lay-input");

  const sendBtn =
    box.querySelector("#lay-send");

  const typing =
    box.querySelector("#lay-typing");

  const quick =
    box.querySelector("#lay-quick");

  // =====================================
  // OPEN CLOSE
  // =====================================

  let opened = false;

  button.onclick = ()=>{

    opened = !opened;

    box.style.display =
      opened ? "flex" : "none";

  };

  box.querySelector("#lay-close")
  .onclick = ()=>{

    opened = false;

    box.style.display = "none";

  };

  // =====================================
  // ESCAPE HTML
  // =====================================

  function escapeHtml(text){

    return text
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;");
  }

  // =====================================
  // MESSAGE
  // =====================================

  function addMessage(text,type){

    const div =
      document.createElement("div");

    div.style.margin = "12px 0";

    div.style.textAlign =
      type === "user"
      ? "right"
      : "left";

    div.innerHTML = `

    <span style="
    display:inline-block;
    max-width:82%;
    padding:14px 16px;
    border-radius:20px;
    line-height:1.6;
    font-size:15px;
    background:
    ${
      type==="user"
      ? "linear-gradient(135deg,#ff8a00,#ffbf47)"
      : "#16213c"
    };
    color:
    ${
      type==="user"
      ? "#000"
      : "#fff"
    };
    ">
    ${escapeHtml(text)}
    </span>

    `;

    chat.appendChild(div);

    chat.scrollTop =
      chat.scrollHeight;

  }

  // =====================================
  // QUICK BUTTONS
  // =====================================

  const quicks = [
    "🔥 Best Sellers",
    "🎁 Offers",
    "🚚 Shipping",
    "⚡ Checkout"
  ];

  quicks.forEach((q)=>{

    const btn =
      document.createElement("button");

    btn.className =
      "layboka-btn";

    btn.innerText = q;

    btn.onclick = ()=>{

      sendMessage(q);

    };

    quick.appendChild(btn);

  });

  // =====================================
  // SEND MESSAGE
  // =====================================

  async function sendMessage(msg){

    if(!msg || CHAT_LOCKED){
      return;
    }

    addMessage(msg,"user");

    input.value = "";

    typing.style.display =
      "block";

    try{

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          ()=>controller.abort(),
          20000
        );

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
            }),

            signal:
              controller.signal
          }
        );

      clearTimeout(timeout);

      if(!res.ok){

        throw new Error(
          "API ERROR"
        );

      }

      const data =
        await res.json();

      typing.style.display =
        "none";

      addMessage(
        data.reply ||
        "😊 How can I help you today?",
        "ai"
      );

    }catch(err){

      console.log(
        "CHATBOT ERROR:",
        err
      );

      typing.style.display =
        "none";

      addMessage(
      "⚠️ Connection issue. Please try again.",
      "ai"
      );

    }

  }

  // =====================================
  // SEND BUTTON
  // =====================================

  sendBtn.onclick = ()=>{

    if(input.value.trim()){

      sendMessage(
        input.value.trim()
      );

    }

  };

  input.addEventListener(
    "keypress",
    (e)=>{

      if(
        e.key === "Enter" &&
        input.value.trim()
      ){

        sendMessage(
          input.value.trim()
        );

      }

    }
  );

  // =====================================
  // GREETING
  // =====================================

  setTimeout(()=>{

    addMessage(
      "👋 Hi! Ask me about products, shipping or offers.",
      "ai"
    );

  },1000);

})();
