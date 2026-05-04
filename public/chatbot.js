(function(){

const BASE_URL = window.location.origin;
const clientId = new URLSearchParams(window.location.search).get("client") || "demo";

// ======================
// 💬 FLOATING BUTTON
// ======================
const button = document.createElement("div");
button.innerHTML = "💬";
button.style = `
position:fixed;bottom:20px;right:20px;width:60px;height:60px;
border-radius:50%;background:#00ffc6;display:flex;align-items:center;
justify-content:center;font-size:24px;cursor:pointer;
box-shadow:0 0 20px rgba(0,255,200,0.6);z-index:9999;
`;
document.body.appendChild(button);

// ======================
// 📦 CHAT BOX
// ======================
const box = document.createElement("div");
box.style = `
position:fixed;bottom:90px;right:20px;width:340px;height:480px;
background:#0f172a;border-radius:18px;
border:1px solid rgba(0,255,204,0.2);
box-shadow:0 20px 60px rgba(0,0,0,0.6);
display:none;flex-direction:column;z-index:9999;
`;

box.innerHTML = `
<div style="padding:12px;background:#00ffc6;color:#000;font-weight:bold;border-radius:18px 18px 0 0;">
💁 Layboka Shopi Agent <span style="color:green;">● Live</span>
</div>

<div id="chat" style="flex:1;padding:10px;overflow:auto;color:white;"></div>

<div id="typing" style="display:none;padding:5px 10px;color:#aaa;font-size:12px;">
💬 Typing...
</div>

<input id="input" placeholder="Ask about products..."
style="border:none;padding:12px;width:100%;outline:none;background:#020617;color:white;">
`;

document.body.appendChild(box);

// ======================
// 🔁 TOGGLE
// ======================
let open=false;
button.onclick = ()=>{
  open=!open;
  box.style.display = open ? "flex" : "none";
};

// ======================
// 🧠 CHAT ELEMENTS
// ======================
const input = box.querySelector("#input");
const chat = box.querySelector("#chat");
const typing = box.querySelector("#typing");

// ======================
// 💬 MESSAGE UI
// ======================
function addMessage(text,type){
  const d=document.createElement("div");
  d.style.margin="6px 0";
  d.style.textAlign= type==="user"?"right":"left";

  d.innerHTML=`
  <span style="
    background:${type==="user"?"#00ffc6":"#1e293b"};
    padding:8px 12px;border-radius:14px;
    display:inline-block;max-width:80%;
  ">${text}</span>
  `;

  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
}

// ======================
// ⏳ TYPING
// ======================
function showTyping(){ typing.style.display="block"; }
function hideTyping(){ typing.style.display="none"; }

// ======================
// 🛍 PRODUCT CARD
// ======================
function addProduct(p){
  const d=document.createElement("div");

  d.innerHTML=`
  <div style="
    background:#020617;padding:10px;border-radius:12px;
    margin:10px 0;border:1px solid #111;
  ">
    <img src="${p.image}" style="width:100%;border-radius:10px;">
    <div style="margin-top:8px;font-weight:bold;">${p.title}</div>
    <div style="color:#00ffc6;">₹${p.price}</div>

    <div style="display:flex;gap:8px;margin-top:8px;">
      <a href="${p.url}" target="_blank"
      style="flex:1;text-align:center;background:#00ffc6;color:#000;padding:8px;border-radius:8px;text-decoration:none;">
      🛒 Buy
      </a>

      <button onclick="addToCart('${p.url}')"
      style="flex:1;background:#1e293b;color:#fff;border:none;border-radius:8px;">
      ➕ Cart
      </button>
    </div>
  </div>
  `;

  chat.appendChild(d);
}

// ======================
// 🛒 ADD TO CART
// ======================
window.addToCart = function(url){
  window.open(url + "?quantity=1", "_blank");

  // 📊 Track abandoned interest
  fetch(BASE_URL + "/track-cart", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ clientId })
  });
}

// ======================
// 🔥 CHECKOUT PUSH
// ======================
function showCheckout(){
  const d=document.createElement("div");

  d.innerHTML=`
  <div style="
    background:#064e3b;padding:10px;border-radius:10px;margin-top:10px;text-align:center;
  ">
    🔥 Ready to order?

    <br><br>

    <a href="/cart" target="_blank"
    style="background:#00ffc6;padding:10px;border-radius:8px;color:#000;font-weight:bold;text-decoration:none;">
    Checkout Now
    </a>
  </div>
  `;

  chat.appendChild(d);
}

// ======================
// ⚡ URGENCY CTA
// ======================
function showUrgency(){
  const d=document.createElement("div");

  d.innerHTML=`
  <div style="
    background:#7f1d1d;padding:8px;border-radius:10px;margin-top:10px;text-align:center;
  ">
    ⚡ Only few items left!
  </div>
  `;

  chat.appendChild(d);
}

// ======================
// 🤖 AI CALL
// ======================
async function getAI(msg){

  showTyping();

  try{
    const res = await fetch(BASE_URL+"/chat",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({message:msg,clientId})
    });

    const data = await res.json();

    hideTyping();

    addMessage(data.reply,"ai");

    // 🔒 LOCK UI
    if(data.locked){
      input.disabled=true;
      input.placeholder="Upgrade to continue...";
      return;
    }

    // 🛍 PRODUCTS
    if(data.products){
      data.products.forEach(p=>{
        addProduct({
          title:p.title,
          price:p.variants?.[0]?.price,
          image:p.images?.[0]?.src,
          url:"/products/"+p.handle
        });
      });
    }

    // 🔥 SALES BOOST
    showUrgency();

    // 🛒 CLOSE DEAL
    if(msg.toLowerCase().includes("buy") || msg.includes("price")){
      showCheckout();
    }

  }catch(e){
    hideTyping();
    addMessage("⚠️ Error","ai");
  }
}

// ======================
// ⌨️ SEND
// ======================
input.addEventListener("keypress",(e)=>{
  if(e.key==="Enter" && input.value.trim()){
    addMessage(input.value,"user");
    getAI(input.value);
    input.value="";
  }
});

// ======================
// 👋 GREETING
// ======================
setTimeout(()=>{
  addMessage("👋 Hi! Looking for something? I can help you find the best deals 🔥","ai");
},1000);

})();
