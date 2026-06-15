// =====================================
// chatbot.js
// Layboka AI
// Production Ready Shopify AI Widget
// US / UK / Canada Optimized
// =====================================

(function () {

  // =====================================
  // CONFIG
  // =====================================

  const API_BASE =
    "https://shopi-ai.onrender.com";

  let USER_PLAN = "starter";
  let CHAT_LOCKED = false;

  let cartItems = [];
  let viewedProducts = [];
  let recommendedProducts = [];

  let lastActivity = Date.now();

  // =====================================
  // CLIENT ID
  // =====================================

  let clientId = "";

  try {

    const currentScript =
      document.currentScript;

    if (currentScript) {

      const url =
        new URL(currentScript.src);

      clientId =
        url.searchParams.get("client") || "";

    }

  } catch (e) {

    console.log(
      "CLIENT ERROR:",
      e
    );

  }

  // =====================================
  // SESSION
  // =====================================

  const sessionId =
    localStorage.getItem(
      "lay_session"
    ) ||

    (() => {

      const id =
        "lay_" +
        Math.random()
          .toString(36)
          .substring(2);

      localStorage.setItem(
        "lay_session",
        id
      );

      return id;

    })();

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
    border-radius:20px;
    padding:14px;
    margin-top:14px;
    border:1px solid rgba(255,255,255,.06);
    animation:layFade .3s ease;
  }

  .layboka-card img{
    width:100%;
    height:190px;
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
    color:#000;
    font-size:15px;
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

  .lay-msg{
    animation:layFade .25s ease;
  }

  .lay-scroll::-webkit-scrollbar{
    width:4px;
  }

  .lay-scroll::-webkit-scrollbar-thumb{
    background:#ff8a00;
    border-radius:20px;
  }

  @media(max-width:600px){

    .lay-chatbox{
      width:100%!important;
      height:100%!important;
      right:0!important;
      bottom:0!important;
      border-radius:0!important;
      max-width:100%!important;
    }

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
    box-shadow:0 0 35px rgba(255,140,0,.4);
    animation:layPulse 2s infinite;
  `;

  document.body.appendChild(button);

  // =====================================
  // CHATBOX
  // =====================================

  const box =
    document.createElement("div");

  box.className =
    "lay-chatbox";

  box.style = `
    position:fixed;
    right:20px;
    bottom:100px;
    width:390px;
    max-width:95%;
    height:650px;
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
  padding:15px 18px;
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

      <div id="lay-status"
      style="
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
  class="lay-scroll"
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
  class="lay-scroll"
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
    placeholder="Ask about products..."
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
  // OPEN/CLOSE
  // =====================================

  let opened = false;

  button.onclick = () => {

    opened = !opened;

    box.style.display =
      opened ? "flex" : "none";

  };

  box.querySelector(
    "#lay-close"
  ).onclick = () => {

    opened = false;

    box.style.display =
      "none";

  };

  // =====================================
  // ESCAPE
  // =====================================

  function escapeHtml(text) {

    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  }

  // =====================================
  // MESSAGE
  // =====================================

  function addMessage(
    text,
    type = "ai"
  ) {

    const div =
      document.createElement("div");

    div.className =
      "lay-msg";

    div.style.margin =
      "12px 0";

    div.style.textAlign =
      type === "user"
        ? "right"
        : "left";

    div.innerHTML = `

    <span style="
    display:inline-block;
    max-width:84%;
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
  // PRODUCT CARD
  // =====================================

  function addProductCard(product) {

    if (!product) return;

    const card =
      document.createElement("div");

    card.className =
      "layboka-card";

    card.innerHTML = `

      <img src="${
        product.image ||
        "https://via.placeholder.com/300"
      }">

      <div style="
      margin-top:12px;
      font-size:17px;
      font-weight:700;
      color:#fff;
      ">
      ${escapeHtml(product.title || "")}
      </div>

      <div style="
      margin-top:6px;
      color:#ffbf47;
      font-size:18px;
      font-weight:800;
      ">
      ${escapeHtml(product.price || "")}
      </div>

      <button class="layboka-buy">
      View Product
      </button>

    `;

    const btn =
      card.querySelector(
        ".layboka-buy"
      );

    btn.onclick = () => {

      if (product.url) {

        window.open(
          product.url,
          "_blank"
        );

      }

    };

    chat.appendChild(card);

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
    "💳 Payment",
    "⚡ Fast Delivery"

  ];

  quicks.forEach((q) => {

    const btn =
      document.createElement("button");

    btn.className =
      "layboka-btn";

    btn.innerText = q;

    btn.onclick = () => {

      sendMessage(q);

    };

    quick.appendChild(btn);

  });

  // =====================================
  // TRACK EVENT
  // =====================================

  async function trackEvent(
    event,
    data = {}
  ) {

    try {

      await fetch(
        API_BASE +
        "/analytics/event",
        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            clientId,
            sessionId,
            event,
            ...data

          })

        }
      );

    } catch (e) {}

  }

  // =====================================
  // VOICE INPUT
  // =====================================

  if (
    "webkitSpeechRecognition"
    in window
  ) {

    const mic =
      document.createElement(
        "button"
      );

    mic.innerHTML = "🎤";

    mic.style = `
      width:50px;
      border:none;
      border-radius:16px;
      cursor:pointer;
      background:#16213c;
      color:#fff;
      font-size:18px;
    `;

    sendBtn.parentNode.insertBefore(
      mic,
      sendBtn
    );

    const recognition =
      new webkitSpeechRecognition();

    recognition.lang =
      "en-US";

    mic.onclick = () => {

      recognition.start();

    };

    recognition.onresult =
      (event) => {

        const text =
          event.results[0][0]
          .transcript;

        input.value = text;

      };

  }

  // =====================================
  // SEND MESSAGE
  // =====================================

  async function sendMessage(msg) {

    if (
      !msg ||
      CHAT_LOCKED
    ) {
      return;
    }

    addMessage(
      msg,
      "user"
    );

    trackEvent(
      "chat_message",
      { message:msg }
    );

    input.value = "";

    typing.style.display =
      "block";

    lastActivity =
      Date.now();

    try {

      const controller =
        new AbortController();

      const timeout =
        setTimeout(
          () =>
            controller.abort(),
          25000
        );

      const res =
        await fetch(
          API_BASE + "/chat",
          {

            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

              message:msg,

              clientId,

              viewedProducts,

              cartItems,

              sessionId

            }),

            signal:
              controller.signal

          }
        );

      clearTimeout(timeout);

      if (!res.ok) {

        throw new Error(
          "API ERROR"
        );

      }

      const data =
        await res.json();

      typing.style.display =
        "none";

      if (data.locked) {

        CHAT_LOCKED = true;

      }

      addMessage(

        data.reply ||

        "😊 How can I help you today?",

        "ai"

      );

      // =========================
      // PRODUCTS
      // =========================

      if (
        Array.isArray(
          data.products
        )
      ) {

        data.products.forEach(
          (p) => {

            addProductCard(p);

          }
        );

      }

      // =========================
      // SPEAK AI
      // =========================

      if (
        "speechSynthesis"
        in window
      ) {

        const speech =
          new SpeechSynthesisUtterance(
            data.reply || ""
          );

        speech.lang =
          "en-US";

      }

    } catch (err) {

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

  sendBtn.onclick = () => {

    if (
      input.value.trim()
    ) {

      sendMessage(
        input.value.trim()
      );

    }

  };

  input.addEventListener(
    "keypress",
    (e) => {

      if (

        e.key === "Enter" &&

        input.value.trim()

      ) {

        sendMessage(
          input.value.trim()
        );

      }

    }
  );

  // =====================================
  // PRODUCT TRACKING
  // =====================================

  function trackProducts() {

    try {

      const title =
        document.title;

      const image =
        document.querySelector(
          'meta[property="og:image"]'
        )?.content;

      const price =
        document.querySelector(
          '[class*="price"]'
        )?.innerText;

      if (
        title &&
        !viewedProducts.includes(
          title
        )
      ) {

        viewedProducts.push(
          title
        );

      }

      trackEvent(
        "product_view",
        {
          title,
          image,
          price
        }
      );

    } catch (e) {}

  }

  trackProducts();

  // =====================================
  // ABANDONED CART
  // =====================================

  async function sendCartReminder() {

    try {

      await fetch(
        API_BASE +
        "/track-cart",
        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            clientId,
            sessionId,
            cartItems

          })

        }
      );

    } catch (e) {}

  }

  // =====================================
  // EXIT INTENT
  // =====================================

  document.addEventListener(
    "mouseleave",
    (e) => {

      if (
        e.clientY < 0 &&
        opened
      ) {

        addMessage(
          "🎁 Wait! Ask me for today's best offer before leaving.",
          "ai"
        );

      }

    }
  );

  // =====================================
  // INACTIVITY AI
  // =====================================

  setInterval(() => {

    const inactive =
      Date.now() -
      lastActivity;

    if (

      inactive >

      600000 &&

      opened

    ) {

      addMessage(
        "👋 Still shopping? I can help you find the best products.",
        "ai"
      );

      lastActivity =
        Date.now();

    }

  }, 60000);

  // =====================================
  // PAGE LEAVE
  // =====================================

  window.addEventListener(
    "beforeunload",
    () => {

      sendCartReminder();

    }
  );

  // =====================================
  // GREETING
  // =====================================

  setTimeout(() => {

    addMessage(
      "👋 Hi! I can help you find products, offers, shipping details and best deals.",
      "ai"
    );

  }, 1000);

})();
