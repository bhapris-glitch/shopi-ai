// =====================================
// shopi-ai/public/chatbot.js
// Layboka AI Sales Agent
// Production Ready V4
// Part 1/10 - 3232 Lines 
// Foundation
// =====================================

(function () {

"use strict";

// =====================================
// VERSION
// =====================================

const VERSION = "4.0.0";

// =====================================
// API CONFIG
// =====================================

const API = {

    BASE:
        "https://shopi-ai.onrender.com",

    CHAT:
        "/chat",

    TRACK:
        "/analytics/event",

    CART:
        "/chat/cart-recovery",

    OPEN:
        "/chat/track-open",

    PING:
        "/chat/ping"

};
    // =====================================
// AVATAR CONFIG
// =====================================

const AVATAR = {

    mode: "female", // female | male | logo | custom

    female: {

        welcome: "/assets/avatar/female/welcome.png",
        idleOpen: "/assets/avatar/female/open.png",
        idleClosed: "/assets/avatar/female/closed.png"

    },

    male: {

        welcome: "/assets/avatar/male/welcome.png",
        idleOpen: "/assets/avatar/male/open.png",
        idleClosed: "/assets/avatar/male/closed.png"

    },

    logo: "/assets/logo.png",

    custom: ""

};
// =====================================
// CURRENT AVATAR
// =====================================

function currentAvatar(){

    if(AVATAR.mode==="female"){

        return AVATAR.female;

    }

    if(AVATAR.mode==="male"){

        return AVATAR.male;

    }

    return AVATAR.female;

}
// =====================================
// AVATAR CONTROLLER
// =====================================

const AvatarController = {

    avatar: null,
    popup: null,
    blinking: null,

    offers: [
        "👋 Welcome!",
        "🎁 Special discount waiting for you",
        "🔥 Best selling products",
        "✨ New arrivals just landed",
        "💖 Recommended for you"
    ],

    init(){

        this.avatar =
        document.querySelector(".lb-avatar");

        this.popup =
        document.querySelector(".lb-avatar-popup");

        if(!this.avatar) return;

        this.startBlink();

        this.showWelcome();

    },

    //----------------------------------

    startBlink(){

        clearInterval(this.blinking);

        this.blinking = setInterval(()=>{

            this.blink();

        },4000 + Math.random()*3000);

    },

    //----------------------------------

    blink(){

        const avatar=currentAvatar();

        if(!avatar.idleClosed) return;

        this.avatar.src=avatar.idleClosed;

        setTimeout(()=>{

            this.avatar.src=avatar.idleOpen;

        },180);

    },

    //----------------------------------

    showWelcome(){

        if(!this.popup) return;

        const offer =
        this.offers[
            Math.floor(
                Math.random()*this.offers.length
            )
        ];

        this.popup.innerHTML=offer;

        this.popup.classList.add("show");

        setTimeout(()=>{

            this.popup.classList.remove("show");

        },4500);

    },

    //----------------------------------

    wave(){

        this.avatar.classList.add("wave");

        setTimeout(()=>{

            this.avatar.classList.remove("wave");

        },1200);

    }

};
// =====================================
// CHANGE IMAGE
// =====================================

function setFloatingFace(src){

    if(!avatarFloating) return;

    avatarFloating.src = src;

}
// =====================================
// STORE SETTINGS
// =====================================

const STORE = {

    name: document.title,

    primary: "#ff8a00",

    secondary: "#16213c",

    popupDelay: 2500,

    popupDuration: 6000

};

// =====================================
// CHAT STATE
// =====================================

let USER_PLAN = "starter";

let CHAT_LOCKED = false;

let cartItems = [];

let viewedProducts = [];

let recommendedProducts = [];

let lastActivity = Date.now();

let avatarBlinkTimer = null;

let avatarFloating = null;

let welcomePopup = null;

// =====================================
// CLIENT
// =====================================

let CLIENT_ID = "";

try {

    const script =
        document.currentScript;

    if (script) {

        const url =
            new URL(script.src);

        CLIENT_ID =
            url.searchParams.get("client") || "";

    }

} catch (err) {

    console.log(err);

}

// =====================================
// SESSION
// =====================================

const STORAGE = {

    SESSION:
        "layboka_session",

    CUSTOMER:
        "layboka_customer",

    MEMORY:
        "layboka_memory",

    SETTINGS:
        "layboka_settings"

};

function createUUID() {

    return "lay_" +

        Math.random()

            .toString(36)

            .substring(2) +

        Date.now();

}

let SESSION_ID =

    localStorage.getItem(
        STORAGE.SESSION
    );

if (!SESSION_ID) {

    SESSION_ID =
        createUUID();

    localStorage.setItem(

        STORAGE.SESSION,

        SESSION_ID

    );

}

// =====================================
// MERCHANT SETTINGS
// =====================================

const SETTINGS = {

    agentName:
        "Sales Agent",

    storeName:
        "",

    themeColor:
        "#ff8a00",

    currency:
        "USD",

    country:
        "US",

    language:
        "en",

    timezone:
        Intl.DateTimeFormat()

            .resolvedOptions()

            .timeZone,

    plan:
        "starter",

    checkoutCloser:
        false,

    upsells:
        true,

    crossSells:
        true,

    cartRecovery:
        true,

    voice:
        true

};

// =====================================
// CHAT STATE
// =====================================

let CHAT_OPEN = false;

let CHAT_LOCKED = false;

let TRIAL_MODE = false;

let cartItems = [];

let viewedProducts = [];

let recommendedProducts = [];

let lastActivity = Date.now();

let typing = false;

// =====================================
// CUSTOMER
// =====================================

const CUSTOMER = {

    id: "",

    name: "",

    email: "",

    phone: ""

};

// =====================================
// CACHE
// =====================================

const CACHE = {

    products: [],

    conversation: [],

    recommendations: []

};

// =====================================
// FEATURE FLAGS
// =====================================

const FEATURES = {

    streaming: true,

    voice: true,

    notifications: true,

    countdown: true,

    analytics: true,

    abandonedCart: true,

    checkoutCloser: true,

    smartRecommendations: true

};

// =====================================
// LOGGER
// =====================================

function log(...args) {

    console.log(

        "[Layboka]",

        ...args

    );

}

// =====================================
// HTML ESCAPE
// =====================================

function escapeHTML(text) {

    return String(text || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

// =====================================
// LOCAL STORAGE
// =====================================

function save(key, value) {

    try {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    } catch (e) {}

}

function load(key, fallback = null) {

    try {

        const value =

            localStorage.getItem(key);

        if (!value) return fallback;

        return JSON.parse(value);

    } catch (e) {

        return fallback;

    }

}

// =====================================
// DEBOUNCE
// =====================================

function debounce(fn, wait = 300) {

    let timer;

    return function () {

        clearTimeout(timer);

        timer = setTimeout(

            () => fn.apply(this, arguments),

            wait

        );

    };

}

// =====================================
// THEME DETECTION
// =====================================

function detectTheme() {

    try {

        const color =

            getComputedStyle(

                document.documentElement

            )

            .getPropertyValue(

                "--color-primary"

            );

        if (color) {

            SETTINGS.themeColor =

                color.trim();

        }

    } catch (e) {}

}

// =====================================
// COUNTRY
// =====================================

function detectCountry() {

    try {

        SETTINGS.language =

            navigator.language || "en";

    } catch (e) {}

}

// =====================================
// CURRENCY
// =====================================

function detectCurrency() {

    try {

        const meta =

            document.querySelector(

                'meta[name="currency"]'

            );

        if (meta) {

            SETTINGS.currency =

                meta.content;

        }

    } catch (e) {}

}

// =====================================
// INITIALIZE
// =====================================

detectTheme();

detectCountry();

detectCurrency();

log(

    "Widget Loaded",

    VERSION,

    CLIENT_ID

);

// =====================================
// PART 1 END
// =====================================

})();
// =====================================
// CONFIG
// Production Ready - PART 2
// =====================================

// Automatically use current domain
const API_BASE =
  "https://api.layboka.com";

const WIDGET_VERSION =
  "3.0.0";

const COMPANY_NAME =
  "Layboka AI";

const DEFAULT_AGENT =
  "Sales Agent";

const REQUEST_TIMEOUT =
  25000;

// =====================================
// RUNTIME FLAGS
// =====================================

let CHAT_LOCKED = false;

let USER_PLAN = "free";

let CLIENT_ID = "";

let CONVERSATION_ID = "";

let CUSTOMER_ID = "";

let SESSION_ID = "";

let STORE_NAME = "";

let AGENT_NAME = DEFAULT_AGENT;

let TRIAL_MODE = false;

let cartItems = [];

let viewedProducts = [];

let recommendedProducts = [];

let lastActivity = Date.now();

// =====================================
// CLIENT ID
// =====================================

(function loadClientId(){

  try{

    const script =
      document.currentScript;

    if(script){

      const url =
        new URL(script.src);

      CLIENT_ID =
        url.searchParams.get("client") || "";

    }

  }catch(err){

    console.log(
      "Client Detection Error",
      err
    );

  }

})();

// =====================================
// SESSION
// =====================================

(function createSession(){

  SESSION_ID =
    localStorage.getItem(
      "layboka_session"
    );

  if(!SESSION_ID){

    SESSION_ID =
      "lay_" +
      Date.now() +
      "_" +
      Math.random()
      .toString(36)
      .substring(2,10);

    localStorage.setItem(

      "layboka_session",

      SESSION_ID

    );

  }

})();

// =====================================
// CUSTOMER ID
// =====================================

(function createCustomerId(){

  CUSTOMER_ID =
    localStorage.getItem(
      "layboka_customer"
    );

  if(!CUSTOMER_ID){

    CUSTOMER_ID =
      "cus_" +
      Math.random()
      .toString(36)
      .substring(2,12);

    localStorage.setItem(

      "layboka_customer",

      CUSTOMER_ID

    );

  }

})();

// =====================================
// VISITOR INFO
// =====================================

const Visitor = {

  language:
    navigator.language ||

    "en",

  platform:
    navigator.platform ||

    "",

  timezone:

    Intl.DateTimeFormat()

    .resolvedOptions()

    .timeZone,

  screen:

    window.screen.width +

    "x" +

    window.screen.height,

  url:

    location.href,

  referrer:

    document.referrer,

  browser:

    navigator.userAgent

};

// =====================================
// PAGE INFO
// =====================================

const Page = {

  title:
    document.title,

  path:
    location.pathname,

  host:
    location.hostname

};

// =====================================
// REQUEST HELPER
// =====================================

async function apiRequest(

  endpoint,

  payload = {}

){

  const controller =
    new AbortController();

  const timer =
    setTimeout(

      ()=>controller.abort(),

      REQUEST_TIMEOUT

    );

  try{

    const response =
      await fetch(

        API_BASE + endpoint,

        {

          method:"POST",

          headers:{

            "Content-Type":
            "application/json"

          },

          body:JSON.stringify({

            clientId:
              CLIENT_ID,

            sessionId:
              SESSION_ID,

            customerId:
              CUSTOMER_ID,

            widgetVersion:
              WIDGET_VERSION,

            page:Page,

            visitor:Visitor,

            ...payload

          }),

          signal:
            controller.signal

        }

      );

    clearTimeout(timer);

    if(!response.ok){

      throw new Error(
        "API Error"
      );

    }

    return await response.json();

  }

  catch(err){

    clearTimeout(timer);

    console.log(

      "API Request Failed",

      err

    );

    return {

      success:false,

      error:err.message

    };

  }

}

// =====================================
// ACTIVITY
// =====================================

function updateActivity(){

  lastActivity =
    Date.now();

}

document.addEventListener(
  "click",
  updateActivity
);

document.addEventListener(
  "mousemove",
  updateActivity
);

document.addEventListener(
  "keydown",
  updateActivity
);

// =====================================
// INITIAL ANALYTICS
// =====================================

apiRequest(

  "/chat/track-open",

  {

    pageTitle:
      document.title

  }

);
// =====================================
// CONFIG - Part 3A-1
// =====================================

const API_BASE =
  "https://api.layboka.com";

const CHAT_API =
  API_BASE + "/chat";

const ANALYTICS_API =
  API_BASE + "/analytics";

const CART_API =
  API_BASE + "/cart";

const TRACK_API =
  API_BASE + "/track";

const VERSION = "3.0.0";

let USER_PLAN = "starter";

let CHAT_LOCKED = false;

let AGENT_NAME = "Sales Agent";

let STORE_NAME = "";

let STORE_LOGO = "";

let STORE_CURRENCY = "USD";

let TRIAL_MODE = false;

let cartItems = [];

let viewedProducts = [];

let recommendedProducts = [];

let conversationId = null;

let sessionId = null;

let customerId = null;

let customerEmail = "";

let customerName = "";

let typing = false;

let lastActivity = Date.now();

let reconnectAttempts = 0;

const MAX_RECONNECT = 5;
// =====================================
// LOAD STORE SETTINGS
// Production Ready - Part 3A-2
// =====================================

async function loadStoreSettings() {

  try {

    const result =
      await apiRequest(

        "/widget/settings",

        {}

      );

    if (!result.success) {

      console.log(
        "Store settings unavailable"
      );

      return;

    }

    const store =
      result.store || {};

    STORE_NAME =
      store.storeDisplayName ||
      store.storeName ||
      "";

    STORE_LOGO =
      store.storeLogo || "";

    STORE_CURRENCY =
      store.currency || "USD";

    AGENT_NAME =
      store.agentName ||
      "Sales Agent";

    USER_PLAN =
      store.plan ||
      "starter";

    TRIAL_MODE =
      !!store.trialMode;

    CHAT_LOCKED =
      !!store.chatLocked;

    // ===========================
    // STATUS BAR
    // ===========================

    const status =
      document.getElementById(
        "lay-status"
      );

    if (status) {

      status.innerHTML =
        CHAT_LOCKED

          ? "🔒 Subscription Required"

          : "🟢 " +
            AGENT_NAME +
            " Online";

    }

    // ===========================
    // HEADER TITLE
    // ===========================

    const title =
      document.getElementById(
        "lay-title"
      );

    if (

      title &&

      STORE_NAME

    ) {

      title.innerHTML =
        STORE_NAME;

    }

    // ===========================
    // LOGO
    // ===========================

    const logo =
      document.getElementById(
        "lay-logo"
      );

    if (

      logo &&

      STORE_LOGO

    ) {

      logo.src =
        STORE_LOGO;

    }

  }

  catch(err){

    console.log(

      "Store Loader Error",

      err

    );

  }

}

// =====================================
// LOAD CUSTOMER SESSION
// =====================================

async function loadSession() {

  try {

    const result =
      await apiRequest(

        "/chat/session",

        {}

      );

    if (

      !result.success

    ) {

      return;

    }

    conversationId =
      result.conversationId || null;

    customerName =
      result.customerName || "";

    customerEmail =
      result.email || "";

  }

  catch(err){

    console.log(
      err
    );

  }

}

// =====================================
// INITIALIZE
// =====================================

(async function(){

  await loadStoreSettings();

  await loadSession();

})();
// =====================================
// FLOATING CHAT BUTTON - Part 3A-3
// =====================================

const chatButton =
  document.createElement("div");

chatButton.id =
  "lay-chat-button";

chatButton.innerHTML = `

<div id="lay-notification"

style="
display:none;
position:absolute;
top:-6px;
right:-6px;
width:20px;
height:20px;
background:#ff3b30;
border-radius:50%;
color:#fff;
font-size:11px;
font-weight:bold;
display:flex;
align-items:center;
justify-content:center;
">
1
</div>

💬

`;

chatButton.style = `

position:fixed;

right:22px;

bottom:22px;

width:72px;

height:72px;

border-radius:50%;

background:
linear-gradient(
135deg,
#ff8a00,
#ffbf47
);

display:flex;

align-items:center;

justify-content:center;

font-size:30px;

cursor:pointer;

z-index:999999;

box-shadow:
0 15px 45px
rgba(255,140,0,.35);

transition:.25s;

`;

document.body.appendChild(
  chatButton
);
// =====================================
// FLOATING AVATAR
// =====================================

const floatingAvatar =
document.createElement("div");

floatingAvatar.id="lb-floating-avatar";

floatingAvatar.innerHTML=`

<div class="lb-avatar-wrapper">

    <img
        class="lb-avatar"
        src="${currentAvatar().idleOpen}"
        alt="Layboka AI">

    <div class="lb-online"></div>

</div>

<div class="lb-avatar-popup">

    👋 Welcome

</div>

`;

document.body.appendChild(
    floatingAvatar
);

// ======================================
// END FLOATING AVATAR Script 
// ======================================
// =====================================
// CHAT WINDOW
// =====================================

const chatWindow =
  document.createElement("div");

chatWindow.id =
  "lay-chat-window";

chatWindow.style = `

position:fixed;

right:22px;

bottom:108px;

width:390px;

max-width:96%;

height:650px;

background:#041126;

border-radius:28px;

overflow:hidden;

display:none;

flex-direction:column;

z-index:999999;

border:1px solid
rgba(255,255,255,.08);

box-shadow:
0 20px 60px
rgba(0,0,0,.45);

`;

document.body.appendChild(
  chatWindow
);

// =====================================
// HEADER
// =====================================

chatWindow.innerHTML = `

<div id="lay-header"

style="
background:
linear-gradient(
135deg,
#ff8a00,
#ffbf47
);

padding:15px 18px;

display:flex;

justify-content:space-between;

align-items:center;
">

<div style="
display:flex;
align-items:center;
gap:12px;
">

<img

id="lay-logo"

src=""

style="
width:42px;
height:42px;
border-radius:50%;
background:#fff;
object-fit:cover;
display:none;
">

<div>

<div

id="lay-title"

style="
font-size:18px;
font-weight:700;
color:#000;
">

Layboka AI

</div>

<div

id="lay-status"

style="
font-size:12px;
font-weight:600;
margin-top:4px;
color:#111;
">

🟢 Loading...

</div>

</div>

</div>

<div

id="lay-close"

style="
cursor:pointer;
font-size:28px;
color:#000;
">

✕

</div>

</div>

`;
// =====================================
// CHAT BODY - Part 3A -4
// =====================================

chatWindow.innerHTML += `

<div

id="lay-chat"

class="lay-scroll"

style="
flex:1;
overflow-y:auto;
padding:18px;
background:#041126;
color:#fff;
">

</div>

<div

id="lay-typing"

style="
display:none;
padding:0 18px 14px 18px;
">

<div

style="
width:82px;
padding:12px;
background:#16213c;
border-radius:18px;
display:flex;
justify-content:center;
gap:6px;
">

<div class="laydot"></div>
<div class="laydot"></div>
<div class="laydot"></div>

</div>

</div>

<div

id="lay-quick"

class="lay-scroll"

style="
padding:10px;
display:flex;
gap:8px;
overflow-x:auto;
background:#041126;
border-top:1px solid rgba(255,255,255,.05);
">

</div>

<div

style="
padding:14px;
background:#0b1730;
display:flex;
gap:10px;
align-items:center;
border-top:1px solid rgba(255,255,255,.06);
">

<input

id="lay-input"

type="text"

placeholder="Ask anything..."

style="
flex:1;
padding:15px;
background:#17233f;
border:none;
border-radius:16px;
color:#fff;
outline:none;
font-size:14px;
">

<button

id="lay-mic"

style="
width:48px;
height:48px;
border:none;
border-radius:14px;
cursor:pointer;
background:#16213c;
color:#fff;
font-size:18px;
">

🎤

</button>

<button

id="lay-send"

style="
width:54px;
height:48px;
border:none;
border-radius:14px;
cursor:pointer;
font-size:18px;
font-weight:bold;
background:
linear-gradient(
135deg,
#ff8a00,
#ffbf47
);
color:#000;
">

➤

</button>

</div>

`;

// =====================================
// ELEMENTS
// =====================================

const chat =
document.getElementById(
"lay-chat"
);

const typingBox =
document.getElementById(
"lay-typing"
);

const quickBox =
document.getElementById(
"lay-quick"
);

const input =
document.getElementById(
"lay-input"
);

const sendButton =
document.getElementById(
"lay-send"
);

const micButton =
document.getElementById(
"lay-mic"
);

const closeButton =
document.getElementById(
"lay-close"
);

// =====================================
// QUICK REPLIES
// =====================================

const QUICK_BUTTONS = [

"🔥 Best Sellers",

"🎁 Today's Offers",

"🚚 Shipping",

"💳 Payment Options",

"⭐ New Arrivals",

"📦 Track Order"

];

// =====================================
// CREATE QUICK BUTTONS
// =====================================

QUICK_BUTTONS.forEach((text)=>{

  const btn =
    document.createElement("button");

  btn.className =
    "layboka-btn";

  btn.innerText = text;

  btn.onclick = ()=>{

    sendMessage(text);

  };

  quickBox.appendChild(btn);

});

// =====================================
// OPEN / CLOSE CHAT
// =====================================

let chatOpened = false;

chatButton.onclick = ()=>{

  chatOpened = !chatOpened;

  chatWindow.style.display =

    chatOpened

      ? "flex"

      : "none";

  if(chatOpened){

    input.focus();

  }

};

closeButton.onclick = ()=>{

  chatOpened = false;

  chatWindow.style.display = "none";

};

// =====================================
// ENTER KEY
// =====================================

input.addEventListener(

  "keypress",

  function(e){

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
// SEND BUTTON
// =====================================

sendButton.onclick = ()=>{

  if(

    input.value.trim()

  ){

    sendMessage(

      input.value.trim()

    );

  }

};

// =====================================
// VOICE INPUT
// =====================================

if(

  "webkitSpeechRecognition"

  in window

){

  const recognition =

    new webkitSpeechRecognition();

  recognition.lang = "en-US";

  recognition.continuous = false;

  recognition.interimResults = false;

  micButton.onclick = ()=>{

    recognition.start();

  };

  recognition.onresult =

    function(event){

      input.value =

        event.results[0][0]

        .transcript;

    };

}

// =====================================
// CHAT SCROLL
// =====================================

function scrollBottom(){

  chat.scrollTop =

    chat.scrollHeight;

  }
// =====================================
// MESSAGE BUBBLE - Part 3 B 1
// =====================================

function addMessage(

  text,

  sender = "ai"

){

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "lay-msg";

  wrapper.style.margin =
    "14px 0";

  wrapper.style.display =
    "flex";

  wrapper.style.justifyContent =

    sender === "user"

      ? "flex-end"

      : "flex-start";

  const bubble =
    document.createElement("div");

  bubble.style.maxWidth = "85%";

  bubble.style.padding =
    "14px 16px";

  bubble.style.borderRadius =
    "18px";

  bubble.style.lineHeight =
    "1.6";

  bubble.style.fontSize =
    "15px";

  bubble.style.whiteSpace =
    "pre-wrap";

  bubble.style.wordBreak =
    "break-word";

  if(sender === "user"){

    bubble.style.background =
      "linear-gradient(135deg,#ff8a00,#ffbf47)";

    bubble.style.color = "#000";

    bubble.style.fontWeight = "600";

  }else{

    bubble.style.background =
      "#16213c";

    bubble.style.color = "#ffffff";

  }

  bubble.innerHTML =
    escapeHtml(text);

  wrapper.appendChild(bubble);

  chat.appendChild(wrapper);

  scrollBottom();

}

// =====================================
// AGENT MESSAGE
// =====================================

function addAgentMessage(

  text

){

  addMessage(

    text,

    "ai"

  );

  // =====================================
  // AVATAR SPEAK
  // =====================================

  if(

    typeof LivingAssistant !==
    "undefined"

  ){

    LivingAssistant.speak(

      text

    );

  }

}

// =====================================
// CUSTOMER MESSAGE
// =====================================

function addCustomerMessage(

  text

){

  addMessage(

    text,

    "user"

  );

}

// =====================================
// SHOW TYPING
// =====================================

function showTyping(){

  typing.style.display =
    "block";

  scrollBottom();

}

// =====================================
// HIDE TYPING
// =====================================

function hideTyping(){

  typing.style.display =
    "none";

}

// =====================================
// CLEAR CHAT
// =====================================

function clearChat(){

  chat.innerHTML = "";

}

// =====================================
// SYSTEM NOTICE
// =====================================

function addSystemNotice(

  text

){

  const div =
    document.createElement("div");

  div.style.margin =
    "18px auto";

  div.style.padding =
    "10px 16px";

  div.style.background =
    "rgba(255,255,255,.08)";

  div.style.color =
    "#d1d5db";

  div.style.fontSize =
    "12px";

  div.style.borderRadius =
    "12px";

  div.style.width =
    "fit-content";

  div.innerHTML =
    escapeHtml(text);

  chat.appendChild(div);

  scrollBottom();

}
// =====================================
// PRODUCT CARD Part 3 B -2
// =====================================

function addProductCard(product){

  if(!product) return;

  const card =
    document.createElement("div");

  card.className =
    "layboka-card";

  card.innerHTML = `

    <img

      src="${
        product.image ||

        "https://via.placeholder.com/500x500"
      }"

      loading="lazy"

    >

    <div style="
      margin-top:14px;
      font-size:17px;
      font-weight:700;
      color:#fff;
    ">

      ${escapeHtml(
        product.title || ""
      )}

    </div>

    <div style="
      margin-top:8px;
      color:#ffbf47;
      font-size:20px;
      font-weight:800;
    ">

      ${escapeHtml(
        product.price || ""
      )}

    </div>

    <div style="
      margin-top:8px;
      color:#9ca3af;
      font-size:13px;
    ">

      ${escapeHtml(
        product.vendor || ""
      )}

    </div>

    <button

      class="layboka-buy"

    >

      🛒 View Product

    </button>

  `;

  card

    .querySelector(".layboka-buy")

    .onclick = ()=>{

      if(product.url){

        window.open(

          product.url,

          "_blank"

        );

      }

    };

  chat.appendChild(card);

  scrollBottom();

}

// =====================================
// MULTIPLE PRODUCTS
// =====================================

function addProducts(products=[]){

  if(!products.length) return;

  products.forEach((product)=>{

    addProductCard(product);

  });

}

// =====================================
// OFFER CARD
// =====================================

function addOfferCard(

  title,

  description,

  buttonText,

  url

){

  const card =
    document.createElement("div");

  card.className =
    "layboka-card";

  card.innerHTML = `

    <div style="
      font-size:18px;
      font-weight:800;
      color:#fff;
    ">

      ${escapeHtml(title)}

    </div>

    <div style="
      margin-top:10px;
      color:#d1d5db;
      line-height:1.6;
    ">

      ${escapeHtml(description)}

    </div>

    <button

      class="layboka-buy"

      style="
      margin-top:18px;
      "

    >

      ${escapeHtml(buttonText)}

    </button>

  `;

  card

    .querySelector(".layboka-buy")

    .onclick = ()=>{

      if(url){

        window.open(

          url,

          "_blank"

        );

      }

    };

  chat.appendChild(card);

  scrollBottom();

}

// =====================================
// CHECKOUT BUTTON
// =====================================

function addCheckoutButton(){

  const wrapper =
    document.createElement("div");

  wrapper.style.margin =
    "16px 0";

  wrapper.innerHTML = `

    <button

      style="
      width:100%;
      padding:16px;
      border:none;
      border-radius:16px;
      cursor:pointer;
      font-size:16px;
      font-weight:700;
      color:#000;

      background:
      linear-gradient(
      135deg,
      #00ffc3,
      #00aaff
      );

      box-shadow:
      0 12px 35px
      rgba(0,255,200,.25);

      "

    >

      ⚡ Complete Checkout

    </button>

  `;

  wrapper

    .querySelector("button")

    .onclick = ()=>{

      location.href =
        "/checkout";

    };

  chat.appendChild(wrapper);

  scrollBottom();

}
// =====================================
// TRIAL BANNER Part 3 B -3
// =====================================

function showTrialBanner(data){

  if(!data) return;

  if(!data.trialMode) return;

  const banner =
    document.createElement("div");

  banner.id =
    "lay-trial-banner";

  banner.style = `
    background:linear-gradient(
      135deg,
      #ff8a00,
      #ffbf47
    );
    color:#000;
    padding:12px;
    text-align:center;
    font-size:13px;
    font-weight:700;
  `;

  banner.innerHTML = `

    ⭐ You're using the
    Premium AI Sales Agent Trial

    <br>

    <span id="lay-countdown">

    </span>

  `;

  chat.prepend(banner);

  startTrialCountdown(
    data.trialEnds
  );

}

// =====================================
// COUNTDOWN
// =====================================

function startTrialCountdown(

  trialEnds

){

  if(!trialEnds) return;

  const counter =
    document.getElementById(
      "lay-countdown"
    );

  if(!counter) return;

  setInterval(()=>{

    const diff =
      new Date(trialEnds)
      -
      new Date();

    if(diff<=0){

      counter.innerHTML =
      "Trial Expired";

      return;

    }

    const d =
      Math.floor(
        diff/86400000
      );

    const h =
      Math.floor(
        (diff%86400000)/3600000
      );

    const m =
      Math.floor(
        (diff%3600000)/60000
      );

    counter.innerHTML =

      `Ends in ${d}d ${h}h ${m}m`;

  },60000);

}

// =====================================
// 24 HOUR WARNING
// =====================================

function showRenewReminder(){

  addSystemNotice(

"⏰ Your Premium AI trial expires within 24 hours."

  );

  addOfferCard(

"Continue Your AI Sales Agent",

"Upgrade now to keep your AI Sales Agent, customer memory, smart upsells and checkout optimization active.",

"Upgrade Now",

"/pricing"

  );

}

// =====================================
// TRIAL EXPIRED
// =====================================

function showTrialExpired(){

  CHAT_LOCKED = true;

  clearChat();

  addSystemNotice(

"Your 7-day Premium Trial has ended."

  );

  addOfferCard(

"Unlock Layboka AI",

"Upgrade to continue using your AI Sales Agent with GPT-5, smart recommendations, abandoned cart recovery and unlimited conversations.",

"Choose Premium Plan",

"/pricing"

  );

}

// =====================================
// CUSTOMER RATING
// =====================================

function showRatingRequest(){

  addOfferCard(

"⭐⭐⭐⭐⭐",

"How was your 7-day Premium AI experience? We'd love your feedback.",

"Rate Your Experience",

"/review"

  );

}
// =====================================
// AGENT NAME - PART 3B -4
// =====================================

let AGENT_NAME =
  "Layboka AI";

function setAgentName(name){

  if(

    name &&

    String(name).trim()

  ){

    AGENT_NAME =
      String(name).trim();

  }

}

// =====================================
// WELCOME MESSAGE
// =====================================

function showWelcomeMessage(

  storeName = ""

){

  const greeting =

`👋 Hi, I'm ${AGENT_NAME}.

Welcome to ${storeName || "our store"}.

I'm here to help you:

🛍 Find products

🎁 Discover today's offers

🚚 Shipping information

💳 Payment questions

⚡ Recommend the perfect product

What are you looking for today?`;

  addAgentMessage(
    greeting
  );

}

// =====================================
// EXIT INTENT
// =====================================

function showExitOffer(){

  if(CHAT_LOCKED) return;

  addOfferCard(

    "🎁 Before You Leave",

    "Wait! I may have a better deal or product recommendation for you.",

    "Show Today's Offer",

    "/collections/all"

  );

}

// =====================================
// INACTIVITY REMINDER
// =====================================

function inactivityReminder(){

  if(CHAT_LOCKED) return;

  addAgentMessage(

`${AGENT_NAME} is still here 😊

Need help choosing the right product?`

  );

}

// =====================================
// CART REMINDER
// =====================================

function cartReminder(){

  if(

    CHAT_LOCKED ||

    !cartItems ||

    !cartItems.length

  ){

    return;

  }

  addAgentMessage(

`🛒 You still have ${cartItems.length} item(s) in your cart.

Need help before checkout?`

  );

  addCheckoutButton();

}

// =====================================
// RESUME CONVERSATION
// =====================================

function resumeConversation(){

  const lastMessage =

    localStorage.getItem(

      "lay_last_message"

    );

  if(lastMessage){

    addSystemNotice(

      "Conversation Restored"

    );

    addAgentMessage(

      lastMessage

    );

  }

}

// =====================================
// SAVE LAST MESSAGE
// =====================================

function saveConversation(

  message

){

  if(!message) return;

  localStorage.setItem(

    "lay_last_message",

    message

  );

}

// =====================================
// PREMIUM GREETING
// =====================================

function premiumGreeting(){

  if(USER_PLAN !== "premium"){

    return;

  }

  addSystemNotice(

"⭐ Premium AI Sales Agent Enabled"

  );

}

// =====================================
// ACTIVITY TIMER
// =====================================

setInterval(()=>{

  const idle =

    Date.now() -

    lastActivity;

  if(

    chatOpened &&

    idle > 600000

  ){

    inactivityReminder();

    lastActivity =

      Date.now();

  }

},60000);

// =====================================
// EXIT DETECTION
// =====================================

document.addEventListener(

  "mouseleave",

  function(e){

    if(

      e.clientY < 0 &&

      chatOpened

    ){

      showExitOffer();

    }

  }

);

// =====================================
// CART TIMER
// =====================================

setInterval(()=>{

  if(

    cartItems &&

    cartItems.length

  ){

    cartReminder();

  }

},900000);
// =====================================
// SHOPIFY PRODUCT DETECTION Part 3C-1
// =====================================

function detectProductPage(){

  try{

    if(

      !window.Shopify ||

      !window.meta

    ){

      return null;

    }

    const product =
      window.meta.product;

    if(!product){

      return null;

    }

    return {

      id:
        product.id,

      title:
        product.title,

      handle:
        product.handle,

      vendor:
        product.vendor,

      type:
        product.type

    };

  }catch(err){

    return null;

  }

}

// =====================================
// SHOPIFY CART DETECTION
// =====================================

async function loadCart(){

  try{

    const res =
      await fetch("/cart.js");

    const cart =
      await res.json();

    cartItems =
      cart.items || [];

    return cartItems;

  }catch(err){

    console.log(
      "Cart Error:",
      err
    );

    return [];

  }

}

// =====================================
// PRODUCT VIEW TRACKING
// =====================================

async function trackProductView(){

  const product =
    detectProductPage();

  if(!product){

    return;

  }

  viewedProducts.push(product);

  await trackEvent(

    "product_view",

    {

      productId:
        product.id,

      title:
        product.title,

      vendor:
        product.vendor,

      handle:
        product.handle

    }

  );

}

// =====================================
// CART TRACKING
// =====================================

async function trackCart(){

  await loadCart();

  await trackEvent(

    "cart_update",

    {

      items:
        cartItems.length

    }

  );

}

// =====================================
// PAGE VIEW
// =====================================

async function trackPageView(){

  await trackEvent(

    "page_view",

    {

      url:
        location.pathname,

      title:
        document.title

    }

  );

}

// =====================================
// INITIAL TRACKING
// =====================================

async function initializeTracking(){

  await trackPageView();

  await trackProductView();

  await trackCart();

}
// =====================================
// LOAD STORE CONFIG Part 3C-2
// =====================================

async function loadStoreConfig(){

  try{

    const response = await fetch(

      `${API_BASE}/client/widget/${clientId}`

    );

    if(!response.ok){

      throw new Error("Config Error");

    }

    const data = await response.json();

    // ===============================
    // AGENT NAME
    // ===============================

    if(data.agentName){

      setAgentName(
        data.agentName
      );

    }

    // ===============================
    // STORE NAME
    // ===============================

    window.LAY_STORE_NAME =

      data.storeName ||

      "Our Store";

    // ===============================
    // PLAN
    // ===============================

    USER_PLAN =

      data.plan ||

      "starter";

    // ===============================
    // TRIAL
    // ===============================

    if(data.trial){

      showTrialBanner({

        trialMode:true,

        trialEnds:data.trialEnds

      });

    }

    // ===============================
    // 24 HOURS REMINDER
    // ===============================

    if(data.showRenewReminder){

      showRenewReminder();

    }

    // ===============================
    // EXPIRED
    // ===============================

    if(data.trialExpired){

      showTrialExpired();

    }

    // ===============================
    // PREMIUM
    // ===============================

    if(USER_PLAN==="premium"){

      premiumGreeting();

    }

    // ===============================
    // WELCOME
    // ===============================

    showWelcomeMessage(

      window.LAY_STORE_NAME

    );

    return data;

  }

  catch(err){

    console.log(

      "Store Config Error:",

      err

    );

    showWelcomeMessage();

    return null;

  }

}

// =====================================
// LOAD CONVERSATION
// =====================================

async function loadConversation(){

  try{

    const response = await fetch(

      `${API_BASE}/chat/history/${sessionId}`

    );

    if(!response.ok){

      return;

    }

    const data =

      await response.json();

    if(

      data.messages &&

      data.messages.length

    ){

      data.messages.forEach(

        (message)=>{

          if(

            message.sender==="customer"

          ){

            addUserMessage(

              message.message

            );

          }

          else{

            addAgentMessage(

              message.message

            );

          }

        }

      );

    }

  }

  catch(err){

    console.log(

      "History Error:",

      err

    );

  }

}

// =====================================
// INITIALIZE STORE
// =====================================

async function initializeStore(){

  await initializeTracking();

  await loadStoreConfig();

  await loadConversation();

        }
// =====================================
// SEND CHAT REQUEST Part 3C-3
// =====================================

async function askAI(message){

  if(

    CHAT_LOCKED ||

    !message ||

    !message.trim()

  ){

    return;

  }

  addUserMessage(message);

  lastActivity = Date.now();

  showTyping();

  try{

    const response = await fetch(

      `${API_BASE}/chat`,

      {

        method:"POST",

        headers:{

          "Content-Type":
          "application/json"

        },

        body:JSON.stringify({

          clientId,

          sessionId,

          message,

          cartItems,

          viewedProducts

        })

      }

    );

    hideTyping();

    if(!response.ok){

      throw new Error(
        "Chat API Error"
      );

    }

    const data =
      await response.json();

    // ==========================
    // LOCK
    // ==========================

    if(data.locked){

      CHAT_LOCKED = true;

    }

    // ==========================
    // REPLY
    // ==========================

    if(data.reply){

      addAgentMessage(
        data.reply
      );

      saveConversation(
        data.reply
      );

    }

    // ==========================
    // PRODUCTS
    // ==========================

    if(

      Array.isArray(
        data.products
      )

    ){

      addProducts(
        data.products
      );

    }

    // ==========================
    // CHECKOUT
    // ==========================

    if(data.checkout){

      addCheckoutButton();

    }

  }

  catch(err){

    hideTyping();

    console.log(
      err
    );

    addAgentMessage(

      "⚠️ Connection problem. Please try again."

    );

  }

}

// =====================================
// SEND BUTTON
// =====================================

sendBtn.onclick = ()=>{

  const text =
    input.value.trim();

  if(!text) return;

  input.value="";

  askAI(text);

};

// =====================================
// ENTER KEY
// =====================================

input.addEventListener(

  "keypress",

  function(e){

    if(e.key==="Enter"){

      sendBtn.click();

    }

  }

);

// =====================================
// AUTO CART REFRESH
// =====================================

setInterval(

  async ()=>{

    await loadCart();

  },

  30000

);

// =====================================
// STARTUP
// =====================================

(async function(){

  await initializeStore();

  console.log(

    "✅ Layboka AI Widget Loaded"

  );

})();
// =====================================
// THEME + AVATAR LOADER
// Part 3C-4
// =====================================

let STORE_SETTINGS = {};

async function loadStoreSettings() {

  try {

    const res = await fetch(

      `${API_BASE}/widget/settings/${clientId}`

    );

    if (!res.ok) return;

    STORE_SETTINGS = await res.json();

    // ==========================
    // Theme
    // ==========================

    document.documentElement.style.setProperty(

      "--lay-primary",

      STORE_SETTINGS.primaryColor || "#ff8a00"

    );

    document.documentElement.style.setProperty(

      "--lay-secondary",

      STORE_SETTINGS.secondaryColor || "#ffbf47"

    );

    document.documentElement.style.setProperty(

      "--lay-chat-bg",

      STORE_SETTINGS.chatBackground || "#041126"

    );

    document.documentElement.style.setProperty(

      "--lay-text",

      STORE_SETTINGS.textColor || "#ffffff"

    );

    // ==========================
    // Agent Name
    // ==========================

    const agentName =

      STORE_SETTINGS.agentName ||

      "Emma";

    const status =

      document.getElementById("lay-status");

    if (status) {

      status.innerHTML =

`🟢 ${agentName} is online`;

    }

    // ==========================
    // Avatar
    // ==========================

    const avatar =

      document.getElementById("lay-avatar");

    if (avatar) {

      avatar.src =

        STORE_SETTINGS.avatar ||

        "/avatars/female.png";

    }

  } catch (err) {

    console.log(

      "Theme Load Error:",

      err

    );

  }

}

// =====================================
// WELCOME BANNER
// =====================================

function showWelcomeBanner() {

  if (

    sessionStorage.getItem(

      "lay_welcome"

    )

  ) {

    return;

  }

  sessionStorage.setItem(

    "lay_welcome",

    "1"

  );

  const banner =

    document.createElement("div");

  banner.style = `

position:fixed;
right:100px;
bottom:100px;
background:white;
padding:14px 18px;
border-radius:18px;
box-shadow:0 15px 45px rgba(0,0,0,.25);
z-index:999998;
font-size:14px;
font-weight:600;
max-width:260px;
animation:layFade .35s ease;

`;

  banner.innerHTML = `

👋 Welcome!

Need help choosing the perfect product?

`;

  document.body.appendChild(

    banner

  );

  setTimeout(() => {

    banner.remove();

  }, 6000);

}

// =====================================
// LOAD SETTINGS
// =====================================

loadStoreSettings();

showWelcomeBanner();

// =====================================
//***************************
// PART 3D-1.               "
// FLOATING AVATAR ENGINE.  *
// =====================================

const FloatingAvatar = {

    root:null,

    image:null,

    popup:null,

    online:null,

    opened:false,

    //----------------------------------

    init(){

        this.create();

    },

    //----------------------------------

    create(){

        this.root=document.createElement("div");

        this.root.id="lay-avatar";

        this.root.innerHTML=`

<div class="lay-avatar-wrapper">

    <img
        class="lay-avatar-image"
        src="${currentAvatar().idleOpen}"
        draggable="false">

    <div class="lay-avatar-online"></div>

</div>

<div class="lay-avatar-popup">

    👋 Welcome

</div>

`;

        document.body.appendChild(
            this.root
        );

        this.image=
        this.root.querySelector(
            ".lay-avatar-image"
        );

        this.popup=
        this.root.querySelector(
            ".lay-avatar-popup"
        );

        this.online=
        this.root.querySelector(
            ".lay-avatar-online"
        );

    },

    //----------------------------------

    set(src){

        if(!this.image) return;

        this.image.src=src;

    },

    //----------------------------------

    hide(){

        if(this.root){

            this.root.style.display="none";

        }

    },

    //----------------------------------

    show(){

        if(this.root){

            this.root.style.display="block";

        }

    }

};

// =====================================
// INITIALIZE
// =====================================

FloatingAvatar.init();


// =====================================
// PART 3D-2
// BLINK ENGINE
// =====================================

const BlinkEngine={

    timer:null,

    running:false,

    //----------------------------------

    start(){

        if(this.running) return;

        this.running=true;

        this.schedule();

    },

    //----------------------------------

    stop(){

        clearTimeout(this.timer);

        this.running=false;

    },

    //----------------------------------

    schedule(){

        const delay=
            2500+
            Math.random()*3500;

        this.timer=setTimeout(()=>{

            this.blink();

        },delay);

    },

    //----------------------------------

    blink(){

        if(!FloatingAvatar.image){

            this.schedule();

            return;

        }

        FloatingAvatar.set(
            currentAvatar().idleClosed
        );

        setTimeout(()=>{

            FloatingAvatar.set(
                currentAvatar().idleOpen
            );

            this.schedule();

        },180);

    }

};

// =====================================
// START BLINKING
// =====================================

BlinkEngine.start();

// =====================================
// PART 3D-3
// SMART WELCOME POPUP
// =====================================

const WelcomePopup={

    showing:false,

    timer:null,

    messages:[

        {
            icon:"👋",
            title:"Welcome",
            text:"I'm your AI shopping assistant."
        },

        {
            icon:"🎁",
            title:"Today's Offer",
            text:"Ask me for today's best deals."
        },

        {
            icon:"🔥",
            title:"Best Sellers",
            text:"See what customers love most."
        },

        {
            icon:"✨",
            title:"New Arrivals",
            text:"Discover the latest products."
        },

        {
            icon:"💎",
            title:"Recommended",
            text:"I'll help you find the perfect products."
        }

    ],

    //----------------------------------

    show(){

        if(this.showing) return;

        if(!FloatingAvatar.popup) return;

        this.showing=true;

        const data=

            this.messages[
                Math.floor(
                    Math.random()*
                    this.messages.length
                )
            ];

        FloatingAvatar.popup.innerHTML=`

<div class="lay-popup-card">

<div class="lay-popup-icon">
${data.icon}
</div>

<div class="lay-popup-content">

<div class="lay-popup-title">
${data.title}
</div>

<div class="lay-popup-text">
${data.text}
</div>

</div>

</div>

`;

        FloatingAvatar.popup.classList.add(
            "show"
        );

        clearTimeout(this.timer);

        this.timer=setTimeout(()=>{

            this.hide();

        },5500);

    },

    //----------------------------------

    hide(){

        FloatingAvatar.popup.classList.remove(
            "show"
        );

        this.showing=false;

    }

};

// =====================================
// SHOW AFTER STORE LOAD
// =====================================

setTimeout(()=>{

    WelcomePopup.show();

},2500);

// =====================================
// PART 3D-4
// AVATAR GREETING ENGINE
// =====================================

const AvatarGreeting={

    started:false,

    //----------------------------------

    start(){

        if(this.started) return;

        this.started=true;

        this.enter();

    },

    //----------------------------------

    enter(){

        if(!FloatingAvatar.root) return;

        FloatingAvatar.root.classList.add(
            "lay-avatar-enter"
        );

        setTimeout(()=>{

            this.wave();

        },700);

    },

    //----------------------------------

    wave(){

        if(!FloatingAvatar.image) return;

        FloatingAvatar.image.classList.add(
            "lay-avatar-wave"
        );

        setTimeout(()=>{

            FloatingAvatar.image.classList.remove(
                "lay-avatar-wave"
            );

            this.blink();

        },1800);

    },

    //----------------------------------

    blink(){

        FloatingAvatar.set(
            currentAvatar().idleClosed
        );

        setTimeout(()=>{

            FloatingAvatar.set(
                currentAvatar().idleOpen
            );

        },180);

    },

    //----------------------------------

    greet(){

        if(!FloatingAvatar.popup) return;

        FloatingAvatar.popup.classList.add(
            "show"
        );

        setTimeout(()=>{

            FloatingAvatar.popup.classList.remove(
                "show"
            );

        },4500);

    }

};

// =====================================
// START GREETING
// =====================================

setTimeout(()=>{

    AvatarGreeting.start();

},1200);

// =====================================
// PART 3D-5
// Dynamic OFFER POPUP ENGINE
// public/chatbot.js - LAYBOKA AI
// =====================================

const OfferPopup={

    showing:false,

    timer:null,

    //----------------------------------

    async show(){

        if(this.showing) return;

        this.showing=true;

        try{

            const res=
            await fetch(

                `${API.BASE}/products/highlights?clientId=${clientId}`

            );

            const data=
            await res.json();

            if(

                !data ||

                !Array.isArray(data.products)

            ){

                this.showDefault();

                return;

            }

            this.render(
                data.products
            );

        }catch(e){

            this.showDefault();

        }

    },

    //----------------------------------

    showDefault(){

        this.render([

            {
                title:"🔥 Best Sellers"
            },

            {
                title:"🎁 Today's Offer"
            },

            {
                title:"✨ New Arrival"
            }

        ]);

    },

    //----------------------------------

    render(products){

        if(!FloatingAvatar.popup) return;

        let html=
        `<div class="lb-offer-title">

Today's Picks

</div>`;

        products
        .slice(0,3)
        .forEach(p=>{

            html+=`

<div class="lb-offer-item">

${p.image ?

`<img src="${p.image}">`

:

`<div class="lb-offer-placeholder">

🛍

</div>`

}

<div class="lb-offer-name">

${p.title}

</div>

</div>

`;

        });

        FloatingAvatar.popup.innerHTML=html;

        FloatingAvatar.popup.classList.add(
            "show"
        );

        clearTimeout(this.timer);

        this.timer=setTimeout(()=>{

            this.hide();

        },6500);

    },

    //----------------------------------

    hide(){

        FloatingAvatar.popup.classList.remove(
            "show"
        );

        this.showing=false;

    }

};

// =====================================
// START POPUP
// =====================================

setTimeout(()=>{

    OfferPopup.show();

},3500);

// =====================================
// PART 3E-1
// Layboka AI 
// LIVING AI ASSISTANT
// =====================================

const LivingAssistant={

    speaking:false,

    breathing:null,

    //----------------------------------

    init(){

        this.startBreathing();

    },

    //----------------------------------

    startBreathing(){

        if(!FloatingAvatar.root) return;

        this.breathing=setInterval(()=>{

            FloatingAvatar.root.classList.add(
                "lb-breath"
            );

            setTimeout(()=>{

                FloatingAvatar.root.classList.remove(
                    "lb-breath"
                );

            },1200);

        },2800);

    },

    //----------------------------------

    async speak(text){

        if(this.speaking) return;

        this.speaking=true;

        if(FloatingAvatar.image){

            FloatingAvatar.image.classList.add(
                "lb-speaking"
            );

        }

        if(

            "speechSynthesis"

            in window

        ){

            try{

                speechSynthesis.cancel();

                const voice=

                new SpeechSynthesisUtterance(
                    text
                );

                voice.lang="en-US";

                voice.rate=1;

                voice.pitch=1;

                speechSynthesis.speak(
                    voice
                );

            }catch(e){}

        }

        setTimeout(()=>{

            if(FloatingAvatar.image){

                FloatingAvatar.image.classList.remove(
                    "lb-speaking"
                );

            }

            this.speaking=false;

        },2500);

    }

};

// =====================================
// INITIALIZE
// =====================================

LivingAssistant.init();

